import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const snap = await adminDb.ref(`merch_orders/${id}`).once('value');
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ id, ...snap.val() });
  } catch (error) {
    console.error('Error fetching merch order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
