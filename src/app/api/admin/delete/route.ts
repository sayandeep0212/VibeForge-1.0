import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('id');

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (adminId === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Delete the admin from the database
    await adminDb.ref(`admins/${adminId}`).remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
