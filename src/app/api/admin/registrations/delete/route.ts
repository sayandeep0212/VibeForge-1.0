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
    const regId = searchParams.get('id');

    if (!regId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    await adminDb.ref(`registrations/${regId}`).remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
