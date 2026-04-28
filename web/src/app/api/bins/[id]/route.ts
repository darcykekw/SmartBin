import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as any).id;
    const binId = params.id;

    const [bins] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM bins WHERE id = ? AND user_id = ?",
      [binId, userId]
    );

    if (bins.length === 0) {
      return NextResponse.json({ error: "Bin not found" }, { status: 404 });
    }

    const [logs] = await pool.query(
      "SELECT * FROM bin_logs WHERE bin_id = ? ORDER BY recorded_at DESC LIMIT 50",
      [binId]
    );

    return NextResponse.json({ bin: bins[0], logs });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as any).id;
    const binId = params.id;

    await pool.query(
      "DELETE FROM bins WHERE id = ? AND user_id = ?",
      [binId, userId]
    );

    return NextResponse.json({ message: "Bin deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
