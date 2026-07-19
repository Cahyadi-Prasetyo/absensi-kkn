import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
const envConfig = fs.readFileSync(envPath, "utf-8");
const env = {};

envConfig.split("\n").forEach(line => {
  const parts = line.split("=");
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const mahasiswaList = [
  { nim: "adminsungaienam", nama: "Dian Kharisma Dewi, S.T.,M.T." },
  { nim: "2304010134", nama: "Anisa Oktafiani" },
  { nim: "2303040016", nama: "Fathiya Rohadatul Aisy" },
  { nim: "2305040014", nama: "Ayu Nazira" },
  { nim: "2303050022", nama: "Irwin Harja Pratama" },
  { nim: "2301020005", nama: "Cahyadi Prasetyo" },
  { nim: "2306010027", nama: "Dang Salsabila Alya Husdi" },
  { nim: "2305020014", nama: "Fadiyah Haya" },
  { nim: "2304010188", nama: "Surya Pratama Catri" },
  { nim: "2303050003", nama: "Siti Fatimah" },
  { nim: "2305050047", nama: "Amelia Putri" },
  { nim: "2301020119", nama: "Nanda Apriyani" },
  { nim: "2306010031", nama: "Nurtadiatul Khairoh" },
  { nim: "2301020086", nama: "Fadli Aidin" },
  { nim: "2303020060", nama: "Eka Widia Astuti" },
  { nim: "2305020076", nama: "Reski Apriyani" },
  { nim: "2305040142", nama: "R.Najrita Jaswi" },
  { nim: "2305040092", nama: "Dina Purnama Sari" },
  { nim: "2305010110", nama: "Muhammad Razaq" },
  { nim: "2301010076", nama: "Audra Fatih Siahaan" },
  { nim: "2301010038", nama: "Henry Davidson Silalahi" }
];

async function seed() {
  console.log("Seeding mahasiswa data...");
  
  // Clear existing
  const { error: deleteError } = await supabase
    .from("mahasiswa")
    .delete()
    .neq("nim", "");

  if (deleteError) {
    console.error("Error clearing old data:", deleteError);
  }

  // Insert new
  const { data, error } = await supabase
    .from("mahasiswa")
    .insert(mahasiswaList.map(item => ({
      nim: item.nim,
      nama: item.nama,
      password: item.nim // Set default password to NIM
    })));

  if (error) {
    console.error("Error seeding data:", error);
  } else {
    console.log("Success! Seeded 20 mahasiswa.");
  }

  // Update default settings row to Sungai Enam
  console.log("Updating default settings to Sungai Enam...");
  const { error: settingsError } = await supabase
    .from("settings")
    .upsert({
      id: "00000000-0000-0000-0000-000000000001", // Static ID for upsert
      latitude: 0.832000,
      longitude: 104.572400,
      radius: 300,
      jam_buka: "06:00",
      jam_tutup: "08:00"
    });

  if (settingsError) {
    console.error("Error updating settings:", settingsError);
  } else {
    console.log("Success! Updated default settings to Sungai Enam.");
  }
}

seed();
