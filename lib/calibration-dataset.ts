import { supabase } from "./supabase";

export interface CalibrationTranscript {
  id: string;
  question_title: string;
  question_type: string;
  question_id: string | null;
  transcript: Array<{ role: string; text: string }>;
  assessment: Record<string, unknown>;
  assessment_schema: string;
  track: string;
  overall_score: number;
  created_at: string;
}

interface CalibrationEntry {
  questionTitle: string;
  questionType: string;
  questionId?: string;
  transcript: Array<{ role: string; text: string }>;
  assessment: Record<string, unknown>;
  timestamp: string;
}

export async function saveCalibrationTranscript(
  entry: CalibrationEntry
): Promise<CalibrationTranscript | null> {
  if (!supabase) {
    console.log("Supabase not configured, skipping calibration save");
    return null;
  }

  const assessmentSchema =
    (entry.assessment.assessmentSchema as string) || "pm-generic";
  const track = (entry.assessment.track as string) || "product-management";
  const overallScore = (entry.assessment.overallScore as number) || 0;

  try {
    const { data, error } = await supabase
      .from("calibration_transcripts")
      .insert({
        question_title: entry.questionTitle,
        question_type: entry.questionType,
        question_id: entry.questionId || null,
        transcript: entry.transcript,
        assessment: entry.assessment,
        assessment_schema: assessmentSchema,
        track: track,
        overall_score: overallScore,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving calibration transcript:", error);
      return null;
    }

    return data as CalibrationTranscript;
  } catch (err) {
    console.error("Error saving calibration transcript:", err);
    return null;
  }
}

export async function getCalibrationTranscripts(
  questionType?: string,
  limit = 100
): Promise<CalibrationTranscript[]> {
  if (!supabase) {
    console.log("Supabase not configured, returning empty calibration data");
    return [];
  }

  try {
    let query = supabase
      .from("calibration_transcripts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (questionType) {
      query = query.eq("question_type", questionType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching calibration transcripts:", error);
      return [];
    }

    return (data as CalibrationTranscript[]) || [];
  } catch (err) {
    console.error("Error fetching calibration transcripts:", err);
    return [];
  }
}

export async function getCalibrationStats(questionType?: string): Promise<{
  count: number;
  averageScore: number;
  scoreDistribution: Record<string, number>;
}> {
  if (!supabase) {
    return { count: 0, averageScore: 0, scoreDistribution: {} };
  }

  try {
    let query = supabase.from("calibration_transcripts").select("overall_score");

    if (questionType) {
      query = query.eq("question_type", questionType);
    }

    const { data, error } = await query;

    if (error || !data) {
      return { count: 0, averageScore: 0, scoreDistribution: {} };
    }

    const scores = data.map((d) => d.overall_score as number);
    const count = scores.length;
    const averageScore =
      count > 0 ? scores.reduce((a, b) => a + b, 0) / count : 0;

    // Calculate score distribution (1-5 ranges)
    const scoreDistribution: Record<string, number> = {
      "1-2": 0,
      "2-3": 0,
      "3-4": 0,
      "4-5": 0,
    };

    for (const score of scores) {
      if (score < 2) scoreDistribution["1-2"]++;
      else if (score < 3) scoreDistribution["2-3"]++;
      else if (score < 4) scoreDistribution["3-4"]++;
      else scoreDistribution["4-5"]++;
    }

    return { count, averageScore, scoreDistribution };
  } catch (err) {
    console.error("Error fetching calibration stats:", err);
    return { count: 0, averageScore: 0, scoreDistribution: {} };
  }
}
