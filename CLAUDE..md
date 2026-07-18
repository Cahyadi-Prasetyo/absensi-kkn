# Project Overview — Sistem Absensi KKN Berbasis QR Code

## 0. Peran & Aturan Kerja untuk AI Coding Agent

Kamu adalah **senior full-stack engineer** yang bertanggung jawab membangun proyek ini bersama saya (product owner). Ikuti aturan kerja berikut sepanjang proyek:

**Cara kerja**
- Bekerja secara **bertahap (incremental)** — selesaikan satu fitur/modul kecil dulu, jelaskan apa yang sudah dibuat, baru lanjut ke bagian berikutnya. Jangan langsung membangun seluruh aplikasi dalam satu kali jalan.
- Sebelum menulis kode untuk fitur baru, **jelaskan dulu rencana/pendekatan singkat** (file apa yang akan dibuat/diubah, logika utamanya apa) dan tunggu konfirmasi saya sebelum lanjut mengeksekusi, kecuali saya sudah eksplisit bilang "lanjutkan tanpa konfirmasi".
- Jangan berasumsi terhadap kebutuhan yang tidak jelas — tanyakan dulu jika ada ambiguitas penting (misalnya struktur tabel yang belum disebutkan, pilihan library yang tidak disebutkan di dokumen ini).

**Yang WAJIB minta persetujuan dulu sebelum dieksekusi**
- Menjalankan perintah yang mengubah/menghapus data, migrasi database, atau `drop table`/`truncate`
- Instalasi package/dependency baru yang belum disebutkan di overview ini
- Mengubah skema database yang sudah berjalan (menambah/menghapus kolom, mengubah tipe data)
- Push ke branch utama (`main`/`master`) atau proses deploy ke production
- Mengubah file konfigurasi environment (`.env`, kredensial Supabase, API key)
- Menghapus atau menimpa file yang sudah ada tanpa diminta eksplisit

**Yang boleh dikerjakan langsung tanpa perlu tanya dulu**
- Membuat file baru sesuai struktur folder yang sudah disepakati di dokumen ini
- Menulis/memperbaiki kode di fitur yang sedang dikerjakan (dalam lingkup yang sudah disetujui)
- Menjalankan lint, type-check, atau test lokal yang sifatnya read-only/tidak mengubah data

**Prioritas layout: mobile-first**
- Ini tetap aplikasi berbasis website (bukan aplikasi native), tapi hampir semua mahasiswa akan mengakses lewat browser HP saat scan QR. Bangun dan uji tampilan **layout mobile terlebih dahulu** sebelum menyesuaikan ke tampilan tablet/desktop.
- Halaman `/absen` dan `/login` adalah prioritas utama untuk mobile-first, karena ini yang dipakai mahasiswa. Halaman `/admin/*` boleh dioptimalkan untuk desktop terlebih dahulu karena dipakai DPL biasanya dari laptop.
- Gunakan Tailwind responsive utility dengan pendekatan mobile-first (style dasar untuk mobile, tambahkan `sm:`/`md:`/`lg:` untuk breakpoint lebih besar), bukan sebaliknya.
- Komponen interaktif (tombol absen, indikator status lokasi/waktu) harus nyaman disentuh di layar kecil — ukuran tap target minimal ±44px tinggi.

**Kualitas kode**
- Gunakan TypeScript secara konsisten, hindari `any` kecuali benar-benar tidak terhindarkan.
- Validasi input di sisi server (API routes), jangan hanya mengandalkan validasi di frontend — terutama untuk validasi waktu, lokasi, dan status login, karena ini adalah kontrol keamanan inti aplikasi.
- Tulis kode yang mudah dibaca dan beri komentar singkat di bagian logika penting (misalnya perhitungan Haversine, pengecekan jendela waktu).
- Jangan hardcode kredensial atau koordinat lokasi posko di dalam kode — semua harus berasal dari database/environment variable.

**Komunikasi**
- Jika menemukan potensi celah keamanan atau kelemahan desain di luar yang sudah dibahas di overview ini, laporkan dulu ke saya sebelum memutuskan sendiri solusinya.
- Gunakan bahasa Indonesia yang jelas saat menjelaskan progres, kecuali untuk penamaan variabel/kode yang tetap memakai bahasa Inggris standar.

---

## 1. Ringkasan Proyek

Aplikasi web untuk mencatat kehadiran harian **1 kelompok KKN (20 mahasiswa)** menggunakan **1 QR code statis** yang berlaku selama masa KKN (± 30 hari). QR tersebut bukan alat autentikasi utama — QR hanya berfungsi sebagai pintu masuk ke halaman absensi. Validasi kehadiran sesungguhnya ditentukan oleh kombinasi:

1. Identitas mahasiswa (login individual)
2. Jendela waktu absensi (06:00–08:00 WIB)
3. Lokasi GPS mahasiswa dibandingkan dengan titik koordinat posko KKN (radius toleransi)

Dosen Pembimbing Lapangan (DPL) bertindak sebagai **admin tunggal** sistem: memantau rekap kehadiran dan mengekspor data ke spreadsheet/Excel.

**Scope**: sistem ini dibangun khusus untuk **satu kelompok KKN saja** (bukan multi-kelompok/multi-tenant). Tidak perlu dirancang untuk mendukung banyak kelompok, banyak lokasi, atau banyak DPL sekaligus.

---

## 2. Tech Stack

- **Frontend & Backend**: Next.js (App Router, TypeScript)
- **Database & Auth**: Supabase (Postgres + Supabase Auth + Row Level Security)
- **Hosting**: Vercel (disarankan, menyesuaikan Next.js)
- **Export data**: generate file `.xlsx` (menggunakan library seperti `exceljs` atau `xlsx`/SheetJS di sisi server/API route)
- **QR Code**: digenerate sekali di awal (library `qrcode` di Node.js), berisi URL statis menuju halaman absensi kelompok

---

## 3. Aktor & Peran

| Peran | Deskripsi |
|---|---|
| **Admin (DPL)** | Login sebagai admin. Dapat melihat rekap absensi seluruh mahasiswa, mengatur lokasi posko (lat/long + radius), mengatur jam buka/tutup absensi, dan mengekspor data ke Excel. |
| **Mahasiswa (20 orang)** | Login individual dengan NIM + password. Scan QR statis → diarahkan ke halaman absensi → submit kehadiran (sistem otomatis ambil waktu & lokasi GPS). |

---

## 4. Alur Utama (User Flow)

1. Mahasiswa membuka kamera HP → scan QR statis (QR tidak berubah selama KKN berlangsung).
2. QR mengarahkan ke URL halaman absensi (misal `/absen`).
3. Jika belum login → diarahkan ke halaman login (NIM + password).
4. Setelah login, sistem otomatis:
   - Mengecek waktu server saat ini — harus berada dalam rentang **06:00–08:00**. Di luar itu, submit ditolak dengan pesan jelas.
   - Meminta izin lokasi (geolocation browser) → mendapatkan `latitude` & `longitude` HP mahasiswa.
   - Menghitung jarak antara lokasi mahasiswa dan titik posko KKN menggunakan **rumus Haversine**.
   - Jika jarak ≤ radius toleransi → status `valid`. Jika lebih → status `luar_radius` (tetap tercatat, tapi ditandai sebagai tidak valid, agar DPL bisa meninjau).
5. Data absensi disimpan ke database, satu baris per mahasiswa per tanggal.
6. Mahasiswa tidak bisa submit dua kali dalam satu hari (cek constraint unik `nim + tanggal`).
7. DPL login ke dashboard admin → melihat rekap harian/bulanan → klik "Export ke Excel" untuk mengunduh laporan.

---

## 5. Skema Database (Supabase / Postgres)

Karena sistem ini untuk 1 kelompok saja, skema dibuat sederhana (tanpa tabel "kelompok" terpisah).

```sql
-- Data mahasiswa peserta KKN
create table mahasiswa (
  id uuid primary key default gen_random_uuid(),
  nim text unique not null,
  nama text not null,
  password_hash text not null, -- atau gunakan Supabase Auth users table langsung
  created_at timestamp default now()
);

-- Konfigurasi lokasi posko KKN (hanya 1 baris/record karena 1 kelompok)
create table lokasi_posko (
  id uuid primary key default gen_random_uuid(),
  latitude double precision not null,
  longitude double precision not null,
  radius_meter integer not null default 300,
  updated_at timestamp default now()
);

-- Konfigurasi jadwal absensi (bisa statis atau per tanggal jika perlu fleksibel)
create table jadwal_absensi (
  id uuid primary key default gen_random_uuid(),
  jam_buka time not null default '06:00',
  jam_tutup time not null default '08:00'
);

-- Data absensi harian tiap mahasiswa
create table absensi (
  id uuid primary key default gen_random_uuid(),
  nim text references mahasiswa(nim) not null,
  tanggal date not null default current_date,
  waktu_submit timestamptz not null default now(),
  latitude double precision not null,
  longitude double precision not null,
  jarak_meter numeric not null,
  status text not null check (status in ('valid', 'luar_radius', 'telat', 'ditolak')),
  unique (nim, tanggal)
);
```

**Row Level Security (RLS)**: aktifkan RLS di Supabase. Mahasiswa hanya boleh insert data absensinya sendiri (`auth.uid()` dicocokkan ke NIM/mahasiswa terkait); hanya admin (DPL) yang boleh membaca seluruh data & mengubah konfigurasi lokasi/jadwal.

---

## 6. Fitur Utama yang Perlu Dibangun

- [ ] Generate & tampilkan QR code statis (bisa berupa halaman `/admin/qr` untuk dicetak/ditempel)
- [ ] Halaman login mahasiswa (NIM + password, via Supabase Auth)
- [ ] Halaman absensi (`/absen`) — validasi waktu server, ambil geolocation, hitung Haversine, simpan data
- [ ] Validasi: 1 mahasiswa hanya bisa absen 1x per hari
- [ ] Dashboard admin (DPL) — tabel rekap absensi harian, filter per tanggal/mahasiswa, indikator status (valid/luar radius/telat)
- [ ] Halaman pengaturan admin — set/update koordinat posko, radius toleransi, jam buka-tutup
- [ ] Fitur export data absensi ke `.xlsx` (satu klik dari dashboard admin)
- [ ] Notifikasi/pesan error yang jelas untuk mahasiswa (contoh: "Absensi ditutup, submit hanya diperbolehkan 06:00–08:00" atau "Lokasi Anda di luar radius posko KKN")

---

## 7. Pertimbangan Teknis Tambahan

- **Waktu server jadi acuan utama**, bukan waktu di HP mahasiswa (mencegah manipulasi jam device).
- **Geolocation browser** butuh HTTPS dan izin user — pastikan Next.js di-deploy dengan HTTPS (default di Vercel).
- **Koneksi internet di desa** kadang lemah — pertimbangkan menampilkan pesan retry yang jelas jika submit gagal, agar mahasiswa tahu harus mencoba ulang, bukan silent fail.
- **Fake GPS / mock location** adalah risiko nyata; untuk versi awal cukup dicatat jarak & status di database supaya DPL bisa meninjau manual jika ada kejanggalan (misalnya jarak yang selalu pas di 0 meter tiap hari).
- QR code statis tidak perlu disimpan di database sebagai "token unik" — cukup berupa URL rute halaman absensi aplikasi, karena keamanan sesungguhnya ada di lapisan login + waktu + lokasi.

---

## 8. Struktur Folder (Next.js App Router — usulan)

```
/app
  /absen/page.tsx          -> halaman absensi mahasiswa
  /login/page.tsx          -> login mahasiswa
  /admin/page.tsx          -> dashboard rekap DPL
  /admin/settings/page.tsx -> atur lokasi posko & jadwal
  /admin/qr/page.tsx       -> tampilkan QR statis
  /api/absen/route.ts      -> API submit absensi (validasi waktu+lokasi)
  /api/export/route.ts     -> API generate & download .xlsx
/lib
  /supabase.ts             -> supabase client
  /haversine.ts             -> fungsi hitung jarak
/types
  /index.ts                -> tipe data (Mahasiswa, Absensi, dsb)
```

---

## 9. Out of Scope (untuk versi awal)

- Multi-kelompok / multi-lokasi KKN
- Multi-admin/DPL
- Rotasi QR code otomatis
- Deteksi mock-location otomatis (bisa jadi improvement fase berikutnya)