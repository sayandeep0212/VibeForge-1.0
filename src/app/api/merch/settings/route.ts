import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

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
    
    return NextResponse.json(finalSettings, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating merch settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
