"use client";

import React, { useState } from "react";
import AbsenMobile, { HistoryItem } from "./components/AbsenMobile";
import AbsenDesktop from "./components/AbsenDesktop";

// =========================================================================
// MAIN CONTAINER (Parent State Controller)
// =========================================================================
export default function AbsenPage() {
  // Shared States (Lifting State Up)
  const [studentName, setStudentName] = useState<string>("Cahyadi Prasetyo");
  const [currentTime, setCurrentTime] = useState<string>("--:-- AM");
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [currentDate] = useState<string>("Saturday 18 July, 2026");

  // Shared Change Password States
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Shared Mocking History Log
  const [historyList, setHistoryList] = useState<HistoryItem[]>([
    { id: "1", date: "Friday, 17 July 2026", time: "07:15 AM", distance: "45m dari posko", status: "valid" },
    { id: "2", date: "Thursday, 16 July 2026", time: "07:32 AM", distance: "12m dari posko", status: "valid" },
    { id: "3", date: "Wednesday, 15 July 2026", time: "08:15 AM", distance: "320m dari posko", status: "luar_radius" },
    { id: "4", date: "Tuesday, 14 July 2026", time: "07:05 AM", distance: "58m dari posko", status: "valid" },
    { id: "5", date: "Monday, 13 July 2026", time: "07:44 AM", distance: "15m dari posko", status: "valid" },
    { id: "6", date: "Sunday, 12 July 2026", time: "08:05 AM", distance: "18m dari posko", status: "telat" },
  ]);

  // Handler check in
  const handleCheckIn = () => {
    if (isCheckedIn) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    
    setCurrentTime(timeString);
    setIsCheckedIn(true);
    setShowSuccessModal(true);

    const newItem: HistoryItem = {
      id: (historyList.length + 1).toString(),
      date: currentDate,
      time: timeString,
      distance: "28m dari posko",
      status: "valid"
    };
    setHistoryList([newItem, ...historyList]);
  };

  // Handler password update
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

  // Handler profile update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert("Nama lengkap tidak boleh kosong!");
      return;
    }
    alert("Perubahan profil berhasil disimpan!");
  };

  // Shared Time Filter for Statistics
  const [timeFilter, setTimeFilter] = useState<"7days" | "30days" | "All">("7days");

  // Bundled props for children
  const sharedProps = {
    studentName,
    setStudentName,
    isCheckedIn,
    currentTime,
    handleCheckIn,
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
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC]">
      
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
              <h3 className="font-sans font-bold text-[20px] leading-[28px] text-slate-800">Successfully Checked In!</h3>
              <p className="font-sans font-medium text-[13px] leading-[20px] text-slate-400 px-2">You have successfully checked in for your attendance! Have a great day at KKN!</p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="flex flex-row justify-center items-center py-[12px] w-full h-[40px] bg-primary hover:bg-primary-active text-white rounded-full font-sans font-bold text-[12px] tracking-[0.6px] uppercase select-none transition-all active:scale-[0.98] cursor-pointer"
            >
              Back to Dashboard
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

    </div>
  );
}
