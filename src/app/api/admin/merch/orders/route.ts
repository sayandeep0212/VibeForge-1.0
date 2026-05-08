import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await adminDb.ref('merch_orders').once('value');
    const orders = snap.val() || {};
    
    // Convert object to array and sort by createdAt
    const ordersArray = Object.keys(orders).map(key => ({
      id: key,
      ...orders[key]
    })).sort((a, b) => b.createdAt - a.createdAt);

    return NextResponse.json(ordersArray);
  } catch (error) {
    console.error('Error fetching merch orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    await adminDb.ref(`merch_orders/${id}`).remove();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting merch order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, ...data } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    await adminDb.ref(`merch_orders/${id}`).update(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating merch order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
