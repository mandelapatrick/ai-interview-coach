import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recordUsage } from "@/lib/subscription";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionType, questionId } = await request.json();

    if (sessionType !== "practice" && sessionType !== "learn") {
      return NextResponse.json({ error: "Invalid session type" }, { status: 400 });
    }

    await recordUsage(session.user.email, sessionType, questionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Usage record error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
