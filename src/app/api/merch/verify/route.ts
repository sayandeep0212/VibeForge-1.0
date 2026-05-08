import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const merchOrderSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
  orderData: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    productType: z.enum(['t-shirt', 'cap']),
    color: z.string(),
    size: z.string().optional(),
    amount: z.number(),
    receipt: z.string(),
    uid: z.string().optional(),
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
    const validated = merchOrderSchema.parse(body);

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderData } = validated;

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Save to Firebase Admin
    const finalData = {
      ...orderData,
      payment: {
        razorpayId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: 'paid',
        paidAt: Date.now(),
      },
      status: 'completed',
      createdAt: Date.now(),
    };

    const newOrderRef = adminDb.ref('merch_orders').push();
    await newOrderRef.set(finalData);

    return NextResponse.json({ success: true, orderId: newOrderRef.key });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    console.error('Error verifying merch payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
