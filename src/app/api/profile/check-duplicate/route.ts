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

    const usersSnap = await adminDb.ref('users').get();

    if (!usersSnap.exists()) {
      // No users at all, nothing is duplicated
      return NextResponse.json({ duplicate: false });
    }

    const allUsers = usersSnap.val();

    for (const uid in allUsers) {
      if (uid === currentUserId) continue; // skip the submitting user
      const u = allUsers[uid];

      if (u.phone && u.phone === phone.trim()) {
        return NextResponse.json({
          duplicate: true,
          field: 'phone',
          message: 'This phone number is already registered by another student.',
        });
      }

      if (
        registrationNumber &&
        registrationNumber.trim() &&
        u.registrationNumber &&
        u.registrationNumber === registrationNumber.trim()
      ) {
        return NextResponse.json({
          duplicate: true,
          field: 'registrationNumber',
          message: 'This Adamas registration number is already registered by another student.',
        });
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
