import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { checkRateLimit, authLimiter } from '@/lib/rate-limit';

export async function PATCH(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(authLimiter, ip);
  
  if (!limit.success) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await req.json();

    const adminSnap = await adminDb.ref(`admins/${session.user.id}`).get();
    if (!adminSnap.exists()) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const adminData = adminSnap.val();
    const isMatch = await bcrypt.compare(oldPassword, adminData.password);
    
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await adminDb.ref(`admins/${session.user.id}`).update({
      password: hashedPassword,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
