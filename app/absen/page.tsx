"use client";

import React, { useState } from "react";

interface HistoryItem {
  id: string;
  date: string;
  time: string;
  distance: string;
  status: "valid" | "luar_radius" | "telat" | "ditolak";
}

export default function AbsenPage() {
  const [activeTab, setActiveTab] = useState<"home" | "history" | "profile">("home");
  
  // State Absensi
  const [currentTime, setCurrentTime] = useState<string>("--:-- AM");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [currentDate] = useState<string>("Saturday 18 July, 2026");

  // State Profile & Ubah Password
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Data Riwayat Mocking (Sesuai skema status & jarak)
  const [historyList, setHistoryList] = useState<HistoryItem[]>([
    { id: "1", date: "Friday, 17 July 2026", time: "07:15 AM", distance: "45m dari posko", status: "valid" },
    { id: "2", date: "Thursday, 16 July 2026", time: "07:32 AM", distance: "12m dari posko", status: "valid" },
    { id: "3", date: "Wednesday, 15 July 2026", time: "08:15 AM", distance: "320m dari posko", status: "luar_radius" },
    { id: "4", date: "Tuesday, 14 July 2026", time: "07:05 AM", distance: "58m dari posko", status: "valid" },
    { id: "5", date: "Monday, 13 July 2026", time: "07:44 AM", distance: "15m dari posko", status: "valid" },
    { id: "6", date: "Sunday, 12 July 2026", time: "08:05 AM", distance: "18m dari posko", status: "telat" },
  ]);

  // Handler simulasi scan QR / Check In
  const handleCheckIn = () => {
    if (isCheckedIn) return;
    
    // Dapatkan waktu saat ini
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 diganti 12
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    
    setCurrentTime(timeString);
    setIsCheckedIn(true);
    setShowSuccessModal(true); // Tampilkan modal sukses

    // Tambahkan log baru ke list riwayat teratas
    const newItem: HistoryItem = {
      id: (historyList.length + 1).toString(),
      date: currentDate,
      time: timeString,
      distance: "28m dari posko",
      status: "valid"
    };
    setHistoryList([newItem, ...historyList]);
  };

  // Handler simpan sandi baru
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Harap isi semua kolom password!");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Konfirmasi password baru tidak cocok!");
      return;
    }
    
    alert("Password berhasil diubah!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(false);
  };

  return (
    <div className="flex flex-row justify-center items-center p-0 bg-background min-h-screen">
      
      {/* Container utama Mobile Viewport */}
      <div className="relative w-full max-w-md min-h-screen bg-background flex flex-col pb-[110px] shadow-sm overflow-x-hidden">
        
        {/* 1. Ambient Map Radar Header Banner */}
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
            <div className="absolute bottom-10 right-6 font-mono text-[9px] text-white/30 tracking-wider">
              LAT: -7.7956 / LON: 110.3695
            </div>
          </div>
        </div>

        {/* 2. Main Overlap Surface */}
        <div className="relative z-10 -mt-[32px] w-full bg-surface shadow-[0px_-4px_20px_rgba(0,0,0,0.03)] rounded-t-[32px] px-[20px] pt-[28px] pb-[32px] flex flex-col gap-[24px] flex-grow">
          
          {/* ==================== TAB 1: HOME ==================== */}
          {activeTab === "home" && (
            <>
              {/* Greeting Section */}
              <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-col justify-center items-start">
                  <h1 className="font-sans font-bold text-[22px] leading-[30px] text-text-primary tracking-tight">
                    Hey Cahyadi
                  </h1>
                  <p className="font-sans font-medium text-[13px] leading-[18px] text-text-secondary italic">
                    {currentDate}
                  </p>
                </div>
                <div className="w-[48px] h-[48px] border-2 border-surface shadow-[0px_1px_3px_rgba(0,0,0,0.06)] rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-tr from-blue-50 to-indigo-100 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <clipPath id="avatar-clip-home"><circle cx="50" cy="50" r="48" /></clipPath>
                      <linearGradient id="bg-grad-home" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#DDE2F8" /><stop offset="100%" stopColor="#E0E0FF" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#bg-grad-home)" />
                    <g clipPath="url(#avatar-clip-home)">
                      <path d="M15 45 C10 20 90 20 85 45 C80 50 20 50 15 45 Z" fill="#1E293B" />
                      <rect x="44" y="65" width="12" height="15" rx="3" fill="#FBCFE8" />
                      <circle cx="50" cy="48" r="22" fill="#FCE7F3" />
                      <path d="M28 45 C28 25 72 25 72 45 C72 25 50 25 28 45 Z" fill="#1E293B" />
                      <path d="M28 35 C32 25 45 28 48 35 C52 28 65 25 72 35" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="43" cy="46" r="2" fill="#1E293B" /><circle cx="57" cy="46" r="2" fill="#1E293B" />
                      <path d="M46 56 C46 60 54 60 54 56" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                      <path d="M20 80 C20 70 35 68 50 68 C65 68 80 70 80 80 V100 H20 V80 Z" fill="#93C5FD" />
                      <path d="M42 68 L50 76 L58 68" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Check In Card */}
              <div className="flex flex-col items-start p-[18px] gap-[18px] w-full bg-surface border border-border/80 shadow-[0px_1px_2px_rgba(0,0,0,0.03)] rounded-[20px] flex-shrink-0 relative overflow-hidden">
                {isCheckedIn && (
                  <div className="absolute -right-16 -top-16 w-32 h-32 bg-success/5 rounded-full blur-2xl" />
                )}
                <div className="flex flex-row items-center gap-[12px] w-full">
                  <div className="w-[44px] h-[44px] bg-primary-ghost rounded-full flex items-center justify-center text-primary flex-shrink-0">
                    <svg className="w-[22px] h-[20px]" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="12" rx="2" /><path d="M9 20h6" /><path d="M12 16v4" />
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="font-sans font-bold text-[16px] leading-[22px] text-text-primary tracking-tight">Check In</span>
                    <span className="font-sans font-semibold text-[13px] leading-[18px] text-text-secondary">{currentTime}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                  className={`flex flex-row justify-center items-center py-[12px] gap-[8px] w-full h-[44px] rounded-full font-sans font-bold text-[13px] tracking-[0.8px] uppercase select-none transition-all active:scale-[0.98] cursor-pointer ${
                    isCheckedIn
                      ? "bg-card-blue-bg text-text-secondary cursor-default"
                      : "bg-primary text-white hover:bg-primary-active shadow-sm shadow-primary/10"
                  }`}
                >
                  <svg className={`w-[16px] h-[16px] ${isCheckedIn ? "text-text-secondary" : "text-white"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-2.25zM3.75 14.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-2.25zM14.625 3.75c-.621 0-1.125.504-1.125 1.125v2.25c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125v-2.25c0-.621-.504-1.125-1.125-1.125h-2.25z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z" />
                  </svg>
                  <span>{isCheckedIn ? "DONE" : "Check In"}</span>
                </button>
              </div>

              {/* Overview Section */}
              <div className="flex flex-col items-start gap-[12px] w-full">
                <h2 className="font-sans font-bold text-[18px] leading-[24px] text-text-primary tracking-tight">Overview</h2>
                <div className="flex flex-col gap-[8px] w-full">
                  <div className="relative box-sizing-border-box flex flex-row items-center justify-between p-[18px] w-full h-[120px] bg-surface border border-border shadow-[0px_1px_2px_rgba(0,0,0,0.03)] rounded-[16px] overflow-hidden">
                    <div className="flex flex-col justify-center space-y-1 z-10">
                      <span className="font-sans font-bold text-[12px] leading-[16px] text-text-secondary tracking-[0.8px] uppercase">Attendance Record</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-sans font-black text-[36px] leading-[36px] text-text-primary tracking-tighter">15</span>
                        <span className="text-[14px] font-semibold text-text-secondary">/ 30 Days</span>
                      </div>
                      <span className="text-[11px] font-medium text-success">✓ On track (100% Valid)</span>
                    </div>
                    <div className="relative w-[76px] h-[76px] flex items-center justify-center flex-shrink-0 z-10">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="38" cy="38" r="32" className="stroke-[#E2E8F0] fill-none" strokeWidth="6" />
                        <circle cx="38" cy="38" r="32" className="stroke-primary fill-none" strokeWidth="6" strokeDasharray="201" strokeDashoffset="100.5" strokeLinecap="round" />
                      </svg>
                      <div className="absolute font-sans font-bold text-[12px] text-primary">50%</div>
                    </div>
                    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
                  </div>

                  <div className="grid grid-cols-2 gap-[8px] w-full">
                    <div className="box-sizing-border-box flex flex-col items-center justify-center p-[12px] gap-[4px] w-full h-[110px] bg-surface border border-border shadow-[0px_1px_2px_rgba(0,0,0,0.03)] rounded-[16px]">
                      <div className="w-[32px] h-[32px] bg-card-red-bg rounded-full flex items-center justify-center text-card-red-text">
                        <svg className="w-[15px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </div>
                      <span className="font-sans font-bold text-[24px] leading-[32px] text-text-primary text-center">03</span>
                      <span className="font-sans font-bold text-[11px] leading-[16px] text-text-secondary text-center tracking-[0.6px] uppercase">Not present</span>
                    </div>

                    <div className="box-sizing-border-box flex flex-col items-center justify-center p-[12px] gap-[4px] w-full h-[110px] bg-surface border border-border shadow-[0px_1px_2px_rgba(0,0,0,0.03)] rounded-[16px]">
                      <div className="w-[32px] h-[32px] bg-card-orange-bg rounded-full flex items-center justify-center text-card-orange-text">
                        <svg className="w-[14px] h-[15px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                      <span className="font-sans font-bold text-[24px] leading-[32px] text-text-primary text-center">02</span>
                      <span className="font-sans font-bold text-[11px] leading-[16px] text-text-secondary text-center tracking-[0.6px] uppercase">Sick leave</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ==================== TAB 2: HISTORY ==================== */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-[16px] w-full animate-in fade-in duration-200">
              <div className="flex flex-col items-start">
                <h1 className="font-sans font-bold text-[22px] leading-[30px] text-text-primary tracking-tight">
                  Riwayat Kehadiran
                </h1>
                <p className="font-sans font-medium text-[13px] leading-[18px] text-text-secondary italic">
                  Daftar riwayat check in harian mahasiswa KKN
                </p>
              </div>

              {/* Attendance Timeline List */}
              <div className="flex flex-col gap-[12px] w-full">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    className="box-sizing-border-box flex flex-row items-center justify-between p-[14px] w-full bg-surface border border-border shadow-[0px_1px_2px_rgba(0,0,0,0.03)] rounded-[16px] transition-all hover:bg-slate-50"
                  >
                    {/* Time & Distance */}
                    <div className="flex flex-col gap-0.5">
                      <span className="font-sans font-bold text-[14px] text-text-primary">
                        {item.date}
                      </span>
                      <div className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                        {/* Clock Icon */}
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{item.time}</span>
                        <span>•</span>
                        {/* Map point Icon */}
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span className="font-mono text-[11px]">{item.distance}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      {item.status === "valid" && (
                        <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Valid
                        </span>
                      )}
                      {item.status === "luar_radius" && (
                        <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] rounded-full bg-card-orange-bg text-card-orange-text border border-orange-200">
                          Luar Radius
                        </span>
                      )}
                      {item.status === "telat" && (
                        <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] rounded-full bg-card-red-bg text-card-red-text border border-red-200">
                          Telat
                        </span>
                      )}
                      {item.status === "ditolak" && (
                        <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.5px] rounded-full bg-red-100 text-red-600 border border-red-200">
                          Ditolak
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: PROFILE ==================== */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-[20px] w-full animate-in fade-in duration-200">
              
              {/* Profile Card Header */}
              <div className="flex flex-col items-center gap-[12px] w-full py-2 bg-gradient-to-b from-blue-50/50 to-transparent rounded-[24px]">
                <div className="w-[72px] h-[72px] border-4 border-surface shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-full overflow-hidden bg-gradient-to-tr from-blue-50 to-indigo-100 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <clipPath id="avatar-clip-profile"><circle cx="50" cy="50" r="48" /></clipPath>
                      <linearGradient id="bg-grad-profile" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#DDE2F8" /><stop offset="100%" stopColor="#E0E0FF" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="url(#bg-grad-profile)" />
                    <g clipPath="url(#avatar-clip-profile)">
                      <path d="M15 45 C10 20 90 20 85 45 C80 50 20 50 15 45 Z" fill="#1E293B" />
                      <rect x="44" y="65" width="12" height="15" rx="3" fill="#FBCFE8" />
                      <circle cx="50" cy="48" r="22" fill="#FCE7F3" />
                      <path d="M28 45 C28 25 72 25 72 45 C72 25 50 25 28 45 Z" fill="#1E293B" />
                      <path d="M28 35 C32 25 45 28 48 35 C52 28 65 25 72 35" fill="none" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="43" cy="46" r="2" fill="#1E293B" /><circle cx="57" cy="46" r="2" fill="#1E293B" />
                      <path d="M46 56 C46 60 54 60 54 56" fill="none" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
                      <path d="M20 80 C20 70 35 68 50 68 C65 68 80 70 80 80 V100 H20 V80 Z" fill="#93C5FD" />
                      <path d="M42 68 L50 76 L58 68" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
                    </g>
                  </svg>
                </div>
                <div className="flex flex-col items-center">
                  <h2 className="font-sans font-bold text-[18px] leading-[24px] text-text-primary tracking-tight">
                    Cahyadi Prasetyo
                  </h2>
                  <span className="font-mono text-[12px] text-text-secondary leading-[18px]">
                    NIM. 2200018001
                  </span>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="flex flex-col w-full bg-surface border border-border shadow-[0px_1px_2px_rgba(0,0,0,0.03)] rounded-[20px] overflow-hidden divide-y divide-border/60">
                
                {/* Name Row */}
                <div className="flex items-center justify-between p-[16px]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-text-secondary">Nama Lengkap</span>
                    <span className="text-[14px] font-semibold text-text-primary mt-0.5">Cahyadi Prasetyo</span>
                  </div>
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>

                {/* NIM Row */}
                <div className="flex items-center justify-between p-[16px]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-text-secondary">NIM Peserta</span>
                    <span className="font-mono text-[14px] font-semibold text-text-primary mt-0.5">2200018001</span>
                  </div>
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                </div>

                {/* Password Sensor Row */}
                <div className="flex items-center justify-between p-[16px]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold tracking-[0.5px] uppercase text-text-secondary">Kata Sandi</span>
                    <span className="text-[14px] font-mono font-semibold text-text-primary mt-0.5">••••••••</span>
                  </div>
                  <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>

              </div>

              {/* Change Password CTA button */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex flex-row justify-center items-center py-[12px] w-full h-[44px] rounded-full border border-[#C6C5D8] bg-surface text-text-primary font-sans font-bold text-[13px] tracking-[0.8px] uppercase select-none transition-all active:scale-[0.98] cursor-pointer hover:bg-slate-50 mt-2"
              >
                Ubah Password
              </button>

            </div>
          )}

        </div>

      </div>

      {/* 3. Floating Bottom Navigation Bar */}
      <div className="fixed bottom-[15px] left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[350px] h-[64px] bg-surface border border-[#C6C5D8] shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-full z-20 flex flex-row items-center justify-between px-[30px]">
        
        {/* Navigation Item 1: Home */}
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col justify-center items-center p-0 w-[48px] h-[48px] rounded-full transition-colors ${
            activeTab === "home" ? "text-primary-active" : "text-text-secondary hover:text-primary-active"
          }`}
        >
          <div className="flex flex-col items-center justify-center w-[16px] h-[18px]">
            <svg className="w-[16px] h-[18px]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
              <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
            </svg>
          </div>
          {activeTab === "home" && (
            <div className="flex flex-col items-center pt-[4px] w-[4px] h-[8px]">
              <div className="w-[4px] h-[4px] bg-primary-active rounded-full" />
            </div>
          )}
        </button>

        {/* Navigation Item 2: History */}
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col justify-center items-center p-0 w-[48px] h-[48px] rounded-full transition-colors ${
            activeTab === "history" ? "text-primary-active" : "text-text-secondary hover:text-primary-active"
          }`}
        >
          <div className="w-[18px] h-[18px] flex items-center justify-center">
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {activeTab === "history" && (
            <div className="flex flex-col items-center pt-[4px] w-[4px] h-[8px]">
              <div className="w-[4px] h-[4px] bg-primary-active rounded-full" />
            </div>
          )}
        </button>

        {/* Navigation Item 3: Profile */}
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col justify-center items-center p-0 w-[48px] h-[48px] rounded-full transition-colors ${
            activeTab === "profile" ? "text-primary-active" : "text-text-secondary hover:text-primary-active"
          }`}
        >
          <div className="w-[16px] h-[16px] flex items-center justify-center">
            <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          {activeTab === "profile" && (
            <div className="flex flex-col items-center pt-[4px] w-[4px] h-[8px]">
              <div className="w-[4px] h-[4px] bg-primary-active rounded-full" />
            </div>
          )}
        </button>

      </div>

      {/* 4. Success Check In Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#1B1B24]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative box-sizing-border-box flex flex-col items-center p-[24px] gap-[24px] w-[350px] bg-surface border border-border shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-[32px] select-none animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 rounded-full hover:bg-border/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-[150px] h-[150px] flex items-center justify-center mt-2">
              <div className="absolute w-[120px] h-[120px] bg-primary-ghost/60 rounded-full" />
              <div className="absolute top-4 left-4 w-3.5 h-3.5 bg-[#722100]/90 rounded-sm transform rotate-[25deg]" />
              <div className="absolute bottom-6 right-4 w-2 h-2 bg-[#FFDBCF] rounded-full" />
              <div className="absolute bottom-6 left-6 w-4 h-[3px] bg-[#363CD5] transform -rotate-[35deg] rounded-full" />
              <div className="absolute top-8 right-6 w-2 h-2 bg-primary rounded-full" />
              <svg viewBox="0 0 100 100" className="relative z-10 w-[100px] h-[100px]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="28" y="12" width="44" height="76" rx="10" stroke="#363CD5" strokeWidth="4" fill="#FFFFFF" />
                <rect x="34" y="20" width="32" height="56" rx="6" fill="#E0E0FF" fillOpacity="0.5" />
                <circle cx="68" cy="20" r="14" fill="#10B981" />
                <path d="M62 20 L66 24 L74 16" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex flex-col items-center gap-[8px] w-full text-center">
              <h3 className="font-sans font-bold text-[20px] leading-[28px] text-text-primary">Successfully Checked In!</h3>
              <p className="font-sans font-medium text-[13px] leading-[20px] text-text-secondary px-2">You have successfully checked in for your attendance! Have a great day at work!</p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="flex flex-row justify-center items-center py-[12px] w-full h-[40px] bg-primary hover:bg-primary-active text-white rounded-full font-sans font-bold text-[12px] tracking-[0.6px] uppercase select-none transition-all active:scale-[0.98]"
            >
              Back to home
            </button>
          </div>
        </div>
      )}

      {/* 5. Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[#1B1B24]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
          {/* Modal Box Form */}
          <form
            onSubmit={handleSavePassword}
            className="relative box-sizing-border-box flex flex-col items-start p-[24px] gap-[20px] w-[350px] bg-surface border border-border shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-[32px] select-none animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary p-1.5 rounded-full hover:bg-border/50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header Text */}
            <div className="flex flex-col gap-1 text-left w-full mt-2">
              <h3 className="font-sans font-bold text-[18px] leading-[26px] text-text-primary tracking-tight">
                Ubah Kata Sandi
              </h3>
              <p className="font-sans font-medium text-[12px] leading-[16px] text-text-secondary">
                Harap masukkan kata sandi lama dan baru untuk memperbarui akun.
              </p>
            </div>

            {/* Input Fields */}
            <div className="flex flex-col gap-4 w-full">
              
              {/* Old Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-text-secondary">Password Lama</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  className="w-full h-[40px] px-3.5 rounded-[12px] border border-border bg-slate-50 text-[13px] text-text-primary focus:outline-none focus:border-primary focus:bg-surface transition-all"
                  required
                />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-text-secondary">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-[40px] px-3.5 rounded-[12px] border border-border bg-slate-50 text-[13px] text-text-primary focus:outline-none focus:border-primary focus:bg-surface transition-all"
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-text-secondary">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full h-[40px] px-3.5 rounded-[12px] border border-border bg-slate-50 text-[13px] text-text-primary focus:outline-none focus:border-primary focus:bg-surface transition-all"
                  required
                />
              </div>

            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="flex flex-row justify-center items-center py-[12px] w-full h-[44px] bg-primary hover:bg-primary-active text-white rounded-full font-sans font-bold text-[12px] tracking-[0.6px] uppercase select-none transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              Simpan Sandi Baru
            </button>

          </form>
        </div>
      )}

    </div>
  );
}
