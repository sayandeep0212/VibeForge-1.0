import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const requestSchema = z.object({
  phone: z.string().min(10),
  registrationNumber: z.string().optional(),
  currentUserId: z.string(), // Firebase Auth UID of the submitting user
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(apiLimiter, ip);

  if (!limit.success) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${limit.retryAfter}s.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { phone, registrationNumber, currentUserId } = requestSchema.parse(body);

    // 1. Check phone duplicate with indexed query
    const phoneSnap = await adminDb.ref('users')
      .orderByChild('phone')
      .equalTo(phone.trim())
      .limitToFirst(2) // Need at most 2 to check if someone ELSE has it
      .once('value');

    if (phoneSnap.exists()) {
      const matches = phoneSnap.val();
      const otherUser = Object.keys(matches).find(uid => uid !== currentUserId);
      if (otherUser) {
        return NextResponse.json({
          duplicate: true,
          field: 'phone',
          message: 'This phone number is already registered by another student.',
        });
      }
    }

    // 2. Check registrationNumber duplicate with indexed query
    if (registrationNumber && registrationNumber.trim()) {
      const regSnap = await adminDb.ref('users')
        .orderByChild('registrationNumber')
        .equalTo(registrationNumber.trim())
        .limitToFirst(2)
        .once('value');

      if (regSnap.exists()) {
        const matches = regSnap.val();
        const otherUser = Object.keys(matches).find(uid => uid !== currentUserId);
        if (otherUser) {
          return NextResponse.json({
            duplicate: true,
            field: 'registrationNumber',
            message: 'This Adamas registration number is already registered by another student.',
          });
        }
      }
    }

    return NextResponse.json({ duplicate: false });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error checking duplicates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
