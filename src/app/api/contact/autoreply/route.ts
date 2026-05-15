import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  
  // Basic rate limiting to prevent email spam and DB abuse
  const limit = await checkRateLimit(apiLimiter, ip);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    // 1. Save to Firebase via Admin SDK (Bypasses client-side blockers and rules)
    let inquiryId = null;
    try {
      const inquiryRef = adminDb.ref('inquiries');
      const newInquiryRef = inquiryRef.push();
      inquiryId = newInquiryRef.key;
      await newInquiryRef.set({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        status: 'new',
        createdAt: Date.now(),
        source: 'api_submit'
      });
    } catch (dbError) {
      console.error('Database save error:', dbError);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // 2. Trigger Automated Email Reply
    try {
      await resend.emails.send({
        from: 'GameLiminals Tech Team <tech@vibeforge-1-0.tech>',
        to: trimmedEmail,
        subject: `Request Received: ${trimmedName}, our team is on it!`,
        template: {
          id: process.env.RESEND_INQUIRY_TEMPLATE_ID!,
          variables: {
            name: trimmedName,
            message: trimmedMessage
          }
        }
      });
    } catch (emailErr) {
      console.error('Failed to send automated reply:', emailErr);
      // We don't fail the whole request if the email fails, 
      // because the inquiry is already safely in the database.
    }

    return NextResponse.json({ success: true, id: inquiryId });
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
