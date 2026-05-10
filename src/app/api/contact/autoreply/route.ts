import { NextResponse } from 'next/server';
import { resend } from '@/lib/resend';
import { InquiryAutoReplyEmail } from '@/components/emails/InquiryAutoReply';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  
  // Basic rate limiting to prevent email spam
  const limit = await checkRateLimit(apiLimiter, ip);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'GameLiminals Tech Team <tech@vibeforge-1-0.tech>',
      to: email,
      subject: `Request Received: ${name}, our team is on it!`,
      template: {
        id: process.env.RESEND_INQUIRY_TEMPLATE_ID!,
        variables: {
          name: name,
          message: message
        }
      }
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send automated reply' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Inquiry autoreply error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
