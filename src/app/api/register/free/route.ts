import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

const freeRegistrationSchema = z.object({
  teamName: z.string().min(2),
  type: z.enum(['individual', 'team']),
  leaderId: z.string(),
  leaderUid: z.string(),
  members: z.array(z.object({
    firebaseId: z.string(),
    uid: z.string(),
    name: z.string(),
    email: z.string().email(),
  })),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(apiLimiter, ip);
  
  if (!limit.success) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validated = freeRegistrationSchema.parse(body);

    // Server-side university rule enforcement:
    // This route only handles FREE (Adamas) registrations.
    for (const member of validated.members) {
      const memberSnap = await adminDb.ref(`users/${member.firebaseId}`).get();
      if (memberSnap.exists()) {
        const memberData = memberSnap.val();
        if (!memberData.isAdamas) {
          return NextResponse.json(
            { error: 'Cannot add non-Adamas students to an Adamas team. Free registration is only for Adamas students.' },
            { status: 400 }
          );
        }
      }
    }

    // Save to Firebase Admin
    const finalData = {
      ...validated,
      payment: {
        method: 'free',
        amount: 0,
        status: 'free_adamas',
        razorpayId: 'FREE-ADAMAS',
        receipt: 'N/A',
        paidAt: Date.now(),
      },
      status: 'pending_approval',
      passId: '',
      createdAt: Date.now(),
    };

    const newRegRef = adminDb.ref('registrations').push();
    await newRegRef.set(finalData);

    // Send confirmation emails
    try {
      await Promise.all(validated.members.map(member => 
        resend.emails.send({
          from: 'GameLiminals Tech Team <registrations@vibeforge-1-0.tech>',
          to: member.email,
          subject: 'Registration Successful - VibeForge 1.0',
          template: {
            id: process.env.RESEND_PENDING_TEMPLATE_ID!,
            variables: {
              teamName: validated.teamName,
              leaderName: member.name,
              registrationId: newRegRef.key || 'N/A',
              amount: 0,
            },
          },
        })
      ));
    } catch (emailError) {
      console.error('Error sending free registration emails:', emailError);
    }

    return NextResponse.json({ success: true, registrationId: newRegRef.key });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation errors:', error.issues);
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Error in free registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
