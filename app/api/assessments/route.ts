import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If Supabase is not configured, return success (data only in sessionStorage)
    if (!supabase) {
      return NextResponse.json({
        id: `local-${Date.now()}`,
        message: "Supabase not configured - assessment stored locally only",
      });
    }

    const body = await request.json();
    const {
      sessionId,
      overallScore,
      scores,
      feedback,
      strengths,
      improvements,
      assessmentSchema,
      dimensionFeedback,
    } = body;

    // Build insert object with new JSONB columns
    const insertData: Record<string, unknown> = {
      session_id: sessionId,
      overall_score: overallScore,
      // Store full scores object in JSONB column
      scores: scores,
      assessment_schema: assessmentSchema,
      dimension_feedback: dimensionFeedback,
      feedback,
      strengths,
      improvements,
      // Legacy consulting columns (for backward compatibility)
      structure_score: scores?.structure ?? 0,
      problem_solving_score: scores?.problemSolving ?? 0,
      business_judgment_score: scores?.businessJudgment ?? 0,
      communication_score: scores?.communication ?? 0,
      quantitative_score: scores?.quantitative ?? 0,
      creativity_score: scores?.creativity ?? 0,
    };

    const { data, error } = await supabase
      .from("assessments")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Assessment save error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
