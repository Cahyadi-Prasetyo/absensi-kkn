import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nim, latitude, longitude, jarak_meter, status } = body;

    if (!nim || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: nim, latitude, longitude" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase.from("absensi").insert({
      nim,
      tanggal: today,
      waktu_submit: new Date().toISOString(),
      latitude,
      longitude,
      jarak_meter: jarak_meter || 0,
      status: status || "valid",
    }).select().single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Mahasiswa sudah absen hari ini" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
