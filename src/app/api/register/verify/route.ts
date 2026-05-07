import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';

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

    // Save to Firebase Admin
    const finalData = {
      ...registrationData,
      payment: {
        razorpayId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: registrationData.amount,
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
