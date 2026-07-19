"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

const MapPicker = dynamic(() => import("./components/MapPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-[280px] bg-slate-100 rounded-xl flex items-center justify-center text-[12px] font-bold text-slate-400 select-none animate-pulse">Memuat Peta...</div>,
});

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

export default function AdminSettingsPage() {
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

  // Configuration States
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radius, setRadius] = useState(300);
  const [jamBuka, setJamBuka] = useState("06:00");
  const [jamTutup, setJamTutup] = useState("08:00");

  // Fetching state
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [gpsError, setGpsError] = useState("");

  // Load settings from Supabase on mount
  useEffect(() => {
    // Session guard — only admin can access
    const userJson = localStorage.getItem("kkn_user");
    if (!userJson) { router.push("/login"); return; }
    try {
      const user = JSON.parse(userJson);
      if (user.role !== "admin") { router.push("/absen"); return; }
    } catch { localStorage.removeItem("kkn_user"); router.push("/login"); return; }

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
        // Cache to localStorage for QR page
        localStorage.setItem("kkn_settings", JSON.stringify({
          latitude: String(data.latitude),
          longitude: String(data.longitude),
          radius: data.radius,
          jamBuka: data.jam_buka,
          jamTutup: data.jam_tutup,
        }));
      }
    };
    loadSettings();
  }, [router]);

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

  // Save Settings handler — upsert to Supabase + cache localStorage
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    // First get existing settings row id
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      // Update existing row
      await supabase
        .from("settings")
        .update({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius,
          jam_buka: jamBuka,
          jam_tutup: jamTutup,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Insert new row
      await supabase
        .from("settings")
        .insert({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius,
          jam_buka: jamBuka,
          jam_tutup: jamTutup,
        });
    }

    // Cache to localStorage for QR page
    localStorage.setItem(
      "kkn_settings",
      JSON.stringify({ latitude, longitude, radius, jamBuka, jamTutup })
    );

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Sidebar Menu Items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", path: "/admin", active: false, icon: (
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
    { id: "settings", label: "Posko & Jadwal", path: "/admin/settings", active: true, icon: (
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
                  <span className="text-[11px] text-slate-400 font-semibold">Dosen DPL</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50/20 text-rose-600 font-bold text-[12px] uppercase tracking-[0.5px] cursor-pointer"
              >
                Keluar Sistem
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW SIDEBAR (Visible only on lg screens)                      */}
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
      {/* 3. MAIN CONTENT AREA                                                     */}
      {/* ========================================================================= */}
      <div className="flex-grow lg:pl-[260px] min-h-screen flex flex-col">
        
        {/* Header Bar */}
        <header className="h-[60px] bg-white border-b border-[#E5E7EB] px-6 items-center justify-between select-none hidden lg:flex">
          <div className="flex flex-col text-left">
            <h1 className="text-[15px] font-black text-slate-900 tracking-tight">Posko & Jadwal</h1>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Konfigurasi Aturan Absensi</span>
          </div>
          <div className="text-[11px] text-slate-400 font-bold bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
            Posko KKN Kel 8 Sungai Enam • Aktif
          </div>
        </header>

        {/* Settings Form Wrapper */}
        <main className="flex-grow p-4 sm:p-8 flex justify-center items-start">
          <form onSubmit={handleSaveSettings} className="w-full max-w-[650px] flex flex-col gap-6 text-left">
            
            {/* Success Toast */}
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-bold text-emerald-800">Pengaturan Berhasil Disimpan!</span>
                  <span className="text-[11px] text-emerald-600">Seluruh mahasiswa kini diatur berdasarkan konfigurasi lokasi dan jam absensi baru ini.</span>
                </div>
              </div>
            )}

            {/* Card 1: GPS Position & Radius */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[14px] font-bold text-slate-800">Koordinat & Radius Posko KKN</h2>
                  <span className="text-[11px] text-slate-400">Jarak absensi dihitung otomatis berdasarkan parameter ini</span>
                </div>
              </div>

              {/* GPS coordinates fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Latitude Koordinat</label>
                  <input
                    type="text"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="h-[38px] px-3 rounded-lg border border-slate-200 text-[12px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Longitude Koordinat</label>
                  <input
                    type="text"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="h-[38px] px-3 rounded-lg border border-slate-200 text-[12px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-white"
                  />
                </div>
              </div>

              {/* Map Coordinate Picker */}
              <MapPicker
                latitude={parseFloat(latitude) || -7.795600}
                longitude={parseFloat(longitude) || 110.369500}
                radius={radius}
                onChange={(lat, lng) => {
                  setLatitude(lat.toFixed(6));
                  setLongitude(lng.toFixed(6));
                }}
              />

              {/* GPS Assistant button */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleFetchCurrentLocation}
                  disabled={isFetchingGPS}
                  className="h-[36px] px-4 self-start rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <svg className={`w-3.5 h-3.5 text-slate-500 ${isFetchingGPS ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>{isFetchingGPS ? "Mengambil GPS..." : "Gunakan Lokasi GPS Saya Sekarang"}</span>
                </button>
                {gpsError && (
                  <span className="text-[10px] font-bold text-rose-500 mt-1">{gpsError}</span>
                )}
              </div>

              {/* Radius field */}
              <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Radius Toleransi (Meter)</label>
                  <span className="text-[11px] font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded">{radius} Meter</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  step="1"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-semibold mt-1">Mahasiswa hanya bisa absen jika berada dalam batas radius posko ini.</span>
              </div>
            </div>

            {/* Card 2: Attendance Timing Schedules */}
            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-[14px] font-bold text-slate-800">Jadwal Jam Absensi</h2>
                  <span className="text-[11px] text-slate-400">Atur batas jendela waktu kirim absensi harian</span>
                </div>
              </div>

              {/* Time pickers fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jam Buka Absensi</label>
                  <input
                    type="time"
                    required
                    value={jamBuka}
                    onChange={(e) => setJamBuka(e.target.value)}
                    className="h-[38px] px-3 rounded-lg border border-slate-200 text-[12px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jam Tutup Absensi</label>
                  <input
                    type="time"
                    required
                    value={jamTutup}
                    onChange={(e) => setJamTutup(e.target.value)}
                    className="h-[38px] px-3 rounded-lg border border-slate-200 text-[12px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 mt-2 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Zona waktu menggunakan **Waktu Indonesia Barat (WIB)**. Mahasiswa yang melakukan absen di luar jam tersebut tidak akan bisa mengirim data absensi.
                </span>
              </div>
            </div>

             {/* Form Save & Redirect Action Buttons */}
            <div className="flex flex-row justify-end items-center gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => handleNavigate("/admin/qr")}
                className="h-[42px] px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-bold text-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.82l-.24 2.22c-.11.97.64 1.78 1.62 1.78h7.8c.98 0 1.73-.81 1.62-1.78l-.24-2.22m-10.56 0h10.56m-10.56 0L5.25 9.75M18.75 13.82l1.5-4.07M18.75 13.82h3.75M5.25 9.75h13.5M5.25 9.75L9 3h6l3.75 6.75M12 13.5v3.75m0-10.5v1.5" />
                </svg>
                <span>Lihat & Cetak QR</span>
              </button>

              <button
                type="submit"
                className="h-[42px] px-6 rounded-xl bg-primary hover:bg-primary-active text-white font-bold text-[12px] uppercase tracking-[0.5px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-98"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Simpan Aturan Absensi</span>
              </button>
            </div>

          </form>
        </main>
      </div>
    </div>
  );
}
