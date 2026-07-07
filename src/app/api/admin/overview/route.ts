import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { cacheGet, cacheSet } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'admin:overview';
const CACHE_TTL = 60; // 1 minute

export async function GET() {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Try Redis cache first
    const cached = await cacheGet(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        },
      });
    }

    // Cache miss — fetch all required nodes in parallel from Firebase
    const [usersSnap, regsSnap, inqsSnap] = await Promise.all([
      adminDb.ref('users').get(),
      adminDb.ref('registrations').get(),
      adminDb.ref('inquiries').get(),
    ]);

    const users = usersSnap.val() || {};
    const regs = regsSnap.val() || {};
    const inqs = inqsSnap.val() || {};

    // Calculate User Stats
    let totalUsers = Object.keys(users).length;
    let adamasStudents = 0;
    let otherStudents = 0;
    let shortlistedUsers = 0;

    Object.values(users).forEach((u: any) => {
      if (u.isAdamas) adamasStudents++;
      else otherStudents++;
      if (u.shortlisted) shortlistedUsers++;
    });

    // Calculate Registration Stats
    let totalRegistrations = Object.keys(regs).length;
    let pendingApprovals = 0;
    let approvedTeams = 0;
    let shortlistedTeams = 0;
    let checkedInTeams = 0;

    Object.values(regs).forEach((r: any) => {
      if (r.status === 'pending_approval') pendingApprovals++;
      if (r.status === 'approved') approvedTeams++;
      if (r.shortlisted) shortlistedTeams++;
      if (r.checkedIn) checkedInTeams++;
    });

    // Calculate Inquiry Stats
    let newInquiries = 0;
    Object.values(inqs).forEach((i: any) => {
      if (i.status === 'new') newInquiries++;
    });

    const result = {
      totalUsers,
      totalRegistrations,
      pendingApprovals,
      approvedTeams,
      adamasStudents,
      otherStudents,
      shortlistedUsers,
      shortlistedTeams,
      checkedInTeams,
      newInquiries,
    };

    // Store in Redis
    await cacheSet(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        'CDN-Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
