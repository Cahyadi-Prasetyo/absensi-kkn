"use client";

import React, { useState, useEffect, useRef } from "react";

export default function SplashScreen({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFinish = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 600);
  };

  useEffect(() => {
    // Attempt playback immediately when component mounts
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.log("Auto-play error or policy:", err);
      });
    }

    // Safety fallback timeout if video fails to load or play
    const timer = setTimeout(() => {
      handleFinish();
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-[#05070B] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(54,60,213,0.35)_0%,transparent_70%)] animate-pulse" />

      {/* Skip Button */}
      <button
        onClick={handleFinish}
        className="absolute top-6 right-6 z-30 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-lg"
      >
        <span>Lewati Intro</span>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>

      {/* Video Overlay Container */}
      <div className="relative w-full max-w-[92vw] md:max-w-[720px] aspect-video rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_60px_rgba(54,60,213,0.6)] bg-black flex items-center justify-center z-20 backdrop-blur-xl">
        <video
          ref={videoRef}
          src="/video_intro.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleFinish}
          className="w-full h-full object-contain"
        />

        {/* Glossy Frame Highlights */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl border border-white/15 bg-gradient-to-t from-black/50 via-transparent to-white/10" />
      </div>

      {/* Footer Text */}
      <div className="relative z-20 mt-5 flex flex-col items-center gap-1 text-center px-4">
        <h2 className="text-white font-extrabold text-base md:text-lg tracking-tight flex items-center gap-2">
          <span>PORTAL ABSENSI KKN</span>
          <span className="text-xs bg-primary/30 text-blue-300 border border-primary/40 px-2.5 py-0.5 rounded-full font-mono">
            KELOMPOK 8
          </span>
        </h2>
        <p className="text-slate-400 text-xs tracking-wider uppercase font-medium">
          Sungai Enam — Bintan, Kepulauan Riau
        </p>
      </div>

    </div>
  );
}
