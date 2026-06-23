// src/app/api/submissions/route.ts
import { NextResponse } from "next/server";
import { getSubmissions } from "../../../lib/db";

export async function GET() {
  try {
    const data = getSubmissions();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
