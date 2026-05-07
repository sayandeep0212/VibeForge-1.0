import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';
import { checkRateLimit, authLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const limit = await checkRateLimit(authLimiter, ip);
  
  if (!limit.success) {
    return NextResponse.json({ error: `Too many failed attempts. Try again in ${limit.retryAfter}s.` }, { status: 429 });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Search for admin in Realtime Database
    const adminsSnap = await adminDb.ref('admins').orderByChild('email').equalTo(cleanEmail).get();
    
    if (!adminsSnap.exists()) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const adminsData = adminsSnap.val();
    const adminId = Object.keys(adminsData)[0];
    const adminUser = adminsData[adminId];

    if (!adminUser.password) {
      return NextResponse.json({ error: 'Invalid account configuration' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session
    const session = await getSession();
    session.user = {
      id: adminId,
      email: adminUser.email,
      name: adminUser.name,
      isLoggedIn: true,
    };
    await session.save();

    return NextResponse.json({ success: true, user: session.user });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
