import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';

export async function PATCH(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(apiLimiter, ip);
  
  if (!limit.success) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, phone, photoURL } = await req.json();

    await adminDb.ref(`admins/${session.user.id}`).update({
      name,
      phone,
      photoURL,
    });

    // Update session
    session.user.name = name;
    await session.save();

    return NextResponse.json({ success: true, user: session.user });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
