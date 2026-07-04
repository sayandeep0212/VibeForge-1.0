import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session.user || !session.user.isLoggedIn || !session.user.id) {
      return NextResponse.json({ isLoggedIn: false });
    }

    // Reuse cached token if it's less than 30 minutes old
    const now = Date.now();
    let token = session.cachedToken;
    if (!token || !session.tokenGeneratedAt || now - session.tokenGeneratedAt > 30 * 60 * 1000) {
      token = await adminAuth.createCustomToken(session.user.id);
      session.cachedToken = token;
      session.tokenGeneratedAt = now;
      await session.save();
    }

    return NextResponse.json({ 
      isLoggedIn: true, 
      user: session.user,
      token: token
    });
  } catch (error) {
    console.error('Session check error:', error);
    // Return false instead of error to handle unauthenticated state gracefully
    return NextResponse.json({ isLoggedIn: false });
  }
}
