import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { cacheGet, cacheSet } from '@/lib/redis';

const CACHE_KEY = 'merch:settings';
const CACHE_TTL = 120; // 2 minutes

const DEFAULT_SETTINGS = {
  tshirtPrice: 499,
  capPrice: 299,
  merchEnabled: true,
  stock: {
    tshirt: { black: true, white: true, lavender: true },
    cap: { black: true, white: true, lavender: true }
  }
};

export async function GET() {
  try {
    // Try Redis cache first
    const cached = await cacheGet(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
          'Vercel-CDN-Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      });
    }

    // Cache miss — fetch from Firebase
    const snap = await adminDb.ref('settings/merch').once('value');
    const settings = snap.val() || DEFAULT_SETTINGS;
    
    // Ensure all fields exist (merge with defaults)
    const finalSettings = {
      ...DEFAULT_SETTINGS,
      ...settings,
      stock: {
        tshirt: { ...DEFAULT_SETTINGS.stock.tshirt, ...settings?.stock?.tshirt },
        cap: { ...DEFAULT_SETTINGS.stock.cap, ...settings?.stock?.cap }
      }
    };

    // Store in Redis
    await cacheSet(CACHE_KEY, finalSettings, CACHE_TTL);
    
    return NextResponse.json(finalSettings, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching merch settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    await adminDb.ref('settings/merch').update({
      ...data,
      updatedAt: Date.now()
    });

    // Invalidate cache after mutation
    const { cacheDel } = await import('@/lib/redis');
    await cacheDel(CACHE_KEY);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating merch settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
