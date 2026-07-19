"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Logo brand KKN (dua lingkaran bertumpuk transparan)
function BrandLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg className="w-8 h-8 text-primary flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="16" r="10" fill="#363CD5" fillOpacity="0.85" />
        <circle cx="20" cy="16" r="10" fill="#60A5FA" fillOpacity="0.75" />
      </svg>
      <span className="font-extrabold text-[20px] text-[#0F172A] tracking-tight">Portal KKN</span>
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

// Interface for attendance logs
interface AdminLogItem {
  id: string;
  nim: string;
  name: string;
  date: string;
  day: string;
  time: string;
  status: "valid" | "telat";
}

const convertDayToIndo = (dayEng: string) => {
  const dayMap: { [key: string]: string } = {
    "Sunday": "Minggu",
    "Monday": "Senin",
    "Tuesday": "Selasa",
    "Wednesday": "Rabu",
    "Thursday": "Kamis",
    "Friday": "Jumat",
    "Saturday": "Sabtu"
  };
  return dayMap[dayEng] || dayEng;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation handlers
  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("kkn_user");
    router.push("/login");
  };

  // Mobile sidebar menu toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active sub-navigation tab
  const [activeSubTab, setActiveSubTab] = useState<"attendance" | "leave">("attendance");

  // Attendance logs fetched from Supabase
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch attendance data from Supabase
  const fetchLogs = useCallback(async () => {
    setIsLoadingData(true);
    const { data, error } = await supabase
      .from("absensi")
      .select("id, nim, tanggal, waktu_submit, status, mahasiswa(nama)")
      .neq("nim", "adminsungaienam")
      .order("tanggal", { ascending: false });

    if (!error && data) {
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const mapped: AdminLogItem[] = data.map((row: Record<string, unknown>) => {
        const d = new Date(row.tanggal as string);
        const submitTime = new Date(row.waktu_submit as string);
        let hours = submitTime.getHours();
        const minutes = submitTime.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const mahasiswaData = row.mahasiswa as { nama: string } | null;
        return {
          id: row.id as string,
          nim: row.nim as string,
          name: mahasiswaData?.nama || (row.nim as string),
          date: row.tanggal as string,
          day: dayNames[d.getDay()],
          time: `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`,
          status: row.status as "valid" | "telat",
        };
      });
      setLogs(mapped);
    }
    setIsLoadingData(false);
  }, []);

  // Fetch total student count
  useEffect(() => {
    // Session guard — only admin can access this page
    const userJson = localStorage.getItem("kkn_user");
    if (!userJson) {
      router.push("/login");
      return;
    }
    try {
      const user = JSON.parse(userJson);
      if (user.role !== "admin") {
        router.push("/absen");
        return;
      }
    } catch {
      localStorage.removeItem("kkn_user");
      router.push("/login");
      return;
    }

    const fetchStudentCount = async () => {
      const { count } = await supabase
        .from("mahasiswa")
        .select("*", { count: "exact", head: true })
        .neq("nim", "adminsungaienam");
      setTotalStudents(count || 0);
    };
    fetchStudentCount();
    fetchLogs();
  }, [fetchLogs, router]);

  // Selected row state for mass delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Custom range filter dates
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-07-31");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Individual delete handler
  const handleDeleteRow = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus log absensi untuk ${name}?`)) {
      await supabase.from("absensi").delete().eq("id", id);
      setLogs(prev => prev.filter(l => l.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  // Mass delete handler
  const handleMassDelete = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data absensi secara masal?`)) {
      await supabase.from("absensi").delete().in("id", selectedIds);
      setLogs(prev => prev.filter(l => !selectedIds.includes(l.id)));
      setSelectedIds([]);
    }
  };

  // Calculations
  const presentCount = logs.filter(l => l.status === "valid" || l.status === "telat").length;
  const ratio = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const lateCount = logs.filter(l => l.status === "telat").length;

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.nim.includes(searchQuery);
    
    let matchesStatus = true;
    if (statusFilter === "Hadir") {
      matchesStatus = log.status === "valid" || log.status === "telat";
    } else if (statusFilter === "Tidak Hadir") {
      matchesStatus = false;
    }
    
    const logTime = new Date(log.date).getTime();
    const start = startDate ? new Date(startDate).getTime() : 0;
    const end = endDate ? new Date(endDate).getTime() + 86399999 : Infinity;
    const matchesDate = logTime >= start && logTime <= end;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination calculation
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // Export Excel
  const handleExportExcel = () => {
    // 1. Get dates in range
    const getDatesInRange = (startStr: string, endStr: string) => {
      const dates: string[] = [];
      let current = new Date(startStr);
      const end = new Date(endStr);
      let safetyCap = 0;
      while (current <= end && safetyCap < 60) {
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, "0");
        const dd = String(current.getDate()).padStart(2, "0");
        dates.push(`${yyyy}-${mm}-${dd}`);
        current.setDate(current.getDate() + 1);
        safetyCap++;
      }
      return dates;
    };
    const rangeDates = getDatesInRange(startDate, endDate);

    // 2. Format header date labels (e.g. "18 Jul")
    const formatHeaderDate = (dateStr: string) => {
      const d = new Date(dateStr);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      return `${d.getDate()} ${months[d.getMonth()]}`;
    };
    const dateHeaders = rangeDates.map(formatHeaderDate);

    const tableHeaders = ["NIM", "Nama", ...dateHeaders, "Total Hadir", "% Kehadiran"];

    // 3. Build student list from logs (unique students)
    const studentMap = new Map<string, { nim: string; name: string }>();
    logs.forEach(l => {
      if (!studentMap.has(l.nim)) {
        studentMap.set(l.nim, { nim: l.nim, name: l.name });
      }
    });
    const studentList = Array.from(studentMap.values());

    // Filter students by search query if DPL filters by student name
    const activeStudents = studentList.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.includes(searchQuery)
    );

    // 4. Build Excel rows
    const rowsHtml = activeStudents.map(student => {
      let attendedCount = 0;
      
      const dateCellsHtml = rangeDates.map(targetDate => {
        const logEntry = logs.find(l => l.nim === student.nim && l.date === targetDate);
        if (logEntry) {
          attendedCount++;
          return `<td style="color: #10B981; font-weight: bold; text-align: center;">✓ ${logEntry.time}</td>`;
        }
        return `<td style="color: #EF4444; text-align: center;">✗</td>`;
      }).join("");

      const totalDays = rangeDates.length || 1;
      const pct = Math.round((attendedCount / totalDays) * 100);

      return `
        <tr>
          <td style="mso-number-format:'\\\\@';">${student.nim}</td>
          <td style="font-weight: bold;">${student.name}</td>
          ${dateCellsHtml}
          <td style="text-align: center; font-weight: bold;">${attendedCount}/${totalDays}</td>
          <td style="text-align: center; font-weight: bold; color: #312E81;">${pct}%</td>
        </tr>
      `;
    }).join("");

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Rekap Absensi KKN</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
        <style>
          th { background-color: #EEF2FF; color: #312E81; font-weight: bold; border: 1px solid #E2E8F0; padding: 8px; text-align: center; }
          td { border: 1px solid #E2E8F0; padding: 8px; }
        </style>
      </head>
      <body>
        <table>
          <thead>
            <tr>
              ${tableHeaders.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelHtml], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const filename = `Rekap_Absensi_KKN_Dari_${startDate}_sd_${endDate}.xls`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/admin", active: true, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    )},
    { id: "qr", label: "Cetak QR Code", path: "/admin/qr", active: false, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="15" width="6" height="6" rx="1" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15h2v2h-2zm2 2h2v2h-2zm0-2h2v2h-2z" />
      </svg>
    )},
    { id: "settings", label: "Posko & Jadwal", path: "/admin/settings", active: false, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.213-1.28z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] w-full flex flex-col lg:flex-row relative font-sans antialiased text-slate-800">
      
      {/* ========================================================================= */}
      {/* 1. RESPONSIVE TOP NAV BAR FOR MOBILE SCREEN                              */}
      {/* ========================================================================= */}
      <header className="lg:hidden w-full h-[60px] bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between sticky top-0 z-40 select-none">
        <BrandLogo />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 rounded-lg text-slate-500 hover:bg-slate-50 cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Drawer Navigation overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-slate-900/30 backdrop-blur-sm z-30 flex justify-end animate-in fade-in duration-200">
          <nav className="w-[260px] h-full bg-white border-l border-slate-200 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="flex flex-col gap-6 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-3">Menu Admin</span>
              <div className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3.5 px-3 py-2.5 w-full rounded-xl font-semibold text-[13px] transition-all cursor-pointer ${
                      item.active
                        ? "bg-[#F0F2FF] text-primary"
                        : "text-slate-500 hover:text-primary hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 text-left">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9" />
                <div className="flex flex-col">
                  <span className="font-bold text-[13px] text-slate-800 leading-tight">Dian Kharisma Dewi, S.T.,M.T.</span>
                  <span className="text-[11px] text-slate-400">Dosen DPL</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/20 text-rose-600 font-bold text-[12px] uppercase tracking-[0.5px] cursor-pointer"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW SIDEBAR (Visible only on lg screens)                     */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-[260px] h-screen fixed left-0 top-0 bg-white border-r border-[#E5E7EB] z-30 select-none flex-col justify-between p-6">
        <div className="flex flex-col gap-8">
          <BrandLogo />

          {/* Navigation */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-3">Menu Admin</span>
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.path)}
                    className={`flex items-center gap-3.5 px-3 py-2.5 w-full rounded-xl font-semibold text-[13px] transition-all cursor-pointer relative ${
                      item.active
                        ? "bg-[#F0F2FF] text-primary border-l-[3px] border-primary pl-2.5"
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

        {/* User Info & Logout Button */}
        <div className="flex flex-col gap-4 border-t border-slate-200/60 pt-4 select-none">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-[13px] text-slate-800 leading-tight">Dian Kharisma Dewi, S.T.,M.T.</span>
              <span className="text-[11px] text-slate-400 font-semibold">Super Admin DPL</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/20 text-rose-600 hover:bg-rose-50 font-bold text-[12px] uppercase tracking-[0.5px] transition-all cursor-pointer select-none"
          >
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD CONTENT GRID                                           */}
      {/* ========================================================================= */}
      <div className="flex-grow lg:pl-[260px] min-h-screen flex flex-col">
        
        {/* Header Bar (Desktop & Mobile header title) */}
        <header className="h-[70px] bg-[#F8FAFC] flex items-center justify-between px-6 lg:px-8 border-b border-slate-200/50">
          <div className="flex flex-col text-left select-none">
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
              Rekap Absensi KKN
            </h1>
            <span className="text-[10px] lg:text-[11px] font-mono text-slate-400 mt-0.5">
              Posko KKN Kel 8 Sungai Enam • DPL: Dian Kharisma Dewi, S.T.,M.T.
            </span>
          </div>
        </header>

        {/* Main content body */}
        <main className="px-6 lg:px-8 py-6 flex-grow flex flex-col gap-6 select-none">

          {/* Row 1: HR-Style Statistics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
            {[
              { label: "Total Mahasiswa Tracked", val: `${totalStudents}`, desc: "Total terdaftar di posko 1", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
              { label: "Rasio Kehadiran", val: `${ratio}%`, desc: "Rasio kehadiran saat ini", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
              { label: "Mahasiswa Terlambat", val: `${lateCount}`, desc: "Check-in di atas 08:00 WIB", icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> }
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 flex flex-col justify-between shadow-sm h-[130px]">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                  <svg className="w-5.5 h-5.5 text-[#363CD5]/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">{stat.icon}</svg>
                </div>
                <div className="flex flex-col mt-3">
                  <span className="text-3xl font-black text-slate-900 font-sans tracking-tight leading-none">{stat.val}</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-2">{stat.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Attendance Table Log & Filter controls matching the screenshot style */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden text-left flex flex-col p-6">

             {/* Controls Row (Search and Filter options) */}
            <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 mb-5">
              {/* Left Search input & Page Size Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                <div className="relative w-full sm:w-[240px]">
                  <input
                    type="text"
                    placeholder="Search name or NIM..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[38px] w-full pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
                  </svg>
                </div>

                <div className="flex items-center gap-2 font-semibold text-[11px] text-slate-500 bg-slate-50/50 border border-slate-200/80 px-3 h-[38px] rounded-lg shrink-0 select-none">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="h-[26px] px-1.5 rounded border border-slate-200 bg-white text-[11px] text-slate-700 font-bold focus:outline-none cursor-pointer hover:bg-slate-50"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-slate-400">from {totalItems} data</span>
                </div>
              </div>

              {/* Right Filter & Export Actions */}
              <div className="flex flex-row gap-3 items-center flex-wrap select-none text-[11px] w-full md:w-auto justify-between md:justify-end">
                
                {/* Mulai Tanggal */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mulai:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[38px] px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-700 font-semibold focus:outline-none cursor-pointer shadow-sm hover:bg-slate-50 transition-all"
                  />
                </div>

                {/* Filter Status (Semua Status, Hadir, Tidak Hadir) */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Filter Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[38px] px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-700 font-semibold focus:outline-none cursor-pointer shadow-sm hover:bg-slate-50 transition-all"
                  >
                    <option value="All">Semua Status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Tidak Hadir">Tidak Hadir</option>
                  </select>
                </div>

                {/* Selesai Tanggal */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Selesai:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="h-[38px] px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-700 font-semibold focus:outline-none cursor-pointer shadow-sm hover:bg-slate-50 transition-all"
                  />
                </div>

                {selectedIds.length > 0 && (
                  <button
                    onClick={handleMassDelete}
                    className="h-[38px] px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] uppercase tracking-[0.5px] flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-200 animate-in zoom-in duration-150"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.218c.63.113 1.253.245 1.869.393m-18.966 0C2.477 5.709 3.1 5.576 3.715 5.431m13.064 0a48.667 48.667 0 00-7.363 0m7.363 0V4.5a3.375 3.375 0 00-3.375-3.375h-1.5A3.375 3.375 0 008.25 4.5v.918m7.2 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    <span>Hapus ({selectedIds.length})</span>
                  </button>
                )}

                <button
                  onClick={handleExportExcel}
                  className="h-[38px] px-4 rounded-lg bg-primary hover:bg-primary-active text-white font-bold text-[11px] uppercase tracking-[0.5px] flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-primary/10 hover:shadow-primary/20"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Export Excel</span>
                </button>
              </div>
            </div>

            {/* Attendance Logs Table (Responsive Horizontal Scroll) */}
            <div className="w-full overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full min-w-[700px] border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider select-none">
                    <th className="py-4 px-5 text-left w-12">
                      <input
                        type="checkbox"
                        checked={paginatedLogs.length > 0 && paginatedLogs.every(l => selectedIds.includes(l.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const pageIds = paginatedLogs.map(l => l.id);
                            setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
                          } else {
                            const pageIds = paginatedLogs.map(l => l.id);
                            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
                          }
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-5 text-left">Date</th>
                    <th className="py-4 px-5 text-left">Day</th>
                    <th className="py-4 px-5 text-left">Employee</th>
                    <th className="py-4 px-5 text-left">Check-In</th>
                    <th className="py-4 px-5 text-left">Status</th>
                    <th className="py-4 px-5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((item) => (
                      <tr key={item.id} className={`hover:bg-slate-50/30 transition-colors ${selectedIds.includes(item.id) ? "bg-[#EEF2FF]/20" : ""}`}>
                        <td className="py-3.5 px-5 text-left w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, item.id]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== item.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">{item.date}</td>
                        <td className="py-3.5 px-5 text-slate-500">{convertDayToIndo(item.day)}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-6 h-6" />
                            <span className="font-bold text-slate-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-800 font-semibold">{item.time}</td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-md border ${
                            item.status === "valid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-rose-50 text-rose-600 border-rose-100"
                          }`}>
                            {item.status === "valid" ? "Present" : "Late"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-center flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => alert(`Reviewing log detail for student ${item.name} (${item.nim})`)}
                            className="px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteRow(item.id, item.name)}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 border border-rose-100 rounded-lg bg-rose-50/20 hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <svg className="w-3 h-3 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.218c.63.113 1.253.245 1.869.393m-18.966 0C2.477 5.709 3.1 5.576 3.715 5.431m13.064 0a48.667 48.667 0 00-7.363 0m7.363 0V4.5a3.375 3.375 0 00-3.375-3.375h-1.5A3.375 3.375 0 008.25 4.5v.918m7.2 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                        Tidak ada log absensi mahasiswa yang cocok dengan pencarian / filter Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Row (Matching the screenshot footer style) */}
            <div className="flex flex-row justify-end items-center mt-5 border-t border-slate-100 pt-5 text-slate-500 text-[12px] select-none w-full">
              
              {/* Pagination indicators */}
              <div className="flex items-center gap-1.5 font-bold">
                {/* Prev button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                    currentPage === 1
                      ? "border-slate-100 text-slate-300 cursor-default"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  ‹
                </button>

                {/* Numbered buttons */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === pageNum
                          ? "bg-primary text-white border border-primary shadow-sm"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                    currentPage === totalPages
                      ? "border-slate-100 text-slate-300 cursor-default"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  ›
                </button>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}
