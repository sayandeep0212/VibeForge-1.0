'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, Download, Trash2, Edit2, 
  CheckCircle, X, Loader2, Filter, FileText, 
  Table as TableIcon, Save, XCircle, AlertCircle,
  Mail, Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';

interface MerchOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  productType: 't-shirt' | 'cap';
  color: string;
  size?: string;
  amount: number;
  payment: {
    razorpayId: string;
    orderId: string;
    paidAt: number;
    status: string;
  };
  status: string;
  createdAt: number;
  uid?: string;
}

export default function AdminMerchPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [orders, setOrders] = useState<MerchOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<MerchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 't-shirt' | 'cap'>('all');
  
  // Price & Stock Settings
  const [prices, setPrices] = useState({ 
    tshirtPrice: 499, 
    capPrice: 299,
    merchEnabled: true,
    stock: {
      tshirt: { black: true, white: true, lavender: true },
      cap: { black: true, white: true, lavender: true }
    }
  });
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [priceSuccess, setPriceSuccess] = useState(false);

  // Edit Modal
  const [editingOrder, setEditingOrder] = useState<MerchOrder | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  useEffect(() => {
    checkSession();
    fetchData();
  }, []);

  useEffect(() => {
    let result = orders;
    if (filterType !== 'all') {
      result = result.filter(o => o.productType === filterType);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.name.toLowerCase().includes(q) || 
        o.email.toLowerCase().includes(q) || 
        o.phone.includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.uid && o.uid.toLowerCase().includes(q))
      );
    }
    setFilteredOrders(result);
  }, [searchQuery, filterType, orders]);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/session');
      const data = await res.json();
      if (!data.isLoggedIn) router.push('/admin');
      else setAdminSession(data.user);
    } catch (err) {
      router.push('/admin');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/merch/orders'),
        fetch('/api/merch/settings')
      ]);
      const ordersData = await ordersRes.json();
      const settingsData = await settingsRes.json();
      
      if (!ordersData.error) setOrders(ordersData);
      if (!settingsData.error) setPrices(settingsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrices(true);
    try {
      const res = await fetch('/api/merch/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prices),
      });
      if (res.ok) {
        setPriceSuccess(true);
        setTimeout(() => setPriceSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving prices:', err);
    } finally {
      setIsSavingPrices(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      const res = await fetch(`/api/admin/merch/orders?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsUpdatingOrder(true);
    try {
      const res = await fetch('/api/admin/merch/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOrder),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === editingOrder.id ? editingOrder : o));
        setEditingOrder(null);
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const exportData = (type: 'excel' | 'csv' | 'json') => {
    const dataToExport = filteredOrders.map(o => ({
      'Order ID': o.id,
      'Date': new Date(o.createdAt).toLocaleString(),
      'Name': o.name,
      'Email': o.email,
      'Phone': o.phone,
      'Product': o.productType.toUpperCase(),
      'Color': o.color,
      'Size': o.size || 'N/A',
      'Amount': o.amount,
      'Payment ID': o.payment.razorpayId,
      'Status': o.status
    }));

    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Merch Orders');
      XLSX.writeFile(wb, `merch_orders_${Date.now()}.xlsx`);
    } else if (type === 'csv') {
      try {
        const parser = new Parser();
        const csv = parser.parse(dataToExport);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `merch_orders_${Date.now()}.csv`;
        link.click();
      } catch (err) {
        console.error('Error exporting CSV:', err);
      }
    } else if (type === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `merch_orders_${Date.now()}.json`;
      link.click();
    }
  };

  const handleLogout = () => router.push('/admin');

  const inventory = getInventoryStats();

  function getInventoryStats() {
    const tshirts = orders.filter(o => o.productType === 't-shirt');
    const caps = orders.filter(o => o.productType === 'cap');

    const tshirtColors: Record<string, number> = {};
    const tshirtSizes: Record<string, number> = {};
    const capColors: Record<string, number> = {};

    tshirts.forEach(o => {
      tshirtColors[o.color] = (tshirtColors[o.color] || 0) + 1;
      if (o.size) tshirtSizes[o.size] = (tshirtSizes[o.size] || 0) + 1;
    });

    caps.forEach(o => {
      capColors[o.color] = (capColors[o.color] || 0) + 1;
    });

    return { tshirtColors, tshirtSizes, capColors };
  }

  if (!adminSession) return null;

  return (
    <AdminLayout onLogout={handleLogout} adminName={adminSession.name}>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1 uppercase">
              MERCH <span className="text-yellow-300">MANAGEMENT</span>
            </h1>
            <p className="text-neutral-500 text-sm">Manage prices and track merchandise orders</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => exportData('excel')}
              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-xs font-bold border border-green-500/20 transition-all"
            >
              <TableIcon className="w-4 h-4" /> EXCEL
            </button>
            <button 
              onClick={() => exportData('csv')}
              className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl text-xs font-bold border border-blue-500/20 transition-all"
            >
              <FileText className="w-4 h-4" /> CSV
            </button>
            <button 
              onClick={() => exportData('json')}
              className="flex items-center gap-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 px-4 py-2 rounded-xl text-xs font-bold border border-purple-500/20 transition-all"
            >
              <div className="font-mono">{`{ }`}</div> JSON
            </button>
          </div>
        </div>

        {/* Top Section: Price Settings & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Price Management */}
          <div className="lg:col-span-1 bg-neutral-900/50 border border-white/5 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-yellow-300" />
              Store Settings
            </h2>
            <form onSubmit={handleUpdatePrices} className="space-y-6">
              {/* Global Switch */}
              <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-white/5">
                <div>
                  <p className="text-white font-bold text-sm">Store Status</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Enable/Disable all purchases</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrices({ ...prices, merchEnabled: !prices.merchEnabled })}
                  className={`w-12 h-6 rounded-full transition-all relative ${prices.merchEnabled ? 'bg-green-500' : 'bg-neutral-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prices.merchEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-2 block">T-Shirt (₹)</label>
                  <input
                    type="number"
                    value={prices.tshirtPrice || ''}
                    onChange={(e) => setPrices({ ...prices, tshirtPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-300/50"
                  />
                </div>
                <div>
                  <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold mb-2 block">Cap (₹)</label>
                  <input
                    type="number"
                    value={prices.capPrice || ''}
                    onChange={(e) => setPrices({ ...prices, capPrice: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-yellow-300/50"
                  />
                </div>
              </div>

              {/* Stock Toggles */}
              <div className="space-y-4">
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">Color Availability</p>
                
                <div className="space-y-3">
                  <p className="text-[10px] text-white/50 font-bold">T-Shirts</p>
                  <div className="flex gap-2">
                    {['black', 'white', 'lavender'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setPrices({
                          ...prices,
                          stock: {
                            ...prices.stock,
                            tshirt: { ...prices.stock.tshirt, [color]: !prices.stock.tshirt[color as keyof typeof prices.stock.tshirt] }
                          }
                        })}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          prices.stock.tshirt[color as keyof typeof prices.stock.tshirt]
                          ? 'border-green-500/50 text-green-400 bg-green-500/5'
                          : 'border-red-500/50 text-red-400 bg-red-500/5'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] text-white/50 font-bold">Caps</p>
                  <div className="flex gap-2">
                    {['black', 'white', 'lavender'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setPrices({
                          ...prices,
                          stock: {
                            ...prices.stock,
                            cap: { ...prices.stock.cap, [color]: !prices.stock.cap[color as keyof typeof prices.stock.cap] }
                          }
                        })}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                          prices.stock.cap[color as keyof typeof prices.stock.cap]
                          ? 'border-green-500/50 text-green-400 bg-green-500/5'
                          : 'border-red-500/50 text-red-400 bg-red-500/5'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingPrices}
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-4 rounded-xl font-black italic tracking-tighter uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingPrices ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> SAVE STORE SETTINGS</>}
              </button>
              {priceSuccess && (
                <p className="text-green-400 text-xs text-center font-bold flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Settings updated!
                </p>
              )}
            </form>
          </div>

          {/* Stats Summary */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-yellow-300/5 border border-yellow-300/10 rounded-3xl p-6">
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-3xl font-black text-yellow-300 italic">₹{orders.reduce((acc, o) => acc + o.amount, 0)}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">T-Shirts Sold</p>
              <p className="text-3xl font-black text-white italic">{orders.filter(o => o.productType === 't-shirt').length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Caps Sold</p>
              <p className="text-3xl font-black text-white italic">{orders.filter(o => o.productType === 'cap').length}</p>
            </div>
          </div>
        </div>

        {/* Inventory Breakdown Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* T-Shirt Breakdown */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              T-Shirt Printing Guide
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold mb-3 tracking-widest">By Color</p>
                <div className="space-y-2">
                    {Object.entries(inventory.tshirtColors).map(([color, count]) => {
                      const colorMap: Record<string, string> = {
                        lavender: '#B57EDC',
                        black: '#000000',
                        white: '#FFFFFF'
                      };
                      return (
                        <div key={color} className="flex items-center justify-between bg-white/5 p-2 px-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full border border-white/20" 
                              style={{ backgroundColor: colorMap[color.toLowerCase()] || color }} 
                            />
                            <span className="text-xs text-white capitalize">{color}</span>
                          </div>
                          <span className="text-xs font-black text-yellow-300">{count}</span>
                        </div>
                      );
                    })}
                  {Object.keys(inventory.tshirtColors).length === 0 && <p className="text-[10px] text-neutral-600 italic">No orders yet</p>}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold mb-3 tracking-widest">By Size</p>
                <div className="space-y-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <div key={size} className="flex items-center justify-between bg-white/5 p-2 px-3 rounded-lg">
                      <span className="text-xs text-white font-bold">{size}</span>
                      <span className="text-xs font-black text-white/50">{inventory.tshirtSizes[size] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cap Breakdown */}
          <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-6">
            <h3 className="text-sm font-black text-white uppercase italic tracking-widest mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Cap Printing Guide
            </h3>
            <div className="max-w-xs">
              <p className="text-[10px] text-neutral-500 uppercase font-bold mb-3 tracking-widest">By Color</p>
              <div className="space-y-2">
                {Object.entries(inventory.capColors).map(([color, count]) => {
                  const colorMap: Record<string, string> = {
                    lavender: '#B57EDC',
                    black: '#000000',
                    white: '#FFFFFF'
                  };
                  return (
                    <div key={color} className="flex items-center justify-between bg-white/5 p-2 px-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full border border-white/20" 
                          style={{ backgroundColor: colorMap[color.toLowerCase()] || color }} 
                        />
                        <span className="text-xs text-white capitalize">{color}</span>
                      </div>
                      <span className="text-xs font-black text-yellow-300">{count}</span>
                    </div>
                  );
                })}
                {Object.keys(inventory.capColors).length === 0 && <p className="text-[10px] text-neutral-600 italic">No orders yet</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-white/10 w-full md:w-auto">
            {['all', 't-shirt', 'cap'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase italic tracking-widest transition-all ${
                  filterType === type 
                  ? 'bg-yellow-300 text-black shadow-[0_0_15px_rgba(253,224,71,0.2)]' 
                  : 'text-neutral-500 hover:text-white'
                }`}
              >
                {type === 'all' ? 'All Orders' : type + 's'}
              </button>
            ))}
          </div>

          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search buyer or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-yellow-300/50"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-neutral-900/50 border border-white/5 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-neutral-500">Order/Buyer</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-neutral-500">Product Info</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-neutral-500">Contact</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-neutral-500">Payment</th>
                  <th className="p-4 text-[10px] uppercase tracking-widest font-black text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-yellow-300 mx-auto" />
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-neutral-500">No orders found matching your criteria.</td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <p className="text-white font-bold text-sm">{order.name}</p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <p className="text-[10px] text-neutral-500 font-mono">ORDER: {order.id}</p>
                        {order.uid && (
                          <p className="text-[10px] text-yellow-300 font-mono font-bold uppercase tracking-widest">UID: {order.uid}</p>
                        )}
                        <p className="text-[10px] text-neutral-600">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.productType === 't-shirt' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {order.productType}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20" 
                          style={{ backgroundColor: order.color }}
                          title={order.color}
                        />
                        {order.size && <span className="text-xs text-white font-bold">{order.size}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-white flex items-center gap-1.5"><Mail className="w-3 h-3 text-neutral-500" /> {order.email}</p>
                      <p className="text-xs text-white flex items-center gap-1.5 mt-1"><Phone className="w-3 h-3 text-neutral-500" /> {order.phone}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-black text-white">₹{order.amount}</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{order.payment.razorpayId}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setEditingOrder(order)}
                          className="p-2 hover:bg-yellow-300/10 text-neutral-400 hover:text-yellow-300 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-900 border border-white/10 rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">EDIT ORDER DETAILS</h3>
                  <button onClick={() => setEditingOrder(null)} className="text-neutral-500 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleUpdateOrder} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-[10px] text-neutral-500 uppercase font-black mb-2 block">Full Name</label>
                      <input 
                        type="text" 
                        value={editingOrder.name}
                        onChange={(e) => setEditingOrder({ ...editingOrder, name: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-300/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase font-black mb-2 block">Email</label>
                      <input 
                        type="email" 
                        value={editingOrder.email}
                        onChange={(e) => setEditingOrder({ ...editingOrder, email: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-300/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase font-black mb-2 block">Phone</label>
                      <input 
                        type="text" 
                        value={editingOrder.phone}
                        onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-300/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 uppercase font-black mb-2 block">Color</label>
                      <input 
                        type="text" 
                        value={editingOrder.color}
                        onChange={(e) => setEditingOrder({ ...editingOrder, color: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-300/50"
                      />
                    </div>
                    {editingOrder.productType === 't-shirt' && (
                      <div>
                        <label className="text-[10px] text-neutral-500 uppercase font-black mb-2 block">Size</label>
                        <select 
                          value={editingOrder.size}
                          onChange={(e) => setEditingOrder({ ...editingOrder, size: e.target.value })}
                          className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-300/50"
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <button 
                    type="submit"
                    disabled={isUpdatingOrder}
                    className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-4 rounded-2xl font-black italic tracking-tighter uppercase transition-all disabled:opacity-50"
                  >
                    {isUpdatingOrder ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'SAVE CHANGES'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}
