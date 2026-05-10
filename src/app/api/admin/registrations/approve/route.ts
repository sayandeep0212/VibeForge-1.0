import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getSession } from '@/lib/session';
import { resend } from '@/lib/resend';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session.user || !session.user.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registrationId } = await req.json();
    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const regRef = adminDb.ref(`registrations/${registrationId}`);
    const snapshot = await regRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const registration = snapshot.val();
    
    // Generate pass and booking IDs if they don't exist
    const passId = registration.passId || `PASS-${nanoid(6).toUpperCase()}`;
    const bookingId = registration.bookingId || `BOOK-${nanoid(8).toUpperCase()}`;

    // Update status
    await regRef.update({
      status: 'approved',
      passId,
      bookingId,
      approvedAt: Date.now(),
      approvedBy: session.user.email
    });

    // Send approval emails
    try {
      await Promise.all(registration.members.map((member: any) => 
        resend.emails.send({
          from: 'GameLiminals Tech Team <registrations@vibeforge-1-0.tech>',
          to: member.email,
          subject: 'Registration Approved! - VibeForge 1.0',
          template: {
            id: process.env.RESEND_APPROVED_TEMPLATE_ID!,
            variables: {
              teamName: registration.teamName,
              leaderName: member.name,
              passId: passId,
              bookingId: bookingId,
              members: registration.members.map((m: any) => ({ name: m.name, uid: m.uid })),
            },
          },
        })
      ));
    } catch (emailError) {
      console.error('Error sending approval emails:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration approved and email sent',
      passId,
      bookingId
    });
  } catch (error) {
    console.error('Error approving registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
