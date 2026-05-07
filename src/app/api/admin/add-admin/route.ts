import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { checkRateLimit, apiLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(apiLimiter, ip);
  
  if (!limit.success) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdminRef = adminDb.ref('admins').push();
    
    await newAdminRef.set({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: Date.now(),
      phone: '',
      photoURL: '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
