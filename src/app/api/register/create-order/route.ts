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

    // Apply Razorpay processing fee: charge user extra so full amount reaches us
    const baseAmount = amount;
    const totalAmount = Math.ceil(baseAmount / 0.9764);
    const processingFee = totalAmount - baseAmount;

    const options = {
      amount: totalAmount * 100, // Amount in paise (total with processing fee)
      currency,
      receipt: `RCPT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    const rzp = getRazorpay();
    const order = await rzp.orders.create(options);
    return NextResponse.json({ ...order, baseAmount, totalAmount, processingFee });
  } catch (error) {
    console.error('Error creating order:', error);
    if (error instanceof z.ZodError) {
      console.log('Validation errors:', error.issues);
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
