import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: true }); // graceful no-op
    }

    const { event_name, properties, anonymous_id } = await request.json();

    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json({ error: "event_name required" }, { status: 400 });
    }

    // Get user email from session if authenticated
    let userEmail: string | null = null;
    try {
      const session = await auth();
      userEmail = session?.user?.email || null;
    } catch {
      // Not authenticated — that's fine
    }

    const country = request.headers.get("x-vercel-ip-country") || null;

    await supabaseAdmin.from("analytics_events").insert({
      user_email: userEmail,
      anonymous_id: anonymous_id || null,
      event_name,
      properties: properties || {},
      country,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ ok: true }); // Never fail the client
  }
}
