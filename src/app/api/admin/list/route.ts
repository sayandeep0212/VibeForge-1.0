import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { cacheGet, cacheSet } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'admin:list';
const CACHE_TTL = 120; // 2 minutes

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

    const result = { admins: adminsList };

    // Store in Redis
    await cacheSet(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('List admins error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
