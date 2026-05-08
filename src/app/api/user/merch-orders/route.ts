import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing UID' }, { status: 400 });
    }

    // Fetch all and filter manually to avoid query issues
    const snap = await adminDb.ref('merch_orders').once('value');
    const allOrders = snap.val() || {};
    
    const ordersArray = Object.keys(allOrders)
      .map(key => ({ id: key, ...allOrders[key] }))
      .filter(order => order.uid === uid)
      .sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(ordersArray);
  } catch (error) {
    console.error('Error fetching user merch orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
