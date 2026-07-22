"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { haversineDistance } from "@/lib/haversine";
import { verifyPassword, createEncryptedPassword } from "@/lib/auth";
import AbsenMobile, { HistoryItem } from "./components/AbsenMobile";
import AbsenDesktop from "./components/AbsenDesktop";

// =========================================================================
// MAIN CONTAINER (Parent State Controller)
// =========================================================================
function AbsenPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Config state (loaded dynamically from database or search parameters)
  const [poskoLat, setPoskoLat] = useState<number>(0);
  const [poskoLng, setPoskoLng] = useState<number>(0);
  const [poskoRadius, setPoskoRadius] = useState<number>(300);
  const [absenBuka, setAbsenBuka] = useState<string>("06:00");
  const [absenTutup, setAbsenTutup] = useState<string>("08:00");

  // User session from localStorage
  const [studentName, setStudentName] = useState<string>("");
  const [studentNim, setStudentNim] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<string>("--:-- AM");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [checkInError, setCheckInError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Date display
  const now = new Date();
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const currentDate = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  // Shared Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Toast notification system
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // History Log from Supabase
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // Load user session and fetch history
  const fetchHistory = useCallback(async (nim: string) => {
    const { data } = await supabase
      .from("absensi")
      .select("*")
      .eq("nim", nim)
      .order("tanggal", { ascending: false })
      .limit(30);

    if (data) {
      const dayNamesList = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const monthList = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const items: HistoryItem[] = data.map((row) => {
        const d = new Date(row.tanggal);
        const submitTime = new Date(row.waktu_submit);
        let hours = submitTime.getHours();
        const minutes = submitTime.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return {
          id: row.id,
          date: `${dayNamesList[d.getDay()]}, ${d.getDate()} ${monthList[d.getMonth()]} ${d.getFullYear()}`,
          time: `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`,
          distance: `${Math.round(row.jarak_meter)}m dari posko`,
          status: row.status as "valid" | "telat",
          rawDate: row.tanggal,
        };
      });
      setHistoryList(items);

      // Check if already checked in today
      const today = new Date().toISOString().split("T")[0];
      const todayEntry = data.find((r) => r.tanggal === today);
      if (todayEntry) {
        setIsCheckedIn(true);
        const t = new Date(todayEntry.waktu_submit);
        let h = t.getHours();
        const m = t.getMinutes().toString().padStart(2, "0");
        const ap = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        setCurrentTime(`${h.toString().padStart(2, "0")}:${m} ${ap}`);
      }
    }
  }, []);

  // Load posko settings dynamically from database or URL query params
  useEffect(() => {
    const loadSettings = async () => {
      // 1. Fetch live settings from Supabase database (primary source of truth)
      const { data: dbSettings } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      if (dbSettings) {
        setPoskoLat(Number(dbSettings.latitude));
        setPoskoLng(Number(dbSettings.longitude));
        setPoskoRadius(Number(dbSettings.radius));
        setAbsenBuka(dbSettings.jam_buka);
        setAbsenTutup(dbSettings.jam_tutup);
      } else {
        // 2. Parse query parameters if database settings not available
        const urlLat = searchParams.get("lat");
        const urlLng = searchParams.get("lng");
        const urlRadius = searchParams.get("radius");
        const urlBuka = searchParams.get("buka");
        const urlTutup = searchParams.get("tutup");

        if (urlLat && urlLng) {
          setPoskoLat(parseFloat(urlLat));
          setPoskoLng(parseFloat(urlLng));
          if (urlRadius) setPoskoRadius(parseInt(urlRadius, 10));
          if (urlBuka) setAbsenBuka(urlBuka);
          if (urlTutup) setAbsenTutup(urlTutup);
        }
      }
    };

    loadSettings();
  }, [searchParams]);

  const [fotoUrl, setFotoUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("kkn_user");
      if (!userJson) {
        router.push("/login");
        return;
      }
      const user = JSON.parse(userJson);
      // If admin accidentally lands here, redirect to admin
      if (user.role === "admin") {
        router.push("/admin");
        return;
      }
      setStudentName(user.nama || "");
      setStudentNim(user.nim || "");
      if (user.foto_url) setFotoUrl(user.foto_url);
      if (user.nim) {
        fetchHistory(user.nim);
      }
    }
  }, [fetchHistory, router]);

  const updateMahasiswaFoto = async (url: string) => {
    const { error } = await supabase
      .from("mahasiswa")
      .update({ foto_url: url })
      .eq("nim", studentNim);

    if (error) {
      showToast("Gagal menyimpan foto ke database.", "error");
    } else {
      setFotoUrl(url);
      const userJson = localStorage.getItem("kkn_user");
      if (userJson) {
        const user = JSON.parse(userJson);
        user.foto_url = url;
        localStorage.setItem("kkn_user", JSON.stringify(user));
      }
      showToast("Foto profil berhasil diperbarui!", "success");
    }
    setIsUploadingAvatar(false);
  };

  const handleUploadAvatar = async (file: File) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ukuran foto maksimal 2MB!", "error");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${studentNim}_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // Fallback: Convert to Base64 data URL if bucket doesn't exist
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Url = reader.result as string;
          await updateMahasiswaFoto(base64Url);
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await updateMahasiswaFoto(urlData.publicUrl);
    } catch {
      showToast("Gagal mengunggah foto profil. Coba lagi.", "error");
      setIsUploadingAvatar(false);
    }
  };

  const [previewFotoUrl, setPreviewFotoUrl] = useState<string | null>(null);

  const handleDeleteAvatar = async () => {
    setIsUploadingAvatar(true);
    const { error } = await supabase
      .from("mahasiswa")
      .update({ foto_url: null })
      .eq("nim", studentNim);

    if (error) {
      showToast("Gagal menghapus foto profil.", "error");
    } else {
      setFotoUrl("");
      const userJson = localStorage.getItem("kkn_user");
      if (userJson) {
        const user = JSON.parse(userJson);
        delete user.foto_url;
        localStorage.setItem("kkn_user", JSON.stringify(user));
      }
      showToast("Foto profil berhasil dihapus!", "success");
    }
    setIsUploadingAvatar(false);
  };



  // Core check-in execution
  const executeCheckIn = async (
    targetLat: number,
    targetLng: number,
    targetRadius: number,
    targetBuka: string,
    targetTutup: string
  ) => {
    if (isCheckedIn || isSubmitting) return;
    setCheckInError("");
    setIsSubmitting(true);

    if (!navigator.geolocation) {
      setCheckInError("Browser tidak mendukung GPS.");
      setIsSubmitting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = haversineDistance(userLat, userLng, targetLat, targetLng);

        // Check if within radius
        if (distance > targetRadius) {
          setCheckInError(`Jarak Anda ${Math.round(distance)}m dari posko (target posko: ${targetLat.toFixed(5)}, ${targetLng.toFixed(5)}). Batas radius ${targetRadius}m.`);
          setIsSubmitting(false);
          return;
        }

        // Strict Time Window Check (Block check-in outside targetBuka - targetTutup WIB)
        const nowTime = new Date();
        const [bukaH, bukaM] = targetBuka.split(":").map(Number);
        const [tutupH, tutupM] = targetTutup.split(":").map(Number);
        const bukaMinutes = bukaH * 60 + (bukaM || 0);
        let tutupMinutes = tutupH * 60 + (tutupM || 0);

        if ((tutupH === 0 && tutupM === 0) || tutupMinutes <= bukaMinutes) {
          tutupMinutes += 24 * 60;
        }

        const currentMinutes = nowTime.getHours() * 60 + nowTime.getMinutes();

        if (currentMinutes < bukaMinutes) {
          setCheckInError(`Absensi belum dibuka. Sesi absensi dibuka pukul ${targetBuka} - ${targetTutup} WIB.`);
          setIsSubmitting(false);
          return;
        }

        if (currentMinutes > tutupMinutes) {
          setCheckInError(`Absensi sudah ditutup! Sesi absensi hari ini berakhir pukul ${targetTutup} WIB.`);
          setIsSubmitting(false);
          return;
        }

        // Status is valid (Hadir) since check-in is performed within the open-close time window configured by Admin
        const status: "valid" | "telat" = "valid";

        const today = nowTime.toISOString().split("T")[0];

        // Check if student already has a record today
        const { data: existingRec } = await supabase
          .from("absensi")
          .select("id")
          .eq("nim", studentNim)
          .eq("tanggal", today)
          .maybeSingle();

        let dbError = null;

        if (existingRec) {
          const { error: err } = await supabase
            .from("absensi")
            .update({
              waktu_submit: nowTime.toISOString(),
              latitude: userLat,
              longitude: userLng,
              jarak_meter: distance,
              status: status,
            })
            .eq("id", existingRec.id);
          dbError = err;
        } else {
          const { error: err } = await supabase.from("absensi").insert({
            nim: studentNim,
            tanggal: today,
            waktu_submit: nowTime.toISOString(),
            latitude: userLat,
            longitude: userLng,
            jarak_meter: distance,
            status: status,
          });
          dbError = err;
        }

        if (dbError) {
          setCheckInError("Gagal mengirim absensi. Coba lagi.");
          setIsSubmitting(false);
          return;
        }

        // Clean permit map leftover if any
        try {
          const permitMapStr = localStorage.getItem("kkn_permit_map");
          if (permitMapStr) {
            const permitMap = JSON.parse(permitMapStr);
            delete permitMap[`${studentNim}_${today}`];
            localStorage.setItem("kkn_permit_map", JSON.stringify(permitMap));
          }
        } catch (e) {
          console.error(e);
        }

        // Success
        let hours = nowTime.getHours();
        const minutes = nowTime.getMinutes().toString().padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        const timeString = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

        setCurrentTime(timeString);
        setIsCheckedIn(true);
        setShowSuccessModal(true);
        setIsSubmitting(false);

        // Refresh history
        fetchHistory(studentNim);
      },
      () => {
        setCheckInError("Gagal mengambil lokasi GPS. Pastikan izin lokasi aktif.");
        setIsSubmitting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Button check-in handler using URL query parameters or fresh DB settings
  const handleCheckIn = async () => {
    // Fetch live settings directly from Supabase DB to ensure freshest coordinates
    const { data: dbSettings } = await supabase
      .from("settings")
      .select("*")
      .limit(1)
      .single();

    const targetLat = dbSettings ? Number(dbSettings.latitude) : poskoLat;
    const targetLng = dbSettings ? Number(dbSettings.longitude) : poskoLng;
    const targetRadius = dbSettings ? Number(dbSettings.radius) : poskoRadius;
    const targetBuka = dbSettings ? dbSettings.jam_buka : absenBuka;
    const targetTutup = dbSettings ? dbSettings.jam_tutup : absenTutup;

    if (dbSettings) {
      setPoskoLat(Number(dbSettings.latitude));
      setPoskoLng(Number(dbSettings.longitude));
      setPoskoRadius(Number(dbSettings.radius));
      setAbsenBuka(dbSettings.jam_buka);
      setAbsenTutup(dbSettings.jam_tutup);
    }

    executeCheckIn(targetLat, targetLng, targetRadius, targetBuka, targetTutup);
  };

  // Camera QR scanner scan success handler
  const handleScanSuccess = async (qrData: string) => {
    try {
      console.log("Scanned QR Code URL:", qrData);
      const url = new URL(qrData);

      const urlLat = url.searchParams.get("lat");
      const urlLng = url.searchParams.get("lng");
      const urlRadius = url.searchParams.get("radius");
      const urlBuka = url.searchParams.get("buka");
      const urlTutup = url.searchParams.get("tutup");

      // Fetch live settings from Supabase
      const { data: dbSettings } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .single();

      const lat = dbSettings ? Number(dbSettings.latitude) : (urlLat ? parseFloat(urlLat) : poskoLat);
      const lng = dbSettings ? Number(dbSettings.longitude) : (urlLng ? parseFloat(urlLng) : poskoLng);
      const radius = dbSettings ? Number(dbSettings.radius) : (urlRadius ? parseInt(urlRadius, 10) : poskoRadius);
      const buka = dbSettings ? dbSettings.jam_buka : (urlBuka || absenBuka);
      const tutup = dbSettings ? dbSettings.jam_tutup : (urlTutup || absenTutup);

      await executeCheckIn(lat, lng, radius, buka, tutup);
    } catch {
      setCheckInError("Format QR Code tidak dikenal.");
    }
  };

  // Handler password update
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast("Harap isi semua kolom password!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi password baru tidak cocok!", "error");
      return;
    }
    if (newPassword.length < 6) {
      showToast("Password baru minimal 6 karakter!", "error");
      return;
    }

    // Verify old password with hash+salt support
    const { data } = await supabase
      .from("mahasiswa")
      .select("password")
      .eq("nim", studentNim)
      .single();

    if (!data) {
      showToast("Password lama salah!", "error");
      return;
    }

    const isOldPasswordValid = await verifyPassword(oldPassword, data.password);
    if (!isOldPasswordValid) {
      showToast("Password lama salah!", "error");
      return;
    }

    // Encrypt new password with salt before storing
    const encryptedNewPassword = await createEncryptedPassword(newPassword);
    await supabase
      .from("mahasiswa")
      .update({ password: encryptedNewPassword })
      .eq("nim", studentNim);

    showToast("Password berhasil diubah!", "success");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(false);
  };

  // Handler profile update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      showToast("Nama lengkap tidak boleh kosong!", "error");
      return;
    }

    await supabase
      .from("mahasiswa")
      .update({ nama: studentName })
      .eq("nim", studentNim);

    // Update local session
    const userJson = localStorage.getItem("kkn_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      user.nama = studentName;
      localStorage.setItem("kkn_user", JSON.stringify(user));
    }

    showToast("Profil berhasil diperbarui!", "success");
  };

  const handleLogout = () => {
    localStorage.removeItem("kkn_user");
    router.push("/login");
  };

  // Shared Time Filter for Statistics
  const [timeFilter, setTimeFilter] = useState<"7days" | "30days" | "All">("7days");

  // Bundled props for children
  const sharedProps = {
    studentName,
    setStudentName,
    studentNim,
    isCheckedIn,
    currentTime,
    handleCheckIn,
    handleScanSuccess,
    handleLogout,
    currentDate,
    historyList,
    showPasswordModal,
    setShowPasswordModal,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handleSavePassword,
    handleSaveProfile,
    timeFilter,
    setTimeFilter,
    checkInError,
    isSubmitting,
    poskoLat,
    poskoLng,
    absenBuka,
    absenTutup,
    fotoUrl,
    isUploadingAvatar,
    handleUploadAvatar,
    handleDeleteAvatar,
    setPreviewFotoUrl,
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC]">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg border backdrop-blur-md text-[13px] font-bold select-none ${
            toast.type === "success"
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-700"
              : toast.type === "error"
              ? "bg-rose-50/95 border-rose-200 text-rose-700"
              : "bg-blue-50/95 border-blue-200 text-blue-700"
          }`}>
            {toast.type === "success" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {toast.type === "error" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            )}
            {toast.type === "info" && (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
            )}
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-current opacity-60 hover:opacity-100 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
      
      {/* 1. DESKTOP VIEW COMPONENT (lg:block, hidden on mobile) */}
      <div className="hidden lg:block w-full">
        <AbsenDesktop {...sharedProps} />
      </div>

      {/* 2. MOBILE VIEW COMPONENT (block, hidden on desktop) */}
      <div className="block lg:hidden w-full">
        <AbsenMobile {...sharedProps} />
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL DIALOG WINDOWS (Rendered at top hierarchy parent level)         */}
      {/* ========================================================================= */}

      {/* Success Check In Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#1B1B24]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative box-sizing-border-box flex flex-col items-center p-[24px] gap-[24px] w-[350px] bg-white border border-slate-200 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-[32px] select-none animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative w-[150px] h-[150px] flex items-center justify-center mt-2">
              <div className="absolute w-[120px] h-[120px] bg-[#E3E8FF]/60 rounded-full" />
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
              <h3 className="font-sans font-bold text-[20px] leading-[28px] text-slate-800">Absensi Berhasil!</h3>
              <p className="font-sans font-medium text-[13px] leading-[20px] text-slate-400 px-2">Kehadiran Anda telah berhasil tercatat. Selamat beraktivitas di posko KKN!</p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="flex flex-row justify-center items-center py-[12px] w-full h-[40px] bg-primary hover:bg-primary-active text-white rounded-full font-sans font-bold text-[12px] tracking-[0.6px] uppercase select-none transition-all active:scale-[0.98] cursor-pointer"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[#1B1B24]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePassword}
            className="relative box-sizing-border-box flex flex-col items-start p-[24px] gap-[20px] w-[350px] bg-white border border-slate-200 shadow-[0px_4px_20px_rgba(0,0,0,0.08)] rounded-[32px] select-none animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col gap-1 text-left w-full mt-2">
              <h3 className="font-sans font-bold text-[18px] leading-[26px] text-slate-800 tracking-tight">Ubah Kata Sandi</h3>
              <p className="font-sans font-medium text-[12px] leading-[16px] text-slate-400">Harap masukkan kata sandi lama dan baru untuk memperbarui akun.</p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5 w-full text-left">
                <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-slate-400">Password Lama</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password lama"
                  className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 bg-slate-50 text-[13px] text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full text-left">
                <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-slate-400">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 bg-slate-50 text-[13px] text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full text-left">
                <label className="text-[11px] font-bold tracking-[0.5px] uppercase text-slate-400">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full h-[40px] px-3.5 rounded-[12px] border border-slate-200 bg-slate-50 text-[13px] text-slate-800 focus:outline-none focus:border-primary focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex flex-row justify-center items-center py-[12px] w-full h-[44px] bg-primary hover:bg-primary-active text-white rounded-full font-sans font-bold text-[12px] tracking-[0.6px] uppercase select-none transition-all active:scale-[0.98] mt-2 cursor-pointer"
            >
              Simpan Sandi Baru
            </button>
          </form>
        </div>
      )}



      {/* Lightbox Preview Foto Profil */}
      {previewFotoUrl && (
        <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative flex flex-col items-center gap-4 max-w-sm w-full bg-slate-900 border border-slate-700/80 p-5 rounded-[28px] shadow-2xl select-none">
            <button
              type="button"
              onClick={() => setPreviewFotoUrl(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 shadow-inner mt-2">
              <img src={previewFotoUrl} alt="Preview Foto Profil" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-between w-full px-1">
              <div className="flex flex-col text-left">
                <span className="text-[13px] font-bold text-white">{studentName}</span>
                <span className="text-[10px] font-mono text-slate-400">{studentNim}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFotoUrl(null)}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AbsenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-sans text-slate-500 font-bold bg-[#F8FAFC]">Memuat Portal Absensi...</div>}>
      <AbsenPageContent />
    </Suspense>
  );
}
