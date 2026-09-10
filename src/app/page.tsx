"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, Loader2, Wallet, MapPin, Coins,
  Download, Plus, Edit, Trash2, X, Activity, CheckCircle, Clock, Gift,
  TrendingUp, Sparkles, Calendar, FileText, ChevronDown
} from "lucide-react";

type Progress = "draft" | "posting" | "nggu feedback" | "done" | "cancel";

type Job = {
  id: number;
  date: string; // Bulan
  name: string;
  pic: string;
  handle: string;
  fee: number;
  sow: string;
  timeline: string;
  keterangan: string;
  progress: Progress;
};

const defaultJobs: Job[] = [
  { id: 1, date: "Oktober", name: "emotipops fosx", handle: "CB", pic: "", fee: 75000, sow: "visit Alfa + 1 VT", timeline: "16 Oktober", keterangan: "", progress: "done" },
  { id: 2, date: "Oktober", name: "wondermoms - nobu", handle: "Nida", pic: "", fee: 40000, sow: "download apk + register", timeline: "15 Oktober", keterangan: "", progress: "done" },
  { id: 3, date: "September", name: "Pepsodent nano soft", handle: "NSR", pic: "", fee: 80000, sow: "barter produk rembos", timeline: "September", keterangan: "finish rembos", progress: "done" },
  { id: 4, date: "September", name: "my baby", handle: "AnggiEfa", pic: "", fee: 19000, sow: "barter produk rembos", timeline: "September", keterangan: "", progress: "done" },
  { id: 5, date: "Oktober", name: "mercon merah putih", handle: "sosmed", pic: "barter", fee: 0, sow: "", timeline: "", keterangan: "", progress: "draft" }
];

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Omit<Job, 'id'>>({
    date: "", name: "", pic: "", handle: "", fee: 0, sow: "", timeline: "", keterangan: "", progress: "draft"
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/quests');
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        // Fallback
        setJobs(defaultJobs);
      }
      setMounted(true);
    };
    fetchJobs();
  }, []);

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(number);
  };

  const formatMonth = (val: string) => {
    if (!val) return '-';
    if (/^\d{4}-\d{2}$/.test(val)) {
      const [year, month] = val.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${months[parseInt(month) - 1]} ${year}`;
    }
    return val;
  };

  const formatDate = (val: string) => {
    if (!val) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [year, month, day] = val.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
    }
    return val;
  };

  const getProgressColor = (progress: Progress) => {
    switch(progress) {
      case 'draft': return 'bg-slate-100/80 text-slate-600 border-slate-300';
      case 'posting': return 'bg-sky-100/80 text-sky-700 border-sky-300';
      case 'nggu feedback': return 'bg-orange-100/80 text-orange-700 border-orange-300';
      case 'done': return 'bg-emerald-100/80 text-emerald-700 border-emerald-300';
      case 'cancel': return 'bg-red-100/80 text-red-700 border-red-300';
      default: return 'bg-slate-100/80 text-slate-600 border-slate-300';
    }
  };

  const handleOpenModal = (job?: Job) => {
    if (job) {
      setEditingId(job.id);
      setFormData({
        date: job.date, name: job.name, pic: job.pic, handle: job.handle, 
        fee: job.fee, sow: job.sow, timeline: job.timeline || "", keterangan: job.keterangan || "", progress: job.progress
      });
    } else {
      setEditingId(null);
      setFormData({ date: "", name: "", pic: "", handle: "", fee: 0, sow: "", timeline: "", keterangan: "", progress: "draft" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      try {
        const res = await fetch(`/api/quests/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          // Refresh list
          const fetchRes = await fetch('/api/quests');
          const data = await fetchRes.json();
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to update", err);
      }
    } else {
      try {
        const res = await fetch('/api/quests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          // Refresh list
          const fetchRes = await fetch('/api/quests');
          const data = await fetchRes.json();
          setJobs(data);
        }
      } catch (err) {
        console.error("Failed to add", err);
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus job ini?")) {
      // Optimistic update for better UX
      const prevJobs = [...jobs];
      setJobs(jobs.filter(j => j.id !== id));
      
      try {
        const res = await fetch(`/api/quests/${id}`, {
          method: 'DELETE'
        });
        if (!res.ok) {
          // Rollback if failed
          setJobs(prevJobs);
          alert("Gagal menghapus data dari server");
        }
      } catch (err) {
        console.error("Failed to delete", err);
        setJobs(prevJobs);
      }
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch

  // Calculate stats
  const totalTasks = jobs.length;
  const doneTasks = jobs.filter(j => j.progress === 'done').length;
  const runningTasks = jobs.filter(j => j.progress === 'posting' || j.progress === 'draft' || j.progress === 'nggu feedback').length;
  const canceledTasks = jobs.filter(j => j.progress === 'cancel').length;
  const totalFee = jobs.reduce((sum, j) => sum + (j.fee || 0), 0);
  const paidFee = jobs.filter(j => j.progress === 'done').reduce((sum, j) => sum + (j.fee || 0), 0);
  const pendingFee = jobs.filter(j => j.progress !== 'done' && j.progress !== 'cancel').reduce((sum, j) => sum + (j.fee || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 space-y-4">
      
      {/* 
        ========================================
        BENTO GRID LAYOUT (VIBRANT BLUE) 
        ========================================
      */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
        
        {/* HEADER - SPANS FULL WIDTH */}
        <header className="md:col-span-4 bento-card p-6 sm:p-8 flex items-center justify-between group">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white bg-blue-100 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Anggi&backgroundColor=dbeafe&top=hijab&clothing=blazerAndShirt&clothingColor=blue" alt="Anggi Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-[0.65rem] sm:text-xs font-extrabold tracking-[0.2em] text-blue-500 uppercase mb-1">Selamat Pagi,</p>
              <h1 className="text-xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">Anggi's Tracker <span className="inline-block hover:rotate-12 transition-transform cursor-default text-blue-400">✨</span></h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold">Ceria, Kreatif, dan Produktif! 💎</p>
            </div>
          </div>
          <button className="hidden sm:flex w-12 h-12 bg-white/80 hover:bg-blue-500 border border-white rounded-full items-center justify-center text-blue-500 transition-all hover:text-white shadow-md hover:scale-105 active:scale-95">
            <Download size={20} />
          </button>
        </header>

        {/* MONEY CARDS: TOTAL, CAIR, TERTUNDA */}
        
        {/* TOTAL PENDAPATAN - SPANS 2 COLS */}
        <div className="md:col-span-2 bento-card p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden border-2 border-blue-100/50">
          <div className="flex items-center gap-2 mb-3 text-blue-500">
            <TrendingUp size={20} />
            <h3 className="text-[0.7rem] font-black tracking-[0.15em] uppercase text-slate-500">Total Pendapatan</h3>
          </div>
          <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-blue-600 tracking-tighter">
            {formatRupiah(totalFee)}
          </div>
        </div>

        {/* TELAH CAIR - SPANS 1 COL */}
        <div className="md:col-span-1 bento-card p-6 flex flex-col justify-center border-2 border-emerald-100/50">
          <div className="flex items-center gap-2 mb-3 text-emerald-500">
            <CheckCircle size={18} />
            <h3 className="text-[0.65rem] font-black tracking-[0.15em] uppercase text-slate-500">Telah Cair</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tighter">
            {formatRupiah(paidFee)}
          </div>
        </div>

        {/* TERTUNDA - SPANS 1 COL */}
        <div className="md:col-span-1 bento-card p-6 flex flex-col justify-center border-2 border-amber-100/50">
          <div className="flex items-center gap-2 mb-3 text-amber-500">
            <Clock size={18} />
            <h3 className="text-[0.65rem] font-black tracking-[0.15em] uppercase text-slate-500">Tertunda</h3>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tighter">
            {formatRupiah(pendingFee)}
          </div>
        </div>

        {/* STATS 4x1 GRID - SPANS 4 COLS */}
        <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Tasks", value: totalTasks, icon: Activity, text: "text-indigo-600", bg: "bg-indigo-100/80" },
            { label: "Done", value: doneTasks, icon: CheckCircle2, text: "text-emerald-600", bg: "bg-emerald-100/80" },
            { label: "Running", value: runningTasks, icon: Loader2, text: "text-amber-600", bg: "bg-amber-100/80" },
            { label: "Cancel", value: canceledTasks, icon: X, text: "text-rose-500", bg: "bg-rose-100/80" },
          ].map((stat, i) => (
            <div key={i} className={`bento-card !bg-white/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between transition-all hover:scale-105 min-h-[110px]`}>
              <div className="flex justify-between items-start mb-2">
                <div className={`w-10 h-10 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.text} flex items-center justify-center shadow-sm`}>
                  <stat.icon size={18} className={`${stat.label === "Running" ? "animate-spin-slow" : ""}`} />
                </div>
                <h2 className={`text-3xl font-black ${stat.text} leading-none`}>{stat.value}</h2>
              </div>
              <p className="text-[0.65rem] sm:text-xs font-extrabold tracking-wider text-slate-500 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* JOB LIST TABLE - SPANS FULL WIDTH */}
        <div className="md:col-span-4 bento-card rounded-[2rem] p-4 sm:p-6 lg:p-8 mt-2 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="text-blue-500" size={24} />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Daftar Pekerjaan</h2>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-semibold">Kelola dan pantau progres seluruh tugas Anda.</p>
            </div>
            <button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white px-6 py-3 text-sm rounded-full font-bold flex items-center gap-2 transition-all shadow-[0_5px_15px_rgba(59,130,246,0.4)] hover:shadow-[0_8px_20px_rgba(59,130,246,0.6)] hover:-translate-y-1 active:translate-y-0 w-full sm:w-auto justify-center">
              <Plus size={18} /> <span>Tambah Pekerjaan</span>
            </button>
          </div>

          <div className="w-full">
            {/* Mobile view: Stacked modern cards (Expandable Accordion) */}
            <div className="sm:hidden space-y-4">
              {jobs.map(job => {
                const isExpanded = expandedId === job.id;
                return (
                <div key={job.id} onClick={() => setExpandedId(isExpanded ? null : job.id)} className={`bg-white/90 border-2 border-slate-100 p-5 rounded-2xl relative shadow-sm cursor-pointer transition-all ${isExpanded ? 'ring-2 ring-blue-400' : 'hover:bg-slate-50'}`}>
                  <div className="flex justify-between items-start">
                    <div className="pr-2">
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight mb-1">{job.name}</h3>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="text-[0.65rem] font-bold tracking-widest text-indigo-500 uppercase bg-indigo-50 px-2 py-1 rounded-md">{formatMonth(job.date)}</span>
                        {job.timeline && <span className="text-[0.65rem] font-bold tracking-widest text-sky-600 uppercase bg-sky-50 px-2 py-1 rounded-md flex items-center gap-1"><Calendar size={10}/> {formatDate(job.timeline)}</span>}
                        {job.fee > 0 ? (
                          <span className="text-[0.65rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{formatRupiah(job.fee)}</span>
                        ) : (
                          <span className="text-[0.65rem] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">Barter</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className={`text-[0.6rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest border ${getProgressColor(job.progress)}`}>
                        {job.progress}
                      </span>
                      <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} size={18} />
                    </div>
                  </div>
                  
                  {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200" onClick={e => e.stopPropagation()}>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[0.6rem] font-bold tracking-wider text-slate-400 uppercase block mb-0.5">PIC</span> 
                        <span className="font-bold text-slate-700">{job.pic || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[0.6rem] font-bold tracking-wider text-slate-400 uppercase block mb-0.5">Handle</span> 
                        <span className="font-bold text-slate-700">{job.handle}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[0.6rem] font-bold tracking-wider text-slate-400 uppercase block mb-0.5">SOW / Tugas</span> 
                        <span className="font-semibold text-xs text-slate-700 leading-relaxed block bg-white p-2 rounded-lg mt-1 border border-slate-200">{job.sow || '-'}</span>
                      </div>
                      {job.keterangan && (
                        <div className="col-span-2">
                          <span className="text-[0.6rem] font-bold tracking-wider text-slate-400 uppercase block mb-0.5">Keterangan</span> 
                          <span className="font-semibold text-xs text-slate-600 italic leading-relaxed block bg-yellow-50/50 p-2 rounded-lg mt-1 border border-yellow-100">{job.keterangan}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 justify-end">
                      <button onClick={() => { handleOpenModal(job); setExpandedId(null); }} className="px-4 py-2 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold hover:bg-sky-100 transition-colors flex items-center gap-1.5"><Edit size={14}/> Edit</button>
                      <button onClick={() => handleDelete(job.id)} className="px-4 py-2 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"><Trash2 size={14}/> Hapus</button>
                    </div>
                  </div>
                  )}
                </div>
                );
              })}
              
              {jobs.length === 0 && (
                <div className="text-center py-10 text-slate-500 text-sm font-medium">Belum ada data pekerjaan.</div>
              )}
            </div>

            {/* Desktop view: Modern Table */}
            <div className="hidden sm:block overflow-x-auto hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 px-4">Tanggal & Timeline</th>
                    <th className="pb-4 px-4">Pekerjaan & SOW</th>
                    <th className="pb-4 px-4">Kontak</th>
                    <th className="pb-4 px-4">Pendapatan</th>
                    <th className="pb-4 px-4">Status & Ket</th>
                    <th className="pb-4 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {jobs.map((job, idx) => (
                    <tr key={job.id} className={`group border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx === jobs.length -1 ? 'border-b-0' : ''}`}>
                      <td className="py-5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="bg-indigo-50 text-indigo-600 text-[0.65rem] px-2 py-1 rounded-md font-bold border border-indigo-100 shadow-sm uppercase">{formatMonth(job.date)}</span>
                          {job.timeline && <span className="text-sky-600 text-[0.65rem] font-bold flex items-center gap-1"><Calendar size={12}/> {formatDate(job.timeline)}</span>}
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="font-extrabold text-slate-900 text-base mb-1">{job.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[250px] font-semibold bg-white px-2 py-1 inline-block rounded-md border border-slate-200" title={job.sow}>{job.sow || '-'}</div>
                      </td>
                      <td className="py-5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">{job.handle}</span>
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{job.pic || '-'}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          {job.fee > 0 && <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">{formatRupiah(job.fee)}</span>}
                          {job.fee === 0 && <span className="font-bold text-blue-600 text-xs bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 w-fit">Barter / Free</span>}
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`text-[0.65rem] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border shadow-sm ${getProgressColor(job.progress)}`}>
                            {job.progress}
                          </span>
                          {job.keterangan && (
                            <span className="text-[0.65rem] font-semibold text-slate-500 italic flex items-start gap-1 max-w-[150px] leading-tight">
                              <FileText size={10} className="mt-0.5 shrink-0" /> {job.keterangan}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(job)} className="p-2.5 rounded-xl hover:bg-sky-100 text-sky-500 hover:text-sky-600 transition-all hover:scale-110 shadow-sm bg-white border border-slate-100" title="Edit"><Edit size={16}/></button>
                          <button onClick={() => handleDelete(job.id)} className="p-2.5 rounded-xl hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition-all hover:scale-110 shadow-sm bg-white border border-slate-100" title="Hapus"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 text-sm font-semibold">Belum ada data pekerjaan tersimpan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ========================================
        MODAL (Form Input)
        ========================================
      */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-3xl border-2 border-white w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 relative shadow-2xl shadow-blue-500/10 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-blue-500 bg-slate-100 hover:bg-blue-50 rounded-full p-2.5 transition-colors">
              <X size={20} />
            </button>
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-600 tracking-tight">{editingId ? 'Edit Pekerjaan' : 'Pekerjaan Baru'}</h2>
              <p className="text-sm text-slate-500 mt-1 font-semibold">Lengkapi informasi di bawah ini.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">Bulan</label>
                  <input type="month" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">Timeline (Upload)</label>
                  <input type="date" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">Nama Pekerjaan / Brand</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="Contoh: Endorsement Skincare ABC" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">Handle Akun</label>
                  <input type="text" required value={formData.handle} onChange={e => setFormData({...formData, handle: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="@username" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">PIC (Opsional)</label>
                  <input type="text" value={formData.pic} onChange={e => setFormData({...formData, pic: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="e.g. Nida / barter" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-[1.5rem] border-2 border-slate-100 items-end">
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-emerald-600 tracking-wider uppercase ml-1">Fee Tunai (Rp)</label>
                  <input type="number" min="0" value={formData.fee || ''} onChange={e => setFormData({...formData, fee: parseInt(e.target.value)||0})} className="w-full bg-white border-2 border-emerald-100 rounded-2xl px-4 py-3 text-sm text-emerald-700 font-black outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20 transition-all placeholder-slate-300" placeholder="0" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">Status Progres</label>
                  <select value={formData.progress} onChange={e => setFormData({...formData, progress: e.target.value as Progress})} className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer">
                    <option value="draft">Draft / Persiapan</option>
                    <option value="posting">Posting / Berjalan</option>
                    <option value="nggu feedback">Nunggu Feedback</option>
                    <option value="done">Done / Cair</option>
                    <option value="cancel">Cancel / Batal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">Lingkup Kerja (SOW)</label>
                <input type="text" value={formData.sow} onChange={e => setFormData({...formData, sow: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="Contoh: 1 Video TikTok + 1 Instagram Story" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[0.7rem] font-bold text-slate-500 tracking-wider uppercase ml-1">Keterangan Job / Notes</label>
                <input type="text" value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm text-slate-900 font-bold outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400" placeholder="Contoh: Nunggu cair, Cancel karena produk habis, dsb." />
              </div>
              
              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-2xl py-4 font-black text-sm transition-all shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_30px_rgba(59,130,246,0.4)] hover:-translate-y-1 active:translate-y-0">
                {editingId ? 'Simpan Perubahan' : 'Tambahkan Pekerjaan'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
