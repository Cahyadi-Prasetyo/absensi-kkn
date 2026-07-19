/**
 * Tipe data untuk Sistem Absensi KKN (synced with Supabase schema)
 */

export type StatusAbsensi = "valid" | "telat";

export interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  password: string;
  foto_url: string | null;
  created_at: string;
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
  created_at: string;
}

// Joined type for admin dashboard queries
export interface AbsensiWithMahasiswa extends Absensi {
  mahasiswa?: {
    nama: string;
  };
}

export interface Settings {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  jam_buka: string; // format: "HH:mm"
  jam_tutup: string; // format: "HH:mm"
  updated_at: string;
}
