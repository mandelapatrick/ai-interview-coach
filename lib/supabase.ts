import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Admin client with service role key — bypasses RLS, use only in server-side code
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

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
  video_recording_url: string | null;
  created_at: string;
}

export interface DbAssessment {
  id: string;
  session_id: string;
  overall_score: number;
  // Legacy consulting-specific columns (kept for backward compatibility)
  structure_score: number;
  problem_solving_score: number;
  business_judgment_score: number;
  communication_score: number;
  quantitative_score: number;
  creativity_score: number;
  // New flexible columns for all assessment types
  assessment_schema?: string; // "product-sense" | "analytical-thinking" | "pm-generic" | "consulting"
  scores?: Record<string, number>; // JSONB - dimension scores vary by schema
  dimension_feedback?: Record<string, string>; // JSONB - per-dimension feedback
  feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
}

export interface DbUserSubscription {
  id: string;
  user_id: string;
  user_email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_type: "free" | "pro";
  billing_interval: "monthly" | "yearly" | null;
  status: "active" | "canceled" | "past_due";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbUsageTracking {
  id: string;
  user_email: string;
  session_type: "practice" | "learn";
  question_id: string | null;
  period_start: string;
  created_at: string;
}

// Helper functions
export async function saveSession(session: Omit<DbSession, "id" | "created_at">) {
  if (!supabase) {
    console.log("Supabase not configured, skipping session save");
    return null;
  }
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
  if (!supabase) {
    console.log("Supabase not configured, skipping assessment save");
    return null;
  }
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
  if (!supabase) {
    console.log("Supabase not configured, returning empty sessions");
    return [];
  }
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
  if (!supabase) {
    console.log("Supabase not configured");
    return null;
  }
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
