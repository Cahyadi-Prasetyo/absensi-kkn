"use client";

import React, { useState } from "react";

// =========================================================================
// TYPES & INTERFACES (Shared)
// =========================================================================
export interface HistoryItem {
  id: string;
  date: string;
  time: string;
  distance: string;
  status: "valid" | "luar_radius" | "telat" | "ditolak";
}

export interface AbsenProps {
  studentName: string;
  setStudentName: (val: string) => void;
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
  timeFilter: "7days" | "30days" | "All";
  setTimeFilter: (val: "7days" | "30days" | "All") => void;
}

// Shared Profile Vector Avatar
function Avatar({ className = "w-10 h-10" }: { className?: string }) {
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

  return (
    <div className="lg:hidden min-h-screen bg-[#F8FAFC] w-full flex flex-col relative font-sans antialiased text-slate-800 pb-[80px]">
      
      {/* 1. MOBILE RADAR MAP HEADER */}
      <div className="w-full h-[250px] bg-slate-950 relative overflow-hidden flex-shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,#363CD5_0%,transparent_50%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,#1718BF_0%,transparent_60%)] opacity-35" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[180px] h-[180px] rounded-full border border-white/5 flex items-center justify-center animate-[spin_40s_linear_infinite]" style={{ borderStyle: "dashed" }}>
            <div className="w-[130px] h-[130px] rounded-full border border-primary/20 flex items-center justify-center">
              <div className="w-[80px] h-[80px] rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center relative">
                <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                <div className="absolute w-2.5 h-2.5 bg-primary rounded-full animate-ping opacity-75" />
              </div>
            </div>
          </div>
          
          <div className="absolute w-[200px] h-[1px] bg-white/10" />
          <div className="absolute h-[200px] w-[1px] bg-white/10" />
          
          <div className="absolute top-6 left-6 font-mono text-[9px] text-white/30 tracking-wider">
            {activeTab === "home" && "LOC: POSKO_KKN_YOGYA"}
            {activeTab === "history" && "VIEW: ATTENDANCE_LOG"}
            {activeTab === "profile" && "ACCOUNT: STUDENT_PROFILE"}
          </div>
          <div className="absolute bottom-10 right-6 font-mono text-[9px] text-white/30 tracking-wider">LAT: -7.7956 / LON: 110.3695</div>
        </div>
      </div>

      {/* 2. MOBILE FLOATING CONTENT OVERLAY CONTAINER */}
      <main className="w-full relative z-10 -mt-[32px] flex-grow flex flex-col">
        <div className="w-full bg-white shadow-[0px_-4px_20px_rgba(0,0,0,0.03)] rounded-t-[32px] px-[20px] pt-[28px] pb-[32px] flex flex-col gap-[24px] flex-grow">
          
          {/* Header Greeting row */}
          <header className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-col justify-center items-start">
              <h1 className="font-sans font-bold text-[22px] leading-[30px] text-[#0F172A] tracking-tight">
                {activeTab === "home" && `Hey ${props.studentName.split(" ")[0]}`}
                {activeTab === "history" && "Riwayat Absensi"}
                {activeTab === "profile" && "Profil Pengguna"}
              </h1>
              <p className="font-sans font-medium text-[13px] leading-[18px] text-slate-400 italic">
                {activeTab === "home" && props.currentDate}
                {activeTab === "history" && "Log aktivitas absensi KKN harian Anda"}
                {activeTab === "profile" && "Informasi detail akun mahasiswa aktif KKN"}
              </p>
            </div>
            <Avatar className="w-[48px] h-[48px]" />
          </header>

          {/* TAB 1: HOME (Mobile scan card & stats) */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
              
              {/* Check In scanner area */}
              <div className="bg-white border border-[#E5E7EB] shadow-[0px_1px_3px_rgba(0,0,0,0.02)] rounded-[24px] p-6 flex flex-col gap-6 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E0E7FF] text-[#2D49F3] rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M9 20h6" /><path d="M12 16v4" />
                    </svg>
                  </div>
                  <span className="font-bold text-[16px] text-slate-800 tracking-tight">Check In</span>
                </div>

                <div className="w-full aspect-video min-h-[160px] bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] rounded-[16px] flex flex-col items-center justify-center gap-3 select-none">
                  <svg className="w-12 h-12 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-2.25zM3.75 14.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-2.25zM14.625 3.75c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-2.25c0-.621-.504-1.125-1.125-1.125h-2.25z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z" />
                  </svg>
                  <span className="font-semibold text-[13px] text-slate-500">Scan QR Code to Check In</span>
                  {props.isCheckedIn && (
                    <span className="text-[11px] font-bold text-success uppercase tracking-[0.5px]">Success: {props.currentTime}</span>
                  )}
                </div>

                <button
                  onClick={props.handleCheckIn}
                  disabled={props.isCheckedIn}
                  className={`flex flex-row justify-center items-center py-[12px] gap-[8px] w-full h-[44px] rounded-full font-sans font-bold text-[13px] tracking-[0.8px] uppercase select-none transition-all active:scale-[0.98] cursor-pointer ${
                    props.isCheckedIn
                      ? "bg-slate-100 text-slate-400 cursor-default"
                      : "bg-primary text-white hover:bg-primary-active shadow-sm shadow-primary/10"
                  }`}
                >
                  <span>{props.isCheckedIn ? "DONE" : "Check In Now"}</span>
                </button>
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
                  const statValues = {
                    "7days": { presence: "5 Days", today: "28", notPresent: "00" },
                    "30days": { presence: "15 Days", today: "30", notPresent: "03" },
                    "All": { presence: "45 Days", today: "29", notPresent: "08" }
                  }[props.timeFilter];

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
                          {props.timeFilter === "7days" ? "↗ 2%" : props.timeFilter === "30days" ? "↗ 8%" : "↗ 12%"}
                        </span>
                      </div>

                      {/* Card 2: Today Attendances */}
                      <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-4 flex flex-col justify-between text-left h-[105px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Today Attendances
                        </span>
                        <div className="flex flex-col items-start mt-2">
                          <span className="text-2xl font-black text-slate-800 font-sans tracking-tight leading-none">{statValues.today}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border mt-2 ${
                            props.timeFilter === "30days" ? "text-[#EF4444] bg-rose-50 border-rose-100" : "text-[#10B981] bg-emerald-50 border-emerald-100"
                          }`}>
                            {props.timeFilter === "7days" ? "↗ 4%" : props.timeFilter === "30days" ? "↘ 2%" : "↗ 1%"}
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Not Present */}
                      <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-4 flex flex-col justify-between text-left h-[105px]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Not Present
                        </span>
                        <div className="flex flex-col items-start mt-2">
                          <span className="text-2xl font-black text-slate-800 font-sans tracking-tight leading-none">{statValues.notPresent}</span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full border mt-2 ${
                            statValues.notPresent === "00" ? "text-slate-400 bg-slate-50 border-slate-200/60" : "text-[#EF4444] bg-rose-50 border-rose-100"
                          }`}>
                            {props.timeFilter === "7days" ? "0%" : props.timeFilter === "30days" ? "↗ 3%" : "↗ 5%"}
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
                    <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase rounded-full border ${
                      item.status === "valid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      item.status === "luar_radius" ? "bg-orange-50 text-orange-600 border-orange-100" :
                      "bg-rose-50 text-rose-600 border-rose-100"
                    }`}>
                      {item.status === "valid" ? "Valid" : item.status === "luar_radius" ? "Luar Radius" : "Telat"}
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
                  <div className="relative group w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <Avatar className="w-full h-full" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[14px] text-slate-700">{props.studentName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">2200018001</span>
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
                        value="2200018001"
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
                    { label: "Posko", val: "Posko 1 - Yogya" },
                    { label: "Kelompok", val: "Reguler 82 Unit A" },
                    { label: "DPL", val: "Dr. Hartono" },
                    { label: "Wilayah", val: "Danurejan" }
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
