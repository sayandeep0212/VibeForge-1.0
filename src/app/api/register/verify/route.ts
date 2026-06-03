import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

const registrationSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
  registrationData: z.object({
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
    amount: z.number(),
    totalAmount: z.number().optional(),
    processingFee: z.number().optional(),
    receipt: z.string(),
  }),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(apiLimiter, ip);
  
  if (!limit.success) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  try {
    const body = await req.json();
    const validated = registrationSchema.parse(body);

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, registrationData } = validated;

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Server-side university rule enforcement:
    // This verify route only handles PAID (non-Adamas) registrations.
    // Ensure no Adamas student is being added to a non-Adamas team.
    for (const member of registrationData.members) {
      const memberSnap = await adminDb.ref(`users/${member.firebaseId}`).get();
      if (memberSnap.exists()) {
        const memberData = memberSnap.val();
        if (memberData.isAdamas) {
          return NextResponse.json(
            { error: 'Cannot add Adamas University students to a non-Adamas team. Adamas students register separately for free.' },
            { status: 400 }
          );
        }
      }
    }

    // Save to Firebase Admin
    const finalData = {
      ...registrationData,
      payment: {
        razorpayId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: registrationData.amount,
        totalAmount: registrationData.totalAmount || registrationData.amount,
        processingFee: registrationData.processingFee || 0,
        status: 'paid',
        receipt: registrationData.receipt,
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
      const leader = registrationData.members.find(m => m.firebaseId === registrationData.leaderId) || registrationData.members[0];
      const allEmails = registrationData.members.map(m => m.email);
      
      // Send to each member
      await Promise.all(registrationData.members.map(member => 
        resend.emails.send({
          from: 'GameLiminals Tech Team <registrations@vibeforge-1-0.tech>',
          to: member.email,
          subject: 'Registration Successful - VibeForge 1.0',
          template: {
            id: process.env.RESEND_PENDING_TEMPLATE_ID!,
            variables: {
              teamName: registrationData.teamName,
              leaderName: member.name,
              registrationId: newRegRef.key || 'N/A',
              amount: registrationData.amount,
            },
          },
        })
      ));
    } catch (emailError) {
      console.error('Error sending registration emails:', emailError);
    }

    return NextResponse.json({ success: true, registrationId: newRegRef.key });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation errors:', error.issues);
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Error verifying registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
