'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Search, Download, CheckCircle, 
  Clock, Users, User, FileText, Table as TableIcon,
  Loader2, Filter, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Parser } from 'json2csv';

interface Member {
  name: string;
  uid: string;
  email: string;
}

interface CheckInLog {
  id: string;
  teamName: string;
  type: 'individual' | 'team';
  leaderId: string;
  bookingId?: string;
  passId: string;
  members: Member[];
  checkedInAt: number;
  checkedInBy: string;
}

export default function AdminEntriesPage() {
  const router = useRouter();
  const [adminSession, setAdminSession] = useState<any>(null);
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<CheckInLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    checkSession();
    fetchLogs();
  }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    if (!Array.isArray(logs)) {
      setFilteredLogs([]);
      return;
    }
    const result = logs.filter(log => 
      log.teamName.toLowerCase().includes(q) ||
      log.bookingId?.toLowerCase().includes(q) ||
      log.passId?.toLowerCase().includes(q) ||
      log.members?.some(m => m.name.toLowerCase().includes(q) || m.uid.toLowerCase().includes(q))
    );
    setFilteredLogs(result);
  }, [searchQuery, logs]);

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

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/check-in/logs');
      let data = await res.json();
      
      // Ultimate fallback: if data is null, undefined, or not an array, make it an empty array
      if (!data || !Array.isArray(data)) {
        console.warn('API returned non-array data, falling back to empty list:', data);
        data = [];
      }
      
      setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const exportData = (format: 'excel' | 'csv' | 'json', mode: 'team' | 'individual') => {
    let dataToExport: any[] = [];

    if (mode === 'team') {
      dataToExport = filteredLogs.map(log => ({
        'Team Name': log.teamName,
        'Type': log.type,
        'Booking ID': log.bookingId || 'N/A',
        'Pass ID': log.passId,
        'Members Count': log.members.length,
        'Members List': log.members.map(m => `${m.name} (${m.uid})`).join(', '),
        'Checked In At': new Date(log.checkedInAt).toLocaleString(),
        'Verified By': log.checkedInBy
      }));
    } else {
      // Flattened view for individuals
      filteredLogs.forEach(log => {
        log.members.forEach(member => {
          dataToExport.push({
            'Student Name': member.name,
            'UID': member.uid,
            'Email': member.email,
            'Team Name': log.teamName,
            'Booking ID': log.bookingId || 'N/A',
            'Checked In At': new Date(log.checkedInAt).toLocaleString(),
            'Verified By': log.checkedInBy
          });
        });
      });
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checkin-entries-${mode}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(dataToExport);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checkin-entries-${mode}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Entries");
      XLSX.writeFile(wb, `checkin-entries-${mode}-${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  };

  return (
    <AdminLayout adminName={adminSession?.name} onLogout={() => router.push('/admin')}>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-white mb-1 uppercase flex items-center gap-2">
              <Shield className="w-6 h-6 text-yellow-300" />
              SECURITY <span className="text-yellow-300">ENTRIES</span>
            </h1>
            <p className="text-neutral-500 text-sm">Real-time check-in logs and student entry verification</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-black rounded-xl font-bold text-xs tracking-widest hover:scale-105 transition-all">
                <Download className="w-4 h-4" />
                EXPORT TEAM LIST
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                <button onClick={() => exportData('excel', 'team')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5 flex items-center gap-2">
                  <TableIcon className="w-3 h-3 text-green-400" /> Excel (.xlsx)
                </button>
                <button onClick={() => exportData('csv', 'team')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-blue-400" /> CSV (.csv)
                </button>
                <button onClick={() => exportData('json', 'team')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5 flex items-center gap-2">
                  <ExternalLink className="w-3 h-3 text-yellow-400" /> JSON (.json)
                </button>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl font-bold text-xs tracking-widest hover:bg-white/10 transition-all">
                <Users className="w-4 h-4" />
                EXPORT INDIVIDUALS
                <ChevronDown className="w-3 h-3" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                <button onClick={() => exportData('excel', 'individual')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5 flex items-center gap-2">
                  <TableIcon className="w-3 h-3 text-green-400" /> Excel (.xlsx)
                </button>
                <button onClick={() => exportData('csv', 'individual')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-blue-400" /> CSV (.csv)
                </button>
                <button onClick={() => exportData('json', 'individual')} className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5 flex items-center gap-2">
                  <ExternalLink className="w-3 h-3 text-yellow-400" /> JSON (.json)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Total Teams Entry</p>
            <p className="text-3xl font-black text-white italic">{Array.isArray(logs) ? logs.length : 0}</p>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Total Individuals Entry</p>
            <p className="text-3xl font-black text-white italic">
              {Array.isArray(logs) ? logs.reduce((acc, log) => acc + (log.members?.length || 0), 0) : 0}
            </p>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6">
            <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Latest Entry</p>
            <p className="text-lg font-bold text-yellow-300">
              {Array.isArray(logs) && logs.length > 0 ? new Date(logs[0].checkedInAt).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative group max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500 group-focus-within:text-yellow-300 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams, members, or booking IDs..."
            className="w-full bg-black/40 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-yellow-300/50 transition-all"
          />
        </div>

        {/* Logs Table */}
        <div className="bg-black/40 border border-white/5 rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="p-4 text-[10px] uppercase font-black text-neutral-500 tracking-widest">Entry Time</th>
                  <th className="p-4 text-[10px] uppercase font-black text-neutral-500 tracking-widest">Team Name</th>
                  <th className="p-4 text-[10px] uppercase font-black text-neutral-500 tracking-widest">Booking ID</th>
                  <th className="p-4 text-[10px] uppercase font-black text-neutral-500 tracking-widest">Type</th>
                  <th className="p-4 text-[10px] uppercase font-black text-neutral-500 tracking-widest">Members</th>
                  <th className="p-4 text-[10px] uppercase font-black text-neutral-500 tracking-widest">Verified By</th>
                  <th className="p-4 text-[10px] uppercase font-black text-neutral-500 tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <Loader2 className="w-8 h-8 text-yellow-300 animate-spin mx-auto mb-2" />
                      <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">Loading Entries...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <FileText className="w-12 h-12 text-neutral-800 mx-auto mb-2" />
                      <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest">No entries found</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr 
                        onClick={() => toggleRow(log.id)}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${expandedRows.has(log.id) ? 'bg-white/5' : ''}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-yellow-300" />
                            <span className="text-white text-sm font-medium">{new Date(log.checkedInAt).toLocaleTimeString()}</span>
                          </div>
                          <span className="text-[10px] text-neutral-600 block mt-1">{new Date(log.checkedInAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 text-white font-bold italic uppercase tracking-tight">{log.teamName}</td>
                        <td className="p-4 font-mono text-xs text-cyan-400 font-bold uppercase">{log.bookingId || log.passId}</td>
                        <td className="p-4">
                          <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-400 uppercase font-bold tracking-wider">
                            {log.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <Users className="w-4 h-4 text-neutral-600" />
                            {log.members.length}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {log.checkedInBy}
                          </div>
                        </td>
                        <td className="p-4">
                          {expandedRows.has(log.id) ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                        </td>
                      </tr>
                      
                      <AnimatePresence>
                        {expandedRows.has(log.id) && (
                          <tr>
                            <td colSpan={7} className="p-0 bg-black/40">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-white/5">
                                  <div className="space-y-4">
                                    <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-widest flex items-center gap-2">
                                      <User className="w-3.5 h-3.5 text-yellow-300" />
                                      Detailed Member List
                                    </h4>
                                    <div className="space-y-2">
                                      {log.members.map((m, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                                          <div>
                                            <p className="text-white text-sm font-bold uppercase tracking-tight">{m.name}</p>
                                            <p className="text-[10px] text-neutral-500 font-mono">{m.email}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-yellow-300 font-mono text-[10px] font-bold">{m.uid}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-white/2 rounded-2xl p-6 border border-white/5">
                                    <h4 className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-4">Verification Metadata</h4>
                                    <div className="space-y-3 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-neutral-500">Leader ID</span>
                                        <span className="text-white font-mono">{log.leaderId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-neutral-500">Pass ID</span>
                                        <span className="text-white font-mono">{log.passId}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-neutral-500">Entry Timestamp</span>
                                        <span className="text-white">{log.checkedInAt}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-neutral-500">System Verified</span>
                                        <span className="text-green-400 font-bold uppercase">YES</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
