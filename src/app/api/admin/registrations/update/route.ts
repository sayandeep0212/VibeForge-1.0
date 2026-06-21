import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request) {
  const session = await getSession();

  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { registrationId, updates } = body;

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
    }

    const regRef = adminDb.ref(`registrations/${registrationId}`);
    const snapshot = await regRef.get();

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    const currentReg = snapshot.val();

    // Build the update object — only include fields that were actually sent
    const dbUpdates: Record<string, any> = {};

    if (updates.teamName !== undefined) {
      dbUpdates.teamName = updates.teamName;
    }

    if (updates.status !== undefined) {
      dbUpdates.status = updates.status;
      // Clear passId if rejected
      if (updates.status === 'rejected') {
        dbUpdates.passId = '';
      }
    }

    if (updates.members !== undefined) {
      dbUpdates.members = updates.members;
      // Update leader info based on the first member (leader)
      if (updates.members.length > 0) {
        dbUpdates.leaderId = updates.members[0].firebaseId;
        dbUpdates.leaderUid = updates.members[0].uid;
      }
      // Update type based on member count
      dbUpdates.type = updates.members.length > 1 ? 'team' : 'individual';
    }

    if (updates.payment !== undefined) {
      // Merge with existing payment data
      dbUpdates.payment = {
        ...currentReg.payment,
        ...updates.payment,
      };
    }

    // Track who made the edit
    dbUpdates.lastEditedAt = Date.now();
    dbUpdates.lastEditedBy = session.user.email;

    await regRef.update(dbUpdates);

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
    });
  } catch (error) {
    console.error('Update registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
