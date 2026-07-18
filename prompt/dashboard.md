---
name: Attendance HRIS Mobile App
description: Modern, approachable mobile dashboard for daily employee/student attendance tracking.
colors:
  primary: "#363CD5"
  primary-ghost: "#E3E8FF"
  background: "#F7F9FC"
  surface: "#FFFFFF"
  text-primary: "#1F2937"
  text-secondary: "#6B7280"
  border: "#F3F4F6"
  success: "#10B981"
typography:
  h1:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  h2:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
  body-md:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label-sm:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "32px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "16px 24px"
  card-standard:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.border}"
  bottom-nav:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm}"
---

## Overview
Aplikasi ini menggunakan pendekatan mobile-first yang bersih dan ramah. Sentuhan warna indigo yang dominan memberikan kesan profesionalisme sekaligus modernitas, memfokuskan user pada satu aksi utama harian: Check In.

## Colors
Warna Primary (`#363CD5`) HANYA digunakan untuk CTA utama (Check In) dan untuk memberikan indikator state aktif pada navigasi, memastikan user tidak bingung kemana harus melakukan aksi.

## Shapes & Layout
Menggunakan ilusi *overlapping sheet* di mana *surface* utama berwarna putih menimpa *background* ilustrasi dengan radius atas 32px. Elemen kartu menggunakan *border* yang sangat halus (hairline) alih-alih bayangan tebal untuk mempertahankan estetika *flat design*.

## Rules to Never Break
- Jangan gunakan bayangan (drop shadow) gelap pada elemen *card* statis, kedalaman didapat dari *border* 1px.
- Tombol utama dan navigasi bawah HARUS selalu menggunakan `rounded-full` (pill shape).
- Ukuran *touch target* tidak boleh lebih kecil dari 44x44px sesuai standar mobilitas.