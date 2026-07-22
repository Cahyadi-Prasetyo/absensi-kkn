"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import BrandLogo from "@/app/components/BrandLogo";

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

export default function AdminQRPage() {
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

  // Derive URL on client side
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [copySuccess, setCopySuccess] = useState(false);

  // Form parameter states for QR Code encoding
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState(300);
  const [jamBuka, setJamBuka] = useState("06:00");
  const [jamTutup, setJamTutup] = useState("08:00");

  // State to track if QR code has been generated
  const [isGenerated, setIsGenerated] = useState(false);
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);
  const [gpsError, setGpsError] = useState("");

  useEffect(() => {
    // Session guard — only admin can access
    const userJson = localStorage.getItem("kkn_user");
    if (!userJson) { router.push("/login"); return; }
    try {
      const user = JSON.parse(userJson);
      if (user.role !== "admin") { router.push("/absen"); return; }
    } catch { localStorage.removeItem("kkn_user"); router.push("/login"); return; }

    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    // Fetch from Supabase first, fallback to localStorage
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        setLatitude(String(data.latitude));
        setLongitude(String(data.longitude));
        setRadius(data.radius);
        setJamBuka(data.jam_buka);
        setJamTutup(data.jam_tutup);
      } else {
        // Fallback to localStorage cache
        const saved = localStorage.getItem("kkn_settings");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.latitude) setLatitude(parsed.latitude);
            if (parsed.longitude) setLongitude(parsed.longitude);
            if (parsed.radius) setRadius(parsed.radius);
            if (parsed.jamBuka) setJamBuka(parsed.jamBuka);
            if (parsed.jamTutup) setJamTutup(parsed.jamTutup);
          } catch (e) {
            console.error("Error parsing saved settings", e);
          }
        }
      }
    };
    loadSettings();
  }, [router]);

  // Build the target check-in URL dynamically with encoded coordinates and timings
  const qrUrl = `${origin}/absen?lat=${latitude}&lng=${longitude}&radius=${radius}&buka=${jamBuka}&tutup=${jamTutup}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}&color=0f172a&bgcolor=ffffff&qzone=1`;

  // Get DPL's current location to set posko coordinates
  const handleFetchCurrentLocation = () => {
    setIsFetchingGPS(true);
    setGpsError("");
    if (!navigator.geolocation) {
      setGpsError("Browser Anda tidak mendukung layanan Geolocation.");
      setIsFetchingGPS(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setIsFetchingGPS(false);
      },
      (error) => {
        setGpsError("Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif.");
        setIsFetchingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Copy Link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Download QR code image
  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageSrc);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `QR_Code_Absensi_KKN_Posko_1.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback if CORS prevents direct fetch
      window.open(qrImageSrc, "_blank");
    }
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/admin", active: false, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    )},
    { id: "qr", label: "Cetak QR Code", path: "/admin/qr", active: true, icon: (
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
      
      {/* Dynamic Print Styles */}
      <style jsx global>{`
        @media print {
          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-card {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2rem !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. RESPONSIVE TOP NAV BAR FOR MOBILE SCREEN (no-print)                  */}
      {/* ========================================================================= */}
      <header className="lg:hidden w-full h-[60px] bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between sticky top-0 z-40 select-none no-print">
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

      {/* Mobile Drawer Navigation overlay (no-print) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[60px] bg-slate-900/30 backdrop-blur-sm z-30 flex justify-end animate-in fade-in duration-200 no-print">
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
      {/* 2. DESKTOP VIEW SIDEBAR (Visible only on lg screens) (no-print)           */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-[260px] h-screen fixed left-0 top-0 bg-white border-r border-[#E5E7EB] z-30 select-none flex-col justify-between p-6 no-print">
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
      {/* 3. MAIN CONTENT AREA                                                     */}
      {/* ========================================================================= */}
      <div className="flex-grow lg:pl-[260px] min-h-screen flex flex-col">
        
        {/* Header Bar (no-print) */}
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] px-6 items-center justify-between select-none hidden lg:flex no-print">
          <div className="flex flex-col text-left">
            <h1 className="text-[15px] font-black text-slate-900 tracking-tight">Cetak QR Code</h1>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Posko KKN Kel 8 Sungai Enam</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
            Aktif • 20 Mahasiswa
          </div>
        </header>

        {/* Main page content body */}
        <main className="flex-grow p-4 sm:p-8 flex flex-col items-center gap-8 print:p-0">
          
          {!isGenerated ? (
            /* Parameters Preview Card */
            <div className="w-full max-w-[550px] bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-md text-left flex flex-col gap-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <h2 className="text-[14px] font-bold text-slate-800">Parameter Kehadiran Saat Ini</h2>
                  <span className="text-[11px] text-slate-400 font-semibold">Gunakan konfigurasi posko yang aktif untuk mencetak QR Code</span>
                </div>
              </div>

              {/* Settings Info List */}
              <div className="flex flex-col gap-3.5 text-[12px] text-slate-600 font-semibold">
                <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                  <span className="text-slate-400">Koordinat Posko</span>
                  <span className="text-slate-700 font-mono">{latitude}, {longitude}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                  <span className="text-slate-400">Radius Toleransi</span>
                  <span className="text-primary bg-primary/5 px-2 py-0.5 rounded font-extrabold">{radius} Meter</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                  <span className="text-slate-400">Jam Operasional Absen</span>
                  <span className="text-slate-700 font-bold">{jamBuka} - {jamTutup} WIB</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Parameter di atas disinkronkan otomatis dari menu **Posko & Jadwal**. Jika koordinat posko berpindah, silakan sesuaikan terlebih dahulu di menu pengaturan.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerated(true)}
                  className="h-[42px] flex-grow rounded-xl bg-primary hover:bg-primary-active text-white font-bold text-[12px] uppercase tracking-[0.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 active:scale-98"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  <span>Buat QR Code Poster</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/admin/settings")}
                  className="h-[42px] px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span>Ubah Parameter</span>
                </button>
              </div>
            </div>
          ) : (
            /* Poster Display & Print panel */
            <>
              {/* Top action controls panel (no-print) */}
              <div className="w-full max-w-[550px] bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 no-print animate-in fade-in duration-200">
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Metode Distribusi</span>
                  <span className="text-[12px] text-slate-600 font-semibold mt-1">Cetak poster atau bagikan link statis</span>
                </div>
                
                <div className="flex flex-row items-center gap-2">
                  {/* Edit Params */}
                  <button
                    onClick={() => handleNavigate("/admin/settings")}
                    className="h-[36px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <span>Ubah Parameter</span>
                  </button>

                  {/* Copy URL Link */}
                  <button
                    onClick={handleCopyLink}
                    className="h-[36px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                    </svg>
                    <span>{copySuccess ? "Tersalin!" : "Salin Link"}</span>
                  </button>

                  {/* Download QR image */}
                  <button
                    onClick={handleDownloadQR}
                    className="h-[36px] px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Unduh QR</span>
                  </button>

                  {/* Print Poster */}
                  <button
                    onClick={() => window.print()}
                    className="h-[36px] px-4 rounded-lg bg-primary hover:bg-primary-active text-white font-bold text-[11px] uppercase tracking-[0.5px] transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-95"
                  >
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.82l-.24 2.22c-.11.97.64 1.78 1.62 1.78h7.8c.98 0 1.73-.81 1.62-1.78l-.24-2.22m-10.56 0h10.56m-10.56 0L5.25 9.75M18.75 13.82l1.5-4.07M18.75 13.82h3.75M5.25 9.75h13.5M5.25 9.75L9 3h6l3.75 6.75M12 13.5v3.75m0-10.5v1.5" />
                    </svg>
                    <span>Cetak Poster</span>
                  </button>
                </div>
              </div>

              {/* Printable Official Poster Card */}
              <div className="w-full max-w-[550px] bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-md flex flex-col items-center text-center relative print-full-card animate-in zoom-in-95 duration-200 border-t-[8px] border-t-primary">
                
                {/* Header poster */}
                <div className="flex flex-col items-center gap-2 mb-8">
                  <svg className="w-14 h-14 text-primary flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="16" r="10" fill="#363CD5" fillOpacity="0.85" />
                    <circle cx="20" cy="16" r="10" fill="#60A5FA" fillOpacity="0.75" />
                  </svg>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-3">PORTAL ABSENSI KKN</h2>
                  <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200/60 px-4 py-1.5 rounded-full mt-1">
                    Posko KKN Kel 8 Sungai Enam
                  </p>
                </div>

                {/* QR Code Container wrapper */}
                <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center p-3.5 shadow-inner relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrImageSrc}
                    alt="QR Code Absensi KKN"
                    className="w-full h-full object-contain select-none"
                  />
                  <div className="absolute inset-0 border border-slate-200/60 rounded-2xl pointer-events-none" />
                </div>

                {/* Instructions box */}
                <div className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl p-5 sm:p-6 mt-8 text-left">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 text-center sm:text-left">
                    Petunjuk Scan Kehadiran
                  </h3>
                  <ol className="flex flex-col gap-3.5 text-[12px] text-slate-600 font-semibold">
                    <li className="flex items-start gap-3">
                      <span className="w-5.5 h-5.5 rounded-full bg-primary/10 text-primary font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <span>Buka aplikasi **Kamera** di HP atau gunakan **Google Lens**.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5.5 h-5.5 rounded-full bg-primary/10 text-primary font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <span>Pindai QR Code di atas untuk menuju halaman `/absen`.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-5.5 h-5.5 rounded-full bg-primary/10 text-primary font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <span>Lakukan **Login NIM**, izinkan **GPS/Lokasi**, dan kirim kehadiran.</span>
                    </li>
                  </ol>
                </div>

                {/* Poster footer */}
                <div className="mt-10 pt-6 border-t border-slate-100 w-full flex flex-col items-center gap-1 select-none">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    DPL Kelompok Posko 1
                  </span>
                  <span className="text-[12px] font-bold text-slate-800">
                    Dian Kharisma Dewi, S.T.,M.T.
                  </span>
                </div>

              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
