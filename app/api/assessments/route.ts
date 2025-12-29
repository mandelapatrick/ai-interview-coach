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
    } = body;

    const { data, error } = await supabase
      .from("assessments")
      .insert({
        session_id: sessionId,
        overall_score: overallScore,
        structure_score: scores.structure,
        problem_solving_score: scores.problemSolving,
        business_judgment_score: scores.businessJudgment,
        communication_score: scores.communication,
        quantitative_score: scores.quantitative,
        creativity_score: scores.creativity,
        feedback,
        strengths,
        improvements,
      })
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
