import { NextResponse } from 'next/server';
import { getIronSession, IronSessionData } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
    
    if (!session.user || !session.user.isLoggedIn) {
      return NextResponse.json({ isLoggedIn: false });
    }

    return NextResponse.json({ isLoggedIn: true, user: session.user });
  } catch (error) {
    console.error('Session check error:', error);
    // Return false instead of error to handle unauthenticated state gracefully
    return NextResponse.json({ isLoggedIn: false });
  }
}
