import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import pool from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = (session.user as any).id;
    const [bins] = await pool.query(
      "SELECT * FROM bins WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return NextResponse.json(bins);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, location, capacity_cm } = await req.json();
    if (!name || !capacity_cm) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const userId = (session.user as any).id;
    const binId = uuidv4();

    await pool.query(
      "INSERT INTO bins (id, user_id, name, location, capacity_cm) VALUES (?, ?, ?, ?, ?)",
      [binId, userId, name, location, capacity_cm]
    );

    return NextResponse.json({ message: "Bin created", id: binId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
