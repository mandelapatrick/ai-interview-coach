import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface DbSession {
  id: string;
  user_id: string;
  user_email: string;
  company_slug: string;
  question_id: string;
  question_title: string;
  question_type: string;
  transcript: string;
  duration_seconds: number;
  created_at: string;
}

export interface DbAssessment {
  id: string;
  session_id: string;
  overall_score: number;
  structure_score: number;
  problem_solving_score: number;
  business_judgment_score: number;
  communication_score: number;
  quantitative_score: number;
  creativity_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
}

// Helper functions
export async function saveSession(session: Omit<DbSession, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("sessions")
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error("Error saving session:", error);
    throw error;
  }
  return data;
}

export async function saveAssessment(assessment: Omit<DbAssessment, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("assessments")
    .insert(assessment)
    .select()
    .single();

  if (error) {
    console.error("Error saving assessment:", error);
    throw error;
  }
  return data;
}

export async function getUserSessions(userEmail: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      assessments (*)
    `)
    .eq("user_email", userEmail)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
  return data;
}

export async function getSessionWithAssessment(sessionId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      *,
      assessments (*)
    `)
    .eq("id", sessionId)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    throw error;
  }
  return data;
}
