import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    const cleanId = id.trim().toUpperCase();
    
    // Search by bookingId
    const bookingSnap = await adminDb.ref('registrations')
      .orderByChild('bookingId')
      .equalTo(cleanId)
      .get();

    let registration = null;
    let regKey = null;

    if (bookingSnap.exists()) {
      regKey = Object.keys(bookingSnap.val())[0];
      registration = bookingSnap.val()[regKey];
    } else {
      // Search by passId
      const passSnap = await adminDb.ref('registrations')
        .orderByChild('passId')
        .equalTo(cleanId)
        .get();
      
      if (passSnap.exists()) {
        regKey = Object.keys(passSnap.val())[0];
        registration = passSnap.val()[regKey];
      }
    }

    if (!registration) {
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
    }

    return NextResponse.json({ id: regKey, ...registration });
  } catch (error) {
    console.error('Check-in search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { regId } = await req.json();

    if (!regId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    await adminDb.ref(`registrations/${regId}`).update({
      checkedIn: true,
      checkedInAt: Date.now(),
      checkedInBy: session.user.name,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Check-in update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
