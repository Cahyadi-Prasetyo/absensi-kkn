"use client";

import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textColor?: string;
  center?: boolean;
}

export default function BrandLogo({
  className = "",
  size = "md",
  showText = true,
  textColor = "text-[#0F172A]",
  center = false,
}: BrandLogoProps) {
  const logoHeight =
    size === "sm" ? "h-5" : size === "lg" ? "h-9 md:h-10" : "h-6 md:h-7";
  const textSize =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base md:text-lg";

  return (
    <div
      className={`flex ${
        center
          ? "flex-col items-center justify-center text-center gap-2"
          : "flex-row items-center gap-2.5 max-w-full"
      } select-none ${className}`}
    >
      {/* Logos Container */}
      <div className="flex items-center justify-center gap-1.5 bg-white/90 p-1.5 rounded-xl border border-slate-200/70 shadow-sm shrink-0">
        <img
          src="/logo-kkn.webp"
          alt="Logo KKN"
          className={`${logoHeight} w-auto object-contain transition-transform hover:scale-105`}
        />
        <div className="h-4 w-[1px] bg-slate-200" />
        <img
          src="/logo-umrah.png"
          alt="Logo UMRAH"
          className={`${logoHeight} w-auto object-contain transition-transform hover:scale-105`}
        />
      </div>

      {/* App Brand Name */}
      {showText && (
        <div
          className={`flex flex-col min-w-0 ${
            center ? "items-center text-center" : "text-left"
          }`}
        >
          <span
            className={`font-extrabold ${textSize} ${textColor} tracking-tight leading-tight truncate`}
          >
            Portal KKN
          </span>
          <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5 whitespace-nowrap">
            Kelompok 8
          </span>
        </div>
      )}
    </div>
  );
}
