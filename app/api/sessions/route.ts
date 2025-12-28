import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      companySlug,
      questionId,
      questionTitle,
      questionType,
      transcript,
      durationSeconds,
    } = body;

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: session.user.id || session.user.email,
        user_email: session.user.email,
        company_slug: companySlug,
        question_id: questionId,
        question_title: questionTitle,
        question_type: questionType,
        transcript: JSON.stringify(transcript),
        duration_seconds: durationSeconds,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      // If Supabase is not configured, return a mock session ID
      if (error.message?.includes("Invalid API key") || error.code === "PGRST301") {
        return NextResponse.json({
          id: `local-${Date.now()}`,
          message: "Supabase not configured - using local storage",
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Session save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        assessments (*)
      `)
      .eq("user_email", session.user.email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      // Return empty array if Supabase not configured
      if (error.message?.includes("Invalid API key")) {
        return NextResponse.json([]);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
