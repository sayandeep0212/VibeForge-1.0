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

    // Generate a fresh custom token for client-side Firebase Auth sync
    const token = await adminAuth.createCustomToken(session.user.id);

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
