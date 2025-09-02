import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Consume body to avoid warnings; ignore content for now
    const _ = await req.json().catch(() => ({}));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "log endpoint error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, message: "log endpoint alive" }, { status: 200 });
}
