import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// SHA-256 hashing (server-side using Web Crypto API)
function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashWithSalt(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  // Verify admin auth via header
  const authHeader = request.headers.get("x-admin-key");
  if (authHeader !== "adminsungaienam") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all mahasiswa records
  const { data: students, error } = await supabase
    .from("mahasiswa")
    .select("nim, password");

  if (error || !students) {
    return NextResponse.json({ error: "Failed to fetch students", details: error }, { status: 500 });
  }

  let migrated = 0;
  let skipped = 0;

  for (const student of students) {
    // Skip if already encrypted (contains "$" separator)
    if (!student.password || student.password.includes("$")) {
      skipped++;
      continue;
    }

    // Encrypt plain text password with salt
    const salt = generateSalt(16);
    const hash = await hashWithSalt(student.password, salt);
    const encrypted = `${salt}$${hash}`;

    const { error: updateError } = await supabase
      .from("mahasiswa")
      .update({ password: encrypted })
      .eq("nim", student.nim);

    if (!updateError) {
      migrated++;
    }
  }

  return NextResponse.json({
    success: true,
    message: `Migrasi selesai! ${migrated} password berhasil dienkripsi, ${skipped} sudah terenkripsi/dilewati.`,
    migrated,
    skipped,
    total: students.length,
  });
}
