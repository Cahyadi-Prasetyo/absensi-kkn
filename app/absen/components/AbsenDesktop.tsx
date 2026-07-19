"use client";

import React, { useState } from "react";
import { AbsenProps, HistoryItem } from "./AbsenMobile";

// Logo brand mirip HoomanRD (dua lingkaran bertumpuk transparan)
function BrandLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg className="w-8 h-8 text-primary flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="16" r="10" fill="#363CD5" fillOpacity="0.85" />
        <circle cx="20" cy="16" r="10" fill="#60A5FA" fillOpacity="0.75" />
      </svg>
      <span className="font-extrabold text-[20px] text-[#0F172A] tracking-tight">Portal Absensi</span>
    </div>
  );
}

// Avatar helper
function Avatar({ className = "w-8 h-8" }: { className?: string }) {
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

export default function AbsenDesktop(props: AbsenProps) {
  const [activeTab, setActiveTab] = useState<"home" | "history" | "profile">("home");
  
  // Local filter states for history tab
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Read shared Time Filter from parent page props
  const { timeFilter, setTimeFilter } = props;

  // Filtered history list for table log (History tab)
  const filteredLogs = props.historyList.filter((item) => {
    const matchesSearch = item.date.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || 
                          (statusFilter === "Valid" && item.status === "valid") ||
                          (statusFilter === "Late" && item.status === "telat") ||
                          (statusFilter === "Out of Radius" && item.status === "luar_radius");
    return matchesSearch && matchesStatus;
  });

  // Dynamic values based on Employee Statistic time filter selection
  const statValues = {
    "7days": {
      presence: "5 Days",
      presenceBadge: "↗ 2% Month",
      presenceBadgeColor: "text-[#10B981] bg-emerald-50 border-emerald-100",
      today: "28",
      todayBadge: "↗ 4% Month",
      todayBadgeColor: "text-[#10B981] bg-emerald-50 border-emerald-100",
      notPresent: "00",
      notPresentBadge: "0% Change",
      notPresentBadgeColor: "text-slate-400 bg-slate-50 border-slate-200/60"
    },
    "30days": {
      presence: "15 Days",
      presenceBadge: "↗ 8% Month",
      presenceBadgeColor: "text-[#10B981] bg-emerald-50 border-emerald-100",
      today: "30",
      todayBadge: "↘ 2% Month",
      todayBadgeColor: "text-[#EF4444] bg-rose-50 border-rose-100",
      notPresent: "03",
      notPresentBadge: "↗ 3% Month",
      notPresentBadgeColor: "text-[#EF4444] bg-rose-50 border-rose-100"
    },
    "All": {
      presence: "45 Days",
      presenceBadge: "↗ 12% Overall",
      presenceBadgeColor: "text-[#10B981] bg-emerald-50 border-emerald-100",
      today: "29",
      todayBadge: "↗ 1% Overall",
      todayBadgeColor: "text-[#10B981] bg-emerald-50 border-emerald-100",
      notPresent: "08",
      notPresentBadge: "↗ 5% Overall",
      notPresentBadgeColor: "text-[#EF4444] bg-rose-50 border-rose-100"
    }
  }[timeFilter];

  return (
    <div className="hidden lg:flex min-h-screen bg-[#F8FAFC] w-full flex-row relative font-sans antialiased text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR (Clean sidebar navigation)                               */}
      {/* ========================================================================= */}
      <aside className="w-[260px] h-screen fixed left-0 top-0 bg-white border-r border-[#E5E7EB] z-30 select-none flex flex-col justify-between p-6">
        <div className="flex flex-col gap-8">
          <BrandLogo />

          {/* Navigation - Main Menu */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-3">Main Menu</span>
              <nav className="flex flex-col gap-1">
                {[
                  { id: "home", label: "Dashboard", icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
                    </svg>
                  )},
                  { id: "history", label: "History Logs", icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )},
                  { id: "profile", label: "Profile Settings", icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex items-center gap-3.5 px-3 py-2.5 w-full rounded-xl font-semibold text-[13px] transition-all cursor-pointer ${
                      activeTab === item.id
                        ? "bg-[#F0F2FF] text-primary"
                        : "text-slate-500 hover:text-primary hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Profile Card Summary at Bottom */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 select-none">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-[13px] text-slate-800 leading-tight">{props.studentName}</span>
              <span className="text-[11px] text-slate-400">@cahyadi</span>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 4.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 16.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT AND HEADER SECTION                                       */}
      {/* ========================================================================= */}
      <div className="flex-grow pl-[260px] min-h-screen flex flex-col">
        
        {/* Top Header Bar (Clean, no buttons) */}
        <header className="h-[80px] w-[calc(100%-260px)] fixed left-[260px] top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-20 flex items-center justify-between px-8 border-b border-slate-200/50">
          <div className="flex flex-col text-left select-none">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Have a great day, {props.studentName.split(" ")[0]}!
            </h1>
            <span className="text-[11px] font-mono text-slate-400 mt-0.5">
              It's {props.currentDate}
            </span>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* 3. MAIN DASHBOARD CONTENT GRID                                           */}
        {/* ========================================================================= */}
        <main className="pt-[80px] px-8 pb-10 flex-grow flex flex-col gap-6 select-none mt-4">

          {/* TAB 1: HOME (Extremely clean bento layout) */}
          {activeTab === "home" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
              
              {/* Row 1: Scan & Check In card (exactly like mockup) & Employee Statistics */}
              <div className="grid grid-cols-12 gap-6 w-full items-stretch">
                
                {/* Left Side: Clean Check In card (Exact design layout) */}
                <div className="col-span-5 bg-white border border-slate-200/60 shadow-[0px_4px_20px_rgba(0,0,0,0.02)] rounded-[24px] p-6 flex flex-col gap-5 justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-[44px] h-[44px] bg-[#EFF6FF] text-[#2D49F3] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="18" height="12" rx="2" /><path d="M7 21h10" /><path d="M12 15v6" />
                      </svg>
                    </div>
                    <span className="font-bold text-[16px] text-slate-800 tracking-tight">Check In</span>
                  </div>

                  {/* Clean scanner target area */}
                  <div className="w-full aspect-[4/3] bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-[20px] flex flex-col items-center justify-center gap-3 select-none p-4">
                    <svg className="w-10 h-10 text-[#94A3B8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="6" height="6" rx="1.5" />
                      <rect x="15" y="3" width="6" height="6" rx="1.5" />
                      <rect x="3" y="15" width="6" height="6" rx="1.5" />
                      <path d="M15 15h2v2h-2zm2 2h2v2h-2zm0-2h2v2h-2z" />
                    </svg>
                    <span className="font-semibold text-[13px] text-slate-500">Scan QR Code to Check In</span>
                    {props.isCheckedIn && (
                      <span className="text-[11px] font-bold text-success uppercase tracking-[0.5px]">Success: {props.currentTime}</span>
                    )}
                  </div>

                  {/* Action trigger button */}
                  <button
                    onClick={props.handleCheckIn}
                    disabled={props.isCheckedIn}
                    className={`w-full py-3.5 rounded-full font-bold text-[12px] uppercase tracking-[0.8px] transition-all active:scale-[0.98] cursor-pointer shadow-md ${
                      props.isCheckedIn 
                        ? "bg-slate-100 text-slate-400 cursor-default shadow-none border border-slate-200/60"
                        : "bg-primary text-white hover:bg-primary-active shadow-primary/10 hover:shadow-primary/20"
                    }`}
                  >
                    {props.isCheckedIn ? "Success Check In" : "CHECK IN NOW"}
                  </button>
                </div>

                {/* Right Side: Employee Statistics (Functional 7days/30days/All filter) */}
                <div className="col-span-7 bg-white border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(0,0,0,0.01)] rounded-[20px] p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-bold text-[14px] text-slate-800 tracking-tight">Employee Statistic</span>
                    <div className="flex bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold select-none cursor-pointer">
                      <button
                        onClick={() => setTimeFilter("7days")}
                        className={`px-3 py-1 rounded-md transition-all ${
                          timeFilter === "7days" ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        7days
                      </button>
                      <button
                        onClick={() => setTimeFilter("30days")}
                        className={`px-3 py-1 rounded-md transition-all ${
                          timeFilter === "30days" ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        30days
                      </button>
                      <button
                        onClick={() => setTimeFilter("All")}
                        className={`px-3 py-1 rounded-md transition-all ${
                          timeFilter === "All" ? "bg-white shadow-sm text-slate-700" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        All
                      </button>
                    </div>
                  </div>

                  {/* Asymmetric Bento Statistics Layout */}
                  <div className="grid grid-cols-2 gap-4 flex-grow mt-4 items-stretch">
                    
                    {/* Bento Box 1: Total Presence (Full Span Top Card) */}
                    <div className="col-span-2 bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-5 flex flex-row items-center justify-between text-left">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Total Presence
                        </span>
                        <span className="text-3xl font-black text-slate-800 font-sans tracking-tight mt-1.5">{statValues.presence}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statValues.presenceBadgeColor}`}>
                        {statValues.presenceBadge}
                      </span>
                    </div>

                    {/* Bento Box 2: Today Attendances (Left Column Card) */}
                    <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-5 flex flex-col justify-between text-left h-[130px]">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Today Attendances
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1 mt-2">
                        <span className="text-3xl font-black text-slate-800 font-sans tracking-tight leading-none">{statValues.today}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-2 ${statValues.todayBadgeColor}`}>
                          {statValues.todayBadge}
                        </span>
                      </div>
                    </div>

                    {/* Bento Box 3: Not Present (Right Column Card) */}
                    <div className="bg-[#F8FAFC] border border-slate-200/50 rounded-xl p-5 flex flex-col justify-between text-left h-[130px]">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Not Present
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-1 mt-2">
                        <span className="text-3xl font-black text-slate-800 font-sans tracking-tight leading-none">{statValues.notPresent}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border mt-2 ${statValues.notPresentBadgeColor}`}>
                          {statValues.notPresentBadge}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: HISTORY (Historical Stats and Log Table) */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
              
              {/* Stats overview banner */}
              <div className="grid grid-cols-4 gap-6 w-full text-left">
                {[
                  { label: "Absensi Valid", val: "13 Hari", bg: "bg-emerald-50 text-emerald-600 border border-emerald-100", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                  { label: "Terlambat", val: "2 Hari", bg: "bg-rose-50 text-rose-600 border border-rose-100", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> },
                  { label: "Luar Radius", val: "1 Hari", bg: "bg-amber-50 text-amber-600 border border-amber-100", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /> },
                  { label: "Persentase Hadir", val: "93.8%", bg: "bg-gradient-to-br from-primary to-[#585E71] text-white", icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 11.517 1.397l-.041.02-.041.02a.75.75 0 01-.76-1.34l.041-.02a.75.75 0 01.203-.057z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h1.5v9H9V9z" /></>, specialClass: "shadow-[0px_4px_12px_rgba(54,60,213,0.15)]" }
                ].map((stat, i) => (
                  <div key={i} className={`border border-[#E5E7EB] rounded-[16px] p-5 flex items-center gap-4 shadow-[0px_1px_2px_rgba(0,0,0,0.02)] ${stat.bg.includes("gradient") ? stat.bg : "bg-white"} ${stat.specialClass || ""}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg.includes("gradient") ? "bg-white/20 text-white" : stat.bg.split(" ")[0] + " " + stat.bg.split(" ")[1]}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">{stat.icon}</svg>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[12px] font-semibold ${stat.bg.includes("gradient") ? "text-white/70" : "text-slate-400"}`}>{stat.label}</span>
                      <span className={`text-[20px] font-bold mt-0.5 ${stat.bg.includes("gradient") ? "text-white" : "text-slate-800"}`}>{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Log Table */}
              <div className="bg-white border border-[#E5E7EB] rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.01)] overflow-hidden text-left flex flex-col p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <span className="font-bold text-[15px] text-slate-800">Semua Riwayat Kehadiran</span>
                  
                  {/* Search and Filters */}
                  <div className="flex flex-row gap-3 items-center flex-wrap select-none text-[12px]">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search Date / Status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[36px] pl-8 pr-4 rounded-lg border border-slate-200 bg-white text-[12px] focus:outline-none focus:border-primary w-[180px]"
                      />
                      <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                      </svg>
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-[36px] px-3 rounded-lg border border-slate-200 bg-white text-[12px] focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Valid">Valid</option>
                      <option value="Late">Late</option>
                      <option value="Out of Radius">Out of Radius</option>
                    </select>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-4 px-6">Hari & Tanggal</th>
                        <th className="py-4 px-6">Waktu Absen</th>
                        <th className="py-4 px-6">Jarak ke Posko</th>
                        <th className="py-4 px-6">Status Validasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {filteredLogs.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-800">{item.date}</td>
                          <td className="py-4 px-6">{item.time}</td>
                          <td className="py-4 px-6 font-mono text-[11px] text-slate-400">{item.distance}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                              item.status === "valid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              item.status === "luar_radius" ? "bg-orange-50 text-orange-600 border-orange-100" :
                              "bg-rose-50 text-rose-600 border-rose-100"
                            }`}>
                              {item.status === "valid" ? "Valid" : item.status === "luar_radius" ? "Luar Radius" : "Telat"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto animate-in fade-in duration-300 text-left">
              
              {/* Card 1: Data Diri (General Information) */}
              <section className="bg-white border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(0,0,0,0.01)] rounded-[24px] p-6 lg:p-8 flex flex-col gap-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-[16px] text-slate-800 tracking-tight">Data Diri</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Perbarui nama lengkap dan informasi profil mahasiswa aktif KKN Anda.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Left avatar edit display */}
                  <div className="flex flex-col items-center gap-3 select-none flex-shrink-0">
                    <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer">
                      <Avatar className="w-full h-full" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-[10px] text-white font-bold">
                        Ganti Foto
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">PNG / JPG maks 2MB</span>
                  </div>

                  {/* Right Input Fields Form */}
                  <form onSubmit={props.handleSaveProfile} className="flex-grow w-full flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Nama Lengkap</label>
                        <input
                          type="text"
                          value={props.studentName}
                          onChange={(e) => props.setStudentName(e.target.value)}
                          placeholder="Nama Lengkap"
                          className="w-full h-[44px] px-4 rounded-[12px] border border-slate-200 bg-white text-[14px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                          required
                        />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">NIM Peserta (Kunci)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value="2200018001"
                            disabled
                            className="w-full h-[44px] pl-4 pr-10 rounded-[12px] border border-slate-200/60 bg-slate-50 text-[14px] font-mono text-slate-400 font-semibold cursor-not-allowed select-none"
                          />
                          <svg className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        className="px-6 h-[40px] bg-primary hover:bg-primary-active text-white rounded-xl font-sans font-bold text-[12px] tracking-[0.5px] uppercase transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-primary/10"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* Card 2: Detail Posko KKN (Authentic Metadata Display) */}
              <section className="bg-white border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(0,0,0,0.01)] rounded-[24px] p-6 lg:p-8 flex flex-col gap-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-[16px] text-slate-800 tracking-tight">Detail Penempatan KKN</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Informasi resmi penempatan posko dan Dosen Pembimbing Lapangan (DPL) Anda.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full text-left">
                  {[
                    { label: "Posko Penempatan", val: "Posko 1 - Yogyakarta" },
                    { label: "Kelompok KKN", val: "Reguler 82 Unit A" },
                    { label: "DPL (Pembimbing)", val: "Dr. Hartono, M.T." },
                    { label: "Wilayah Tugas", val: "Danurejan, Kota Yogyakarta" }
                  ].map((meta, i) => (
                    <div key={i} className="flex flex-col gap-1 border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{meta.label}</span>
                      <span className="text-[13px] font-bold text-slate-700 mt-1 leading-tight">{meta.val}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Card 3: Keamanan & Sandi */}
              <section className="bg-white border border-[#E5E7EB] shadow-[0px_4px_20px_rgba(0,0,0,0.01)] rounded-[24px] p-6 lg:p-8 flex flex-col gap-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-[16px] text-slate-800 tracking-tight">Kata Sandi Akun</h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">Amankan akun Anda dengan mengganti kata sandi secara berkala.</p>
                </div>

                <div className="flex flex-row items-center justify-between gap-6 w-full">
                  <div className="flex flex-col text-left gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password Mask</span>
                    <span className="text-[14px] font-mono font-bold text-slate-400 tracking-[1.5px]">••••••••</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => props.setShowPasswordModal(true)}
                    className="px-5 h-[40px] rounded-xl border border-primary text-primary hover:bg-[#EFF6FF] font-sans font-bold text-[12px] tracking-[0.5px] uppercase transition-all cursor-pointer select-none"
                  >
                    Ubah Kata Sandi
                  </button>
                </div>
              </section>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
