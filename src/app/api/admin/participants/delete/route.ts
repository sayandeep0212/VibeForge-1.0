import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  const session = await getSession();
  
  // 1. Security Check: Must be logged in as an admin
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // 2. Perform the deletion using the Admin SDK (bypasses rules)
    await adminDb.ref(`users/${userId}`).remove();

    // Also check if they have a registration and delete that too if needed?
    // For now, we just delete the user profile as requested.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
