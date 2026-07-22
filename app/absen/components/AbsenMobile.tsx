import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

import BrandLogo from "@/app/components/BrandLogo";

// =========================================================================
// TYPES & INTERFACES (Shared)
// =========================================================================
export interface HistoryItem {
  id: string;
  date: string;
  time: string;
  distance: string;
  status: "valid" | "telat";
  rawDate: string;
}

export interface AbsenProps {
  studentName: string;
  setStudentName: (val: string) => void;
  studentNim: string;
  isCheckedIn: boolean;
  currentTime: string;
  handleCheckIn: () => void;
  currentDate: string;
  historyList: HistoryItem[];
  // Password state/actions
  showPasswordModal: boolean;
  setShowPasswordModal: (val: boolean) => void;
  oldPassword: string;
  setOldPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  handleSavePassword: (e: React.FormEvent) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
  handleLogout: () => void;
  handleScanSuccess: (qrData: string) => void;
  timeFilter: "7days" | "30days" | "All";
  setTimeFilter: (val: "7days" | "30days" | "All") => void;
  checkInError?: string;
  isSubmitting?: boolean;
  poskoLat: number;
  poskoLng: number;
  absenBuka?: string;
  absenTutup?: string;
  fotoUrl?: string;
  isUploadingAvatar?: boolean;
  handleUploadAvatar?: (file: File) => void;
  handleDeleteAvatar?: () => void;
  setPreviewFotoUrl?: (url: string | null) => void;
}

// Shared Profile Avatar Component
function Avatar({ className = "w-10 h-10", src }: { className?: string; src?: string }) {
  if (src) {
    return (
      <div className={`${className} border border-slate-200/80 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 select-none shadow-xs`}>
        <img src={src} alt="Foto Profil" className="w-full h-full object-cover rounded-full" />
      </div>
    );
  }
  return (
    <div className={`${className} border border-slate-200/80 rounded-full overflow-hidden flex-shrink-0 bg-[#DDE2F8] flex items-center justify-center select-none`}>
      <svg viewBox="0 0 100 100" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#DDE2F8" />
        <g>
          <path d="M15 45 C10 20 90 20 85 45 C80 50 20 50 15 45 Z" fill="#1E293B" />
          <rect x="44" y="65" width="12" height="15" rx="3" fill="#FBCFE8" />
          <circle cx="50" cy="48" r="22" fill="#FCE7F3" />
          <path d="M28 45 C28 25 72 25 72 45 Z" fill="#1E293B" />
        </g>
      </svg>
    </div>
  );
}

export default function AbsenMobile(props: AbsenProps) {
  const [activeTab, setActiveTab] = useState<"home" | "history" | "profile">("home");
  const [isScanning, setIsScanning] = useState(false);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="lg:hidden min-h-screen bg-[#F8FAFC] w-full flex flex-col relative font-sans antialiased text-slate-800 pb-[80px]">
      
      {/* 1. MOBILE HERO LOGO HEADER */}
      <div className="w-full h-[250px] bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0F172A] relative overflow-hidden flex-shrink-0 flex items-center justify-center select-none">
        
        {/* Subtle Background Lighting & Mesh Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(54,60,213,0.4)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(96,165,250,0.2)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

        {/* Large Faded Watermark Logos in Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none scale-125 blur-[1px]">
          <img src="/logo-kkn.webp" alt="Watermark KKN" className="h-44 w-auto object-contain" />
          <img src="/logo-umrah.png" alt="Watermark UMRAH" className="h-44 w-auto object-contain ml-4" />
        </div>

        {/* Center Hero Emblem Badge with KKN & UMRAH Logos */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-2.5 pb-6">
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <img src="/logo-kkn.webp" alt="Logo KKN" className="h-10 w-auto object-contain drop-shadow-md" />
            <div className="h-7 w-[1px] bg-white/20" />
            <img src="/logo-umrah.png" alt="Logo UMRAH" className="h-10 w-auto object-contain drop-shadow-md" />
          </div>

          <div className="flex flex-col items-center text-center">
            <span className="font-extrabold text-white text-base tracking-tight drop-shadow">
              KKN Kelompok 8 Sungai Enam
            </span>
            <span className="text-[10px] font-bold text-blue-200/80 uppercase tracking-widest mt-0.5">
              Universitas Maritim Raja Ali Haji
            </span>
          </div>
        </div>

        {/* Header Metadata Chips */}
        <div className="absolute top-4 left-5 font-mono text-[9px] font-semibold text-white/50 tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>POSKO ACTIVE</span>
        </div>
        <div className="absolute bottom-10 right-5 font-mono text-[9px] font-semibold text-white/50 tracking-wider">
          LAT: {props.poskoLat ? props.poskoLat.toFixed(4) : "--"} / LON: {props.poskoLng ? props.poskoLng.toFixed(4) : "--"}
        </div>
      </div>

      {/* 2. MOBILE FLOATING CONTENT OVERLAY CONTAINER */}
      <main className="w-full relative z-10 -mt-[32px] flex-grow flex flex-col">
        <div className="w-full bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.03)] rounded-t-[32px] px-[20px] pt-[28px] pb-[32px] flex flex-col gap-[24px] flex-grow">
          
          {/* Header Greeting row */}
          <header className="flex flex-col gap-3 w-full">
            <div className="flex flex-row justify-between items-center w-full">
              <BrandLogo size="sm" />
              <Avatar className="w-[42px] h-[42px]" />
            </div>
            <div className="flex flex-col justify-center items-start border-t border-slate-100 pt-2">
              <h1 className="font-sans font-bold text-[20px] leading-[28px] text-[#0F172A] tracking-tight">
                {activeTab === "home" && `Hey ${props.studentName.split(" ")[0]}`}
                {activeTab === "history" && "Riwayat Absensi"}
                {activeTab === "profile" && "Profil Pengguna"}
              </h1>
              <p className="font-sans font-medium text-[12px] leading-[18px] text-slate-400 italic">
                {activeTab === "home" && props.currentDate}
                {activeTab === "history" && "Log aktivitas absensi KKN harian Anda"}
                {activeTab === "profile" && "Informasi detail akun mahasiswa aktif KKN"}
              </p>
            </div>
          </header>

          {/* TAB 1: HOME (Mobile scan card & stats) */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
              
              {/* Check In scanner area */}
              <div className="bg-white border border-[#E5E7EB] shadow-[0px_1px_3px_rgba(0,0,0,0.02)] rounded-[24px] p-6 flex flex-col gap-6 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E0E7FF] text-[#2D49F3] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M9 20h6" /><path d="M12 16v4" />
                      </svg>
                    </div>
                    <span className="font-bold text-[16px] text-slate-800 tracking-tight">Check In</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80 flex items-center gap-1 font-mono">
                    ⏰ {props.absenBuka || "06:00"} - {props.absenTutup || "08:00"}
                  </span>
                </div>

                <div className="w-full aspect-video min-h-[220px] bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-[16px] flex flex-col items-center justify-center gap-3 select-none overflow-hidden relative">
                  {props.isCheckedIn ? (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="font-bold text-[14px] text-slate-800">Absensi Hari Ini Selesai</span>
                      <span className="text-[11px] font-semibold text-slate-400 mt-1 font-mono">{props.currentTime}</span>
                    </div>
                  ) : isScanning ? (
                    <div className="absolute inset-0 w-full h-full">
                      <Scanner
                        onScan={(result) => {
                          if (result && result.length > 0) {
                            props.handleScanSuccess(result[0].rawValue);
                            setIsScanning(false);
                          }
                        }}
                        onError={(err) => {
                          console.error(err);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setIsScanning(false)}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900/80 text-white font-bold text-[10px] uppercase tracking-wider cursor-pointer z-10 hover:bg-slate-900 transition-colors"
                      >
                        Matikan Kamera
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                      <svg className="w-10 h-10 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                      <button
                        type="button"
                        onClick={() => setIsScanning(true)}
                        className="mt-3 px-4 h-[34px] rounded-full bg-primary text-white hover:bg-primary-active font-sans font-bold text-[11px] uppercase tracking-[0.5px] cursor-pointer shadow-md transition-all active:scale-95"
                      >
                        Mulai Kamera Scan
                      </button>
                    </div>
                  )}
                </div>

                {props.checkInError && (
                  <div className="text-[11px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl p-3 text-left">
                    {props.checkInError}
                  </div>
                )}

                {props.isCheckedIn && (
                  <div className="w-full py-2.5 rounded-full font-bold text-[12px] uppercase tracking-[0.8px] bg-emerald-50 text-emerald-600 border border-emerald-200 text-center flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Sudah Check In Hari Ini</span>
                  </div>
                )}


              </div>

              {/* Employee Statistics Section (Synced with Desktop) */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="font-bold text-[15px] text-slate-800 tracking-tight text-left">Employee Statistic</h2>
                  <div className="flex bg-slate-100 rounded-lg p-0.5 text-[9px] font-bold select-none cursor-pointer">
                    {["7days", "30days", "All"].map((f) => (
                      <button
                        key={f}
                        onClick={() => props.setTimeFilter(f as any)}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          props.timeFilter === f ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mobile Bento Grid Stats */}
                {(() => {
                  const nowTime = new Date();
                  const filter = props.timeFilter;
                  const daysToFilter = filter === "7days" ? 7 : filter === "30days" ? 30 : 999999;
                  
                  const filtered = props.historyList.filter(item => {
                    if (filter === "All") return true;
                    const itemDate = new Date(item.rawDate);
                    const diffTime = Math.abs(nowTime.getTime() - itemDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= daysToFilter;
                  });

                  const presenceCount = filtered.length;
                  const validCount = filtered.filter(item => item.status === "valid").length;
                  const lateCount = filtered.filter(item => item.status === "telat").length;

                  const statValues = {
                    presence: `${presenceCount} Hari`,
                    presenceBadge: filter === "7days" ? "Terbaru" : filter === "30days" ? "30 Hari" : "Semua",
                    today: `${validCount} Hari`,
                    todayBadge: "Valid",
                    notPresent: `${lateCount} Hari`,
                    notPresentBadge: "Telat",
                  };

                  return (
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {/* Card 1: Total Presence */}
                      <div className="col-span-2 bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-4 flex flex-row items-center justify-between text-left">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Total Presence
                          </span>
                          <span className="text-2xl font-black text-slate-800 font-sans tracking-tight mt-1">{statValues.presence}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border text-[#10B981] bg-emerald-50 border-emerald-100">
                          {statValues.presenceBadge}
                        </span>
                      </div>

                      {/* Card 2: Today Attendances */}
                      <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-4 flex flex-col justify-between text-left h-[105px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> On Time (Valid)
                        </span>
                        <div className="flex flex-col items-start mt-2">
                          <span className="text-2xl font-black text-slate-800 font-sans tracking-tight leading-none">{statValues.today}</span>
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full border mt-2 text-[#10B981] bg-emerald-50 border-emerald-100">
                            {statValues.todayBadge}
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Not Present */}
                      <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-4 flex flex-col justify-between text-left h-[105px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Late (Telat)
                        </span>
                        <div className="flex flex-col items-start mt-2">
                          <span className="text-2xl font-black text-slate-800 font-sans tracking-tight leading-none">{statValues.notPresent}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border mt-2 ${
                            lateCount > 0 ? "text-[#EF4444] bg-rose-50 border-rose-100" : "text-slate-400 bg-slate-50 border-slate-200/60"
                          }`}>
                            {statValues.notPresentBadge}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* TAB 2: HISTORY (Mobile list format) */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-3 w-full animate-in fade-in duration-200">
              {props.historyList.map((item) => (
                <div key={item.id} className="flex flex-row items-center justify-between p-[14px] w-full bg-white border border-[#E5E7EB] rounded-[16px] text-left">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-sans font-bold text-[14px] text-slate-800">{item.date}</span>
                    <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                      <span>Time: {item.time}</span>
                      <span>•</span>
                      <span>{item.distance}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                      item.status === "valid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : item.status === "telat"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : item.status === "izin"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {item.status === "valid"
                        ? "Hadir"
                        : item.status === "telat"
                        ? "Terlambat"
                        : item.status === "izin"
                        ? "Izin"
                        : "Sakit"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PROFILE (Redesigned SaaS-style Mobile Form) */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-5 w-full animate-in fade-in duration-200 text-left">
              
              {/* Card 1: Data Diri */}
              <section className="bg-white border border-[#E5E7EB] shadow-[0px_2px_12px_rgba(0,0,0,0.01)] rounded-[24px] p-5 flex flex-col gap-4">
                <span className="font-bold text-[15px] text-slate-800 tracking-tight">Data Diri</span>
                
                <div className="flex flex-row items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="relative group w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <Avatar className="w-full h-full" src={props.fotoUrl} />
                    <button
                      type="button"
                      onClick={() => mobileFileInputRef.current?.click()}
                      disabled={props.isUploadingAvatar}
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition-opacity cursor-pointer"
                    >
                      <span>Ganti</span>
                    </button>
                    <input
                      type="file"
                      ref={mobileFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          props.handleUploadAvatar?.(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[14px] text-slate-700">{props.studentName}</span>
                    <span className="text-[10px] text-slate-400 font-mono mb-1.5">{props.studentNim}</span>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => mobileFileInputRef.current?.click()}
                        disabled={props.isUploadingAvatar}
                        className="text-[11px] font-bold text-primary hover:underline text-left cursor-pointer"
                      >
                        {props.isUploadingAvatar ? "Mengunggah..." : "📷 Unggah Foto"}
                      </button>

                      {props.fotoUrl && (
                        <>
                          <button
                            type="button"
                            onClick={() => props.setPreviewFotoUrl?.(props.fotoUrl || null)}
                            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          >
                            👁️ Lihat
                          </button>
                          <button
                            type="button"
                            onClick={props.handleDeleteAvatar}
                            disabled={props.isUploadingAvatar}
                            className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                          >
                            🗑️ Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={props.handleSaveProfile} className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Lengkap</label>
                    <input
                      type="text"
                      value={props.studentName}
                      onChange={(e) => props.setStudentName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full h-[42px] px-4 rounded-[12px] border border-slate-200 bg-white text-[13px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">NIM Peserta (Kunci)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={props.studentNim}
                        disabled
                        className="w-full h-[42px] pl-4 pr-10 rounded-[12px] border border-slate-200/60 bg-slate-50 text-[13px] font-mono text-slate-400 font-semibold cursor-not-allowed select-none"
                      />
                      <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-[42px] bg-primary hover:bg-primary-active text-white rounded-full font-sans font-bold text-[12px] tracking-[0.5px] uppercase transition-all active:scale-[0.98] mt-1 cursor-pointer shadow-md shadow-primary/10"
                  >
                    Simpan Perubahan
                  </button>
                </form>
              </section>

              {/* Card 2: Detail Penempatan KKN */}
              <section className="bg-white border border-[#E5E7EB] shadow-[0px_2px_12px_rgba(0,0,0,0.01)] rounded-[24px] p-5 flex flex-col gap-4">
                <span className="font-bold text-[15px] text-slate-800 tracking-tight">Detail Penempatan</span>
                
                <div className="grid grid-cols-2 gap-3 w-full text-left">
                  {[
                    { label: "Posko Penempatan", val: "Posko Kel 8 Sungai Enam" },
                    { label: "Kelompok KKN", val: "Kelompok KKN 8" },
                    { label: "DPL (Pembimbing)", val: "Dian Kharisma Dewi, S.T.,M.T." },
                    { label: "Wilayah Tugas", val: "Sungai Enam, Bintan, Kepri" }
                  ].map((meta, i) => (
                    <div key={i} className="flex flex-col gap-0.5 border border-slate-100 rounded-xl p-3 bg-slate-50/40">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{meta.label}</span>
                      <span className="text-[12px] font-bold text-slate-700 mt-1 leading-tight">{meta.val}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Card 3: Keamanan */}
              <section className="bg-white border border-[#E5E7EB] shadow-[0px_2px_12px_rgba(0,0,0,0.01)] rounded-[24px] p-5 flex flex-col gap-4">
                <span className="font-bold text-[15px] text-slate-800 tracking-tight">Keamanan</span>
                
                <div className="flex flex-row items-center justify-between gap-4 w-full">
                  <div className="flex flex-col text-left gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sandi Akun</span>
                    <span className="text-[13px] font-mono font-bold text-slate-400 tracking-[1px]">••••••••</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => props.setShowPasswordModal(true)}
                    className="px-4 h-[36px] rounded-xl border border-primary text-primary hover:bg-[#EFF6FF] font-sans font-bold text-[11px] tracking-[0.5px] uppercase transition-all cursor-pointer"
                  >
                    Ubah Sandi
                  </button>
                </div>
              </section>

              {/* Card 4: Sesi Akun */}
              <section className="bg-white border border-[#E5E7EB] shadow-[0px_2px_12px_rgba(0,0,0,0.01)] rounded-[24px] p-5 flex flex-col gap-4">
                <span className="font-bold text-[15px] text-slate-800 tracking-tight">Sesi Akun</span>
                <button
                  type="button"
                  onClick={props.handleLogout}
                  className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/20 text-rose-600 font-bold text-[12px] uppercase tracking-[0.5px] cursor-pointer hover:bg-rose-50 transition-colors"
                >
                  Keluar Sistem
                </button>
              </section>

            </div>
          )}

        </div>
      </main>

      {/* 3. MOBILE BOTTOM FLOATING NAVIGATION BAR */}
      <nav className="fixed bottom-[15px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[350px] h-[64px] bg-white border border-[#CBD5E1] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] rounded-full z-20 flex flex-row items-center justify-between px-[30px] select-none" aria-label="Mobile Navigation">
        {[
          { id: "home", icon: <><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></> },
          { id: "history", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { id: "profile", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col justify-center items-center w-[48px] h-[48px] rounded-full transition-colors cursor-pointer ${
              activeTab === tab.id ? "text-primary" : "text-slate-400 hover:text-primary"
            }`}
            aria-label={`Switch to ${tab.id} view`}
          >
            <svg className="w-5 h-5" fill={tab.id === "home" ? "currentColor" : "none"} stroke={tab.id !== "home" ? "currentColor" : undefined} strokeWidth={tab.id !== "home" ? "2.5" : undefined} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {tab.icon}
            </svg>
          </button>
        ))}
      </nav>

    </div>
  );
}
