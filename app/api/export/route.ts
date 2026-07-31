import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start") || "2026-01-01";
  const endDate = searchParams.get("end") || "2026-12-31";
  const search = searchParams.get("search") || "";

  // Fetch all students (excluding admin)
  let studentQuery = supabase.from("mahasiswa").select("nim, nama").neq("nim", "adminsungaienam").order("nim");
  if (search) {
    studentQuery = studentQuery.or(`nama.ilike.%${search}%,nim.ilike.%${search}%`);
  }
  const { data: students } = await studentQuery;

  // Fetch attendance in date range (excluding admin)
  const { data: attendance } = await supabase
    .from("absensi")
    .select("nim, tanggal, waktu_submit, status")
    .neq("nim", "adminsungaienam")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal");

  if (!students || !attendance) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  // Build date range
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  let safety = 0;
  while (current <= end && safety < 366) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
    safety++;
  }

  // Format date headers
  const monthsId = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  const dateHeaders = dates.map(d => {
    const dt = new Date(d);
    return `${dt.getDate()} ${monthsId[dt.getMonth()]}`;
  });

  // Build Excel HTML
  const headerRow = ["NIM", "Nama", ...dateHeaders, "Total Hadir", "% Kehadiran"]
    .map(h => `<th style="background-color: #EEF2FF; color: #312E81; font-weight: bold; border: 1px solid #E2E8F0; padding: 8px; text-align: center;">${h}</th>`)
    .join("");

  const bodyRows = students.map(student => {
    let count = 0;
    const cells = dates.map(targetDate => {
      const entry = attendance.find(a => a.nim === student.nim && a.tanggal === targetDate);
      if (entry) {
        count++;
        const t = new Date(entry.waktu_submit);
        let h = t.getHours();
        const m = t.getMinutes().toString().padStart(2, "0");
        const ap = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;
        return `<td style="color: #10B981; font-weight: bold; text-align: center;">✓ ${h}:${m} ${ap}</td>`;
      }
      return `<td style="color: #EF4444; text-align: center;">✗</td>`;
    }).join("");

    const total = dates.length || 1;
    const pct = Math.round((count / total) * 100);
    return `<tr><td style="mso-number-format:'@';">${student.nim}</td><td style="font-weight: bold;">${student.nama}</td>${cells}<td style="mso-number-format:'@'; text-align: center; font-weight: bold;">${count} / ${total}</td><td style="text-align: center; font-weight: bold; color: #312E81;">${pct}%</td></tr>`;
  }).join("");

  const excelHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Rekap Absensi KKN</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
      <style>th { background-color: #EEF2FF; color: #312E81; font-weight: bold; border: 1px solid #E2E8F0; padding: 8px; } td { border: 1px solid #E2E8F0; padding: 8px; }</style>
    </head>
    <body><table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>
  `;

  return new NextResponse(excelHtml, {
    headers: {
      "Content-Type": "application/vnd.ms-excel; charset=UTF-8",
      "Content-Disposition": `attachment; filename="Rekap_Absensi_KKN_${startDate}_${endDate}.xls"`,
    },
  });
}
