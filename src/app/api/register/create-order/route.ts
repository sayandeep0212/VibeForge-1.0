import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

let razorpay: Razorpay | null = null;

function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }
  return razorpay;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(apiLimiter, ip);
  
  if (!limit.success) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  try {
    const { amount, currency = 'INR' } = await req.json();

    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: `RCPT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    const rzp = getRazorpay();
    const order = await rzp.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      console.log('Validation errors:', error.issues);
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
