import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';

const CACHE_KEY = 'admin:merch:orders';
const CACHE_TTL = 60; // 1 minute

export async function GET() {
  // Auth check — merch orders are admin-only
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

    const snap = await adminDb.ref('merch_orders').once('value');
    const orders = snap.val() || {};
    
    // Convert object to array and sort by createdAt
    const ordersArray = Object.keys(orders).map(key => ({
      id: key,
      ...orders[key]
    })).sort((a, b) => b.createdAt - a.createdAt);

    // Store in Redis
    await cacheSet(CACHE_KEY, ordersArray, CACHE_TTL);

    return NextResponse.json(ordersArray, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching merch orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    await adminDb.ref(`merch_orders/${id}`).remove();

    // Invalidate cache after mutation
    await cacheDel(CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting merch order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    await adminDb.ref(`merch_orders/${id}`).update(data);

    // Invalidate cache after mutation
    await cacheDel(CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating merch order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
