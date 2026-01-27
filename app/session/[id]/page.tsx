"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, QuestionType } from "@/types";

interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
}

// Score type interfaces for different assessment schemas
interface ConsultingScores {
  structure: number;
  problemSolving: number;
  businessJudgment: number;
  communication: number;
  quantitative: number;
  creativity: number;
}

interface PMScores {
  productThinking: number;
  communication: number;
  userEmpathy: number;
  technicalDepth: number;
  analyticalSkills: number;
  creativity: number;
}

interface ProductSenseScores {
  productMotivation: number;
  targetAudience: number;
  problemIdentification: number;
  solutionDevelopment: number;
  communicationStructure: number;
}

interface AnalyticalThinkingScores {
  productRationale: number;
  measuringImpact: number;
  settingGoals: number;
  evaluatingTradeoffs: number;
}

type AssessmentSchema = "product-sense" | "analytical-thinking" | "pm-generic" | "consulting";

interface SessionWithAssessment {
  id: string;
  question_id: string;
  question_title: string;
  question_type: string;
  company_slug: string;
  duration_seconds: number;
  transcript: string;
  video_recording_url: string | null;
  created_at: string;
  assessments: Array<{
    overall_score: number;
    // Legacy consulting-specific columns
    structure_score: number;
    problem_solving_score: number;
    business_judgment_score: number;
    communication_score: number;
    quantitative_score: number;
    creativity_score: number;
    // New flexible columns
    assessment_schema?: AssessmentSchema;
    scores?: ConsultingScores | PMScores | ProductSenseScores | AnalyticalThinkingScores;
    dimension_feedback?: Record<string, string>;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }>;
}

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionWithAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Session not found");
          } else {
            throw new Error("Failed to fetch session");
          }
          return;
        }
        const data = await response.json();
        setSession(data);
      } catch (err) {
        console.error("Session fetch error:", err);
        setError("Failed to load session details");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-white/70">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Session not found"}</p>
          <Link
            href="/history"
            className="text-[#d4af37] hover:text-[#f4d03f] transition-colors"
          >
            ← Back to History
          </Link>
        </div>
      </div>
    );
  }

  const company = getCompanyBySlug(session.company_slug);
  const assessment = session.assessments?.[0];
  const transcript: TranscriptEntry[] = session.transcript
    ? JSON.parse(session.transcript)
    : [];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="bg-[#0f172a] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href="/history"
            className="text-sm text-[#d4af37] hover:text-[#f4d03f] transition-colors"
          >
            ← Back to History
          </Link>
          <span className="text-sm text-white/40">
            {formatDate(session.created_at)}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-display">
            Interview Assessment
          </h1>
          <p className="text-white/60">
            {session.question_title} • {formatDuration(session.duration_seconds)} session
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                session.question_type as QuestionType
              )}`}
            >
              {QUESTION_TYPE_LABELS[session.question_type as QuestionType] || session.question_type}
            </span>
            {company && (
              <span className="text-white/40 text-sm">{company.name}</span>
            )}
          </div>
        </div>

        {assessment ? (
          <div className="space-y-6">
            {/* Session Recording */}
            {session.video_recording_url && (
              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Session Recording
                </h2>
                <div className="rounded-lg overflow-hidden bg-black">
                  <video
                    src={session.video_recording_url}
                    controls
                    className="w-full max-h-[400px]"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-white/40 text-sm">
                    Watch your interview recording to review your performance.
                  </p>
                  <a
                    href={session.video_recording_url}
                    download
                    className="text-[#d4af37] hover:text-[#f4d03f] text-sm flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* Overall Score */}
            <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Overall Score
                </h2>
                <div className="flex items-center gap-2">
                  <ScoreRing score={assessment.overall_score} />
                  <div className="text-4xl font-bold text-[#d4af37]">
                    {assessment.overall_score.toFixed(1)}
                    <span className="text-lg text-white/40">/5</span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown - Dynamic based on assessment schema */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assessment.assessment_schema === "product-sense" && assessment.scores ? (
                  <>
                    <ScoreItem label="Product Motivation" score={(assessment.scores as ProductSenseScores).productMotivation} weight="20%" />
                    <ScoreItem label="Target Audience" score={(assessment.scores as ProductSenseScores).targetAudience} weight="25%" />
                    <ScoreItem label="Problem Identification" score={(assessment.scores as ProductSenseScores).problemIdentification} weight="25%" />
                    <ScoreItem label="Solution Development" score={(assessment.scores as ProductSenseScores).solutionDevelopment} weight="20%" />
                    <ScoreItem label="Communication" score={(assessment.scores as ProductSenseScores).communicationStructure} weight="10%" />
                  </>
                ) : assessment.assessment_schema === "analytical-thinking" && assessment.scores ? (
                  <>
                    <ScoreItem label="Product Rationale" score={(assessment.scores as AnalyticalThinkingScores).productRationale} weight="15%" />
                    <ScoreItem label="Measuring Impact" score={(assessment.scores as AnalyticalThinkingScores).measuringImpact} weight="35%" />
                    <ScoreItem label="Setting Goals" score={(assessment.scores as AnalyticalThinkingScores).settingGoals} weight="25%" />
                    <ScoreItem label="Evaluating Tradeoffs" score={(assessment.scores as AnalyticalThinkingScores).evaluatingTradeoffs} weight="25%" />
                  </>
                ) : assessment.assessment_schema === "pm-generic" && assessment.scores ? (
                  <>
                    <ScoreItem label="Product Thinking" score={(assessment.scores as PMScores).productThinking} weight="25%" />
                    <ScoreItem label="Communication" score={(assessment.scores as PMScores).communication} weight="20%" />
                    <ScoreItem label="User Empathy" score={(assessment.scores as PMScores).userEmpathy} weight="15%" />
                    <ScoreItem label="Technical Depth" score={(assessment.scores as PMScores).technicalDepth} weight="15%" />
                    <ScoreItem label="Analytical Skills" score={(assessment.scores as PMScores).analyticalSkills} weight="15%" />
                    <ScoreItem label="Creativity" score={(assessment.scores as PMScores).creativity} weight="10%" />
                  </>
                ) : (
                  // Default: consulting or legacy assessments without assessment_schema
                  <>
                    <ScoreItem label="Structure" score={assessment.scores ? (assessment.scores as ConsultingScores).structure : assessment.structure_score} weight="25%" />
                    <ScoreItem label="Problem Solving" score={assessment.scores ? (assessment.scores as ConsultingScores).problemSolving : assessment.problem_solving_score} weight="20%" />
                    <ScoreItem label="Business Judgment" score={assessment.scores ? (assessment.scores as ConsultingScores).businessJudgment : assessment.business_judgment_score} weight="20%" />
                    <ScoreItem label="Communication" score={assessment.scores ? (assessment.scores as ConsultingScores).communication : assessment.communication_score} weight="15%" />
                    <ScoreItem label="Quantitative" score={assessment.scores ? (assessment.scores as ConsultingScores).quantitative : assessment.quantitative_score} weight="10%" />
                    <ScoreItem label="Creativity" score={assessment.scores ? (assessment.scores as ConsultingScores).creativity : assessment.creativity_score} weight="10%" />
                  </>
                )}
              </div>
            </div>

            {/* Dimension-Specific Feedback (Product Sense and Analytical Thinking) */}
            {(assessment.assessment_schema === "product-sense" || assessment.assessment_schema === "analytical-thinking") && assessment.dimension_feedback && (
              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Detailed Dimension Feedback
                </h2>
                <div className="space-y-4">
                  {Object.entries(assessment.dimension_feedback).map(([dimension, feedback]) => (
                    <div key={dimension} className="border-l-2 border-[#d4af37]/50 pl-4">
                      <h3 className="text-sm font-medium text-[#d4af37] mb-1">
                        {formatDimensionName(dimension)}
                      </h3>
                      <p className="text-white/70 text-sm">{feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                AI Feedback
              </h2>
              <p className="text-white/70 leading-relaxed">{assessment.feedback}</p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <span className="text-xl">✓</span> Strengths
                </h2>
                <ul className="space-y-3">
                  {assessment.strengths?.map((item, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-2">
                      <span className="text-green-400 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-[#d4af37] mb-4 flex items-center gap-2">
                  <span className="text-xl">↑</span> Areas to Improve
                </h2>
                <ul className="space-y-3">
                  {assessment.improvements?.map((item, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-2">
                      <span className="text-[#d4af37] mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Session Transcript
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transcript.map((entry, i) => (
                    <div key={i}>
                      <div className="text-xs font-medium text-white/50 mb-1">
                        {entry.role === "user" ? "You" : "AI Interviewer"}
                      </div>
                      <p
                        className={`text-white/80 p-3 rounded-lg ${
                          entry.role === "user"
                            ? "bg-[#d4af37]/10 border-l-4 border-[#d4af37]"
                            : "bg-[#0f172a] border-l-4 border-white/20"
                        }`}
                      >
                        {entry.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-center pt-4">
              <Link
                href={`/practice/${session.question_id}`}
                className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-lg font-medium hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
              >
                Practice Again
              </Link>
              <Link
                href="/history"
                className="px-6 py-3 bg-[#0f172a] text-white rounded-lg font-medium hover:bg-[#152238] transition-colors border border-white/10"
              >
                View All Sessions
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-[#1a2d47] rounded-xl border border-white/10">
            <p className="text-white/60 mb-4">No assessment available for this session.</p>
            <p className="text-white/40 text-sm">
              Assessments are generated when you complete an interview practice session.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function getTypeColor(type: QuestionType): string {
  const colors: Record<QuestionType, string> = {
    profitability: "text-blue-400 bg-blue-400/10",
    "market-entry": "text-purple-400 bg-purple-400/10",
    "market-sizing": "text-cyan-400 bg-cyan-400/10",
    "m&a": "text-orange-400 bg-orange-400/10",
    operations: "text-gray-400 bg-gray-400/10",
    "growth-strategy": "text-emerald-400 bg-emerald-400/10",
    pricing: "text-pink-400 bg-pink-400/10",
    "competitive-response": "text-indigo-400 bg-indigo-400/10",
    brainteasers: "text-yellow-400 bg-yellow-400/10",
    turnarounds: "text-red-400 bg-red-400/10",
    "strategic-decision": "text-teal-400 bg-teal-400/10",
    "industry-analysis": "text-slate-400 bg-slate-400/10",
  };
  return colors[type] || "text-gray-400 bg-gray-400/10";
}

function ScoreRing({ score }: { score: number }) {
  const percentage = (score / 5) * 100;
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 4) return "#22c55e";
    if (s >= 3) return "#d4af37";
    return "#ef4444";
  };

  return (
    <svg width="50" height="50" className="-rotate-90">
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="#1a2d47"
        strokeWidth="4"
      />
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={getColor(score)}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ScoreItem({ label, score, weight }: { label: string; score: number; weight: string }) {
  const getColor = (s: number) => {
    if (s >= 4) return "text-green-400 bg-green-400/10 border-green-400/20";
    if (s >= 3) return "text-[#d4af37] bg-[#d4af37]/10 border-[#d4af37]/20";
    return "text-red-400 bg-red-400/10 border-red-400/20";
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${getColor(score)}`}>
      <div>
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-white/40 ml-1">({weight})</span>
      </div>
      <span className="font-bold">{score}/5</span>
    </div>
  );
}

function formatDimensionName(dimension: string): string {
  const names: Record<string, string> = {
    // Product Sense dimensions
    productMotivation: "Product Motivation & Mission",
    targetAudience: "Target Audience",
    problemIdentification: "Problem Identification",
    solutionDevelopment: "Solution Development",
    communicationStructure: "Communication Structure",
    // Analytical Thinking dimensions
    productRationale: "Product Rationale",
    measuringImpact: "Measuring Impact",
    settingGoals: "Setting Goals",
    evaluatingTradeoffs: "Evaluating Tradeoffs",
  };
  return names[dimension] || dimension;
}
