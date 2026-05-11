import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const registrationsRef = adminDb.ref('registrations');
    const registrationsSnap = await registrationsRef
      .orderByChild('checkedIn')
      .equalTo(true)
      .once('value');

    if (!registrationsSnap.exists()) {
      return NextResponse.json([], {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    const data = registrationsSnap.val();
    if (!data || typeof data !== 'object') {
      return NextResponse.json([]);
    }

    const logs = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).sort((a, b) => (Number(b.checkedInAt) || 0) - (Number(a.checkedInAt) || 0));

    return NextResponse.json(logs, {
      headers: { 'Cache-Control': 'no-store' }
    });
  } catch (error) {
    console.error('Fetch check-in logs error:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array on error to prevent UI crash
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    await adminDb.ref(`registrations/${id}`).update({
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete check-in log error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
