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
    const snapshot = await adminDb.ref('admins').once('value');
    const adminsData = snapshot.val() || {};
    
    // Map the admins, removing sensitive information like password
    const adminsList = Object.keys(adminsData).map(id => ({
      id,
      name: adminsData[id].name,
      email: adminsData[id].email,
      photoURL: adminsData[id].photoURL,
      phone: adminsData[id].phone,
      createdAt: adminsData[id].createdAt,
    }));

    // Sort by name
    adminsList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return NextResponse.json({ admins: adminsList }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('List admins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
