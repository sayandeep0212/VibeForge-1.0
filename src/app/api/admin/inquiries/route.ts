import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'admin:inquiries';
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
          'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
          'X-Cache': 'HIT',
        },
      });
    }

    const snap = await adminDb.ref('inquiries').get();
    const result = snap.val() || {};

    // Store in Redis
    await cacheSet(CACHE_KEY, result, CACHE_TTL);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { inquiryId, status } = await req.json();
    await adminDb.ref(`inquiries/${inquiryId}`).update({ status });

    // Invalidate cache after mutation
    await cacheDel(CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    
    await adminDb.ref(`inquiries/${id}`).remove();

    // Invalidate cache after mutation
    await cacheDel(CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
