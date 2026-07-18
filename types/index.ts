/**
 * Tipe data untuk Sistem Absensi KKN
 */

export type StatusAbsensi = "valid" | "luar_radius" | "telat" | "ditolak";

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  created_at: string;
}

export interface LokasiPosko {
  id: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
  updated_at: string;
}

export interface JadwalAbsensi {
  id: string;
  jam_buka: string; // format: "HH:mm"
  jam_tutup: string; // format: "HH:mm"
}

export interface Absensi {
  id: string;
  nim: string;
  tanggal: string; // format: "YYYY-MM-DD"
  waktu_submit: string; // ISO 8601 timestamptz
  latitude: number;
  longitude: number;
  jarak_meter: number;
  status: StatusAbsensi;
}
