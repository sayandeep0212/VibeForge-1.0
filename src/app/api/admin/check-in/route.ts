import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session.user?.isLoggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const cleanId = id.trim().toUpperCase();
    
    // Search by bookingId using once('value') which is more reliable in some environments
    const registrationsRef = adminDb.ref('registrations');
    const bookingSnap = await registrationsRef
      .orderByChild('bookingId')
      .equalTo(cleanId)
      .once('value');

    let registration = null;
    let regKey = null;

    if (bookingSnap.exists()) {
      const data = bookingSnap.val();
      regKey = Object.keys(data)[0];
      registration = data[regKey];
    } else {
      // Search by passId
      const passSnap = await registrationsRef
        .orderByChild('passId')
        .equalTo(cleanId)
        .once('value');
      
      if (passSnap.exists()) {
        const data = passSnap.val();
        regKey = Object.keys(data)[0];
        registration = data[regKey];
      }
    }

    if (!registration) {
      return NextResponse.json({ error: 'Pass not found' }, { status: 404 });
    }

    // Only teams selected in the online round (status: approved) can check in
    if (registration.status !== 'approved') {
      return NextResponse.json({ 
        error: 'This registration is not approved. Only teams selected in the online round can check in.' 
      }, { status: 400 });
    }

    return NextResponse.json({ id: regKey, ...registration });
  } catch (error: any) {
    console.error('Check-in search error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message || 'Unknown error' 
    }, { status: 500 });
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
