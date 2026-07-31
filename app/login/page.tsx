"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createEncryptedPassword, verifyPassword } from "@/lib/auth";

import BrandLogo from "@/app/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-redirect if already logged in (persistent session)
  useEffect(() => {
    const userJson = localStorage.getItem("kkn_user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/absen");
        }
      } catch {
        // Invalid JSON, clear it
        localStorage.removeItem("kkn_user");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage("Harap masukkan kredensial Anda!");
      return;
    }

    setIsLoading(true);

    try {
      const inputNim = identifier.trim();

      // Query mahasiswa table by NIM/Username
      const { data, error } = await supabase
        .from("mahasiswa")
        .select("*")
        .eq("nim", inputNim)
        .single();

      if (error || !data) {
        setErrorMessage("NIM atau Username tidak ditemukan. Periksa kembali kredensial Anda.");
        setIsLoading(false);
        return;
      }

      // Validate password using Hashing + Salt verification
      const isPasswordCorrect = await verifyPassword(password, data.password);
      if (!isPasswordCorrect) {
        setErrorMessage("Kata sandi salah. Silakan coba lagi.");
        setIsLoading(false);
        return;
      }

      // Auto-Upgrade: If stored password is still plain text, automatically encrypt it with salt in Supabase DB!
      if (data.password && !data.password.includes("$")) {
        const encrypted = await createEncryptedPassword(password);
        await supabase
          .from("mahasiswa")
          .update({ password: encrypted })
          .eq("nim", inputNim);
      }

      // Check if logged in user is admin
      if (data.nim === "adminsungaienam") {
        localStorage.setItem("kkn_user", JSON.stringify({
          role: "admin",
          nama: data.nama,
          nim: data.nim,
        }));
        router.push("/admin");
        return;
      }

      // Store session for student
      localStorage.setItem("kkn_user", JSON.stringify({
        role: "mahasiswa",
        nama: data.nama,
        nim: data.nim,
        foto_url: data.foto_url,
      }));

      router.push("/absen");
    } catch {
      setErrorMessage("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/60 p-4 relative overflow-hidden select-none font-sans antialiased text-slate-800">
      
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl opacity-60 pointer-events-none" />

      {/* Main Glassmorphic Login Card */}
      <main className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] rounded-[28px] p-8 flex flex-col gap-6 relative z-10 transition-all duration-300 hover:shadow-[0_12px_40px_0_rgba(15,23,42,0.08)]">
        
        {/* Header Section */}
        <header className="flex flex-col items-center justify-center gap-3 text-center mt-1">
          <BrandLogo center={true} size="md" />
          <div className="flex flex-col gap-1 mt-1 text-center">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Selamat Datang Kembali</h1>
            <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
              Masuk ke akun Anda untuk mencatat absensi atau memantau progres posko KKN.
            </p>
          </div>
        </header>

        {/* Unified Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
          
          {/* Error Message banner */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-xl px-4 py-2.5 text-[11px] font-bold flex items-center gap-2 select-none animate-in fade-in duration-200">
              <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Identifier Input (NIM / Username) */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">NIM / Username</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan NIM atau Username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                className="w-full h-[46px] pl-11 pr-4 rounded-[12px] border border-slate-200 bg-white text-[13px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                required
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kata Sandi</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Kata sandi akun Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full h-[46px] pl-11 pr-11 rounded-[12px] border border-slate-200 bg-white text-[13px] text-slate-800 font-semibold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                required
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              
              {/* Show/Hide password toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.956-3.956l-3.9 3.9m0 0a3 3 0 11-4.243-4.243m0 0L12 12" />
                  </svg>
                ) : (
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[46px] bg-primary hover:bg-primary-active disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-default text-white rounded-full font-sans font-bold text-[13px] tracking-[0.8px] uppercase select-none transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-primary/10 hover:shadow-primary/20 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk Sekarang</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <footer className="border-t border-slate-100 pt-4 flex flex-col gap-1 text-center select-none">
          <span className="text-[10px] font-semibold text-slate-400">
            Sistem Absensi KKN — Posko KKN Kel 8 Sungai Enam
          </span>
        </footer>

      </main>
    </div>
  );
}
