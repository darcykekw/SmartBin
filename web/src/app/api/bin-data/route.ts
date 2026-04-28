import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function POST(req: Request) {
  try {
    const { bin_id, distance_cm } = await req.json();

    if (!bin_id || distance_cm === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [bins] = await pool.query<RowDataPacket[]>("SELECT capacity_cm FROM bins WHERE id = ?", [bin_id]);
    if (bins.length === 0) {
      return NextResponse.json({ error: "Bin not found" }, { status: 404 });
    }

    const capacity = bins[0].capacity_cm;
    
    let fill_level_percent = ((capacity - distance_cm) / capacity) * 100;
    fill_level_percent = Math.max(0, Math.min(100, Math.round(fill_level_percent)));

    let status = "Empty";
    if (fill_level_percent > 85) status = "Full";
    else if (fill_level_percent > 20) status = "Half-Full";

    await pool.query(
      "INSERT INTO bin_logs (bin_id, fill_level_percent, status, distance_cm) VALUES (?, ?, ?, ?)",
      [bin_id, fill_level_percent, status, distance_cm]
    );

    return NextResponse.json({ message: "Data logged successfully", status, fill_level_percent }, { status: 201 });
  } catch (error) {
    console.error("Arduino log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
