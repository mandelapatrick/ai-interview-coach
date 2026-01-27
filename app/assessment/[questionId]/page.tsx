"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, PM_QUESTION_TYPE_LABELS, PMQuestionType, InterviewTrack } from "@/types";
import { TranscriptEntry } from "@/hooks/useVoiceSession";

interface SessionData {
  questionId: string;
  transcript: TranscriptEntry[];
  duration: number;
  videoRecordingUrl?: string | null;
}

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

interface Assessment {
  overallScore: number;
  scores: ConsultingScores | PMScores | ProductSenseScores | AnalyticalThinkingScores;
  feedback: string;
  strengths: string[];
  improvements: string[];
  track?: InterviewTrack;
  assessmentSchema?: AssessmentSchema;
  dimensionFeedback?: Record<string, string>;
}

export default function AssessmentPage() {
  const params = useParams();
  const questionId = params.questionId as string;
  const question = getQuestionById(questionId);
  const company = question ? getCompanyBySlug(question.companySlug) : null;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      // Get session data from sessionStorage (check both audio and video storage keys)
      let stored = sessionStorage.getItem("lastSession");
      if (!stored) {
        // Try video interview storage key
        stored = sessionStorage.getItem("interviewTranscript");
      }
      if (!stored) {
        setLoading(false);
        return;
      }

      const data = JSON.parse(stored) as SessionData;
      setSessionData(data);

      // Check if we have a valid transcript
      if (!data.transcript || data.transcript.length === 0) {
        setError("No transcript available for assessment");
        setLoading(false);
        return;
      }

      try {
        // Get the appropriate type label based on track
        const isPM = question?.track === "product-management";
        const typeLabel = isPM && question
          ? PM_QUESTION_TYPE_LABELS[question.type as PMQuestionType]
          : question ? QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS] : "Unknown";

        // Call the AI assessment API
        const response = await fetch("/api/assessment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: data.transcript,
            questionTitle: question?.title || "Unknown",
            questionType: typeLabel,
            track: question?.track || "consulting",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate assessment");
        }

        const assessmentData = await response.json();
        setAssessment(assessmentData);

        // Try to save session and assessment to database (optional - won't fail if Supabase not configured)
        try {
          const sessionResponse = await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companySlug: question?.companySlug,
              questionId: question?.id,
              questionTitle: question?.title,
              questionType: question?.type,
              transcript: data.transcript,
              durationSeconds: data.duration,
              videoRecordingUrl: data.videoRecordingUrl,
            }),
          });

          if (sessionResponse.ok) {
            const sessionResult = await sessionResponse.json();
            // Save assessment linked to the session
            if (sessionResult.id && !sessionResult.id.startsWith("local-")) {
              await fetch("/api/assessments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: sessionResult.id,
                  overallScore: assessmentData.overallScore,
                  scores: assessmentData.scores,
                  feedback: assessmentData.feedback,
                  strengths: assessmentData.strengths,
                  improvements: assessmentData.improvements,
                  assessmentSchema: assessmentData.assessmentSchema,
                  dimensionFeedback: assessmentData.dimensionFeedback,
                }),
              });
            }
          }
        } catch (saveError) {
          console.log("Could not save to database:", saveError);
        }
      } catch (err) {
        console.error("Assessment error:", err);
        setError("Failed to generate assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [question]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-white/60">Question not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="bg-[#0f172a] border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            href={`/company/${question.companySlug}`}
            className="text-sm text-[#d4af37] hover:text-[#f4d03f] transition-colors"
          >
            ← Back to {company?.name}
          </Link>
          <Link
            href="/history"
            className="text-sm text-white/60 hover:text-[#d4af37] transition-colors"
          >
            View History
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-display">
            Interview Assessment
          </h1>
          <p className="text-white/60">
            {question.title} • {sessionData ? formatDuration(sessionData.duration) : "--:--"} session
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
            <p className="text-white/70">Analyzing your performance with AI...</p>
            <p className="text-sm text-white/50 mt-2">This may take a few seconds</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-[#1a2d47] rounded-xl border border-white/10">
            <p className="text-red-400 mb-4">{error}</p>
            <Link
              href={`/practice/${questionId}`}
              className="text-[#d4af37] hover:text-[#f4d03f] transition-colors"
            >
              Start a new practice session
            </Link>
          </div>
        ) : !sessionData ? (
          <div className="text-center py-12 bg-[#1a2d47] rounded-xl border border-white/10">
            <p className="text-white/60 mb-4">No session data found.</p>
            <Link
              href={`/practice/${questionId}`}
              className="text-[#d4af37] hover:text-[#f4d03f] transition-colors"
            >
              Start a new practice session
            </Link>
          </div>
        ) : assessment ? (
          <div className="space-y-6">
            {/* Session Recording */}
            {sessionData?.videoRecordingUrl && (
              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Session Recording
                </h2>
                <div className="rounded-lg overflow-hidden bg-black">
                  <video
                    src={sessionData.videoRecordingUrl}
                    controls
                    className="w-full max-h-[400px]"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <p className="text-white/40 text-sm mt-2">
                  Watch your interview recording to review your performance.
                </p>
              </div>
            )}

            {/* Overall Score */}
            <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Overall Score
                </h2>
                <div className="flex items-center gap-2">
                  <ScoreRing score={assessment.overallScore} />
                  <div className="text-4xl font-bold text-[#d4af37]">
                    {assessment.overallScore.toFixed(1)}
                    <span className="text-lg text-white/40">/5</span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assessment.assessmentSchema === "product-sense" ? (
                  <>
                    <ScoreItem label="Product Motivation" score={(assessment.scores as ProductSenseScores).productMotivation} weight="20%" />
                    <ScoreItem label="Target Audience" score={(assessment.scores as ProductSenseScores).targetAudience} weight="25%" />
                    <ScoreItem label="Problem Identification" score={(assessment.scores as ProductSenseScores).problemIdentification} weight="25%" />
                    <ScoreItem label="Solution Development" score={(assessment.scores as ProductSenseScores).solutionDevelopment} weight="20%" />
                    <ScoreItem label="Communication" score={(assessment.scores as ProductSenseScores).communicationStructure} weight="10%" />
                  </>
                ) : assessment.assessmentSchema === "analytical-thinking" ? (
                  <>
                    <ScoreItem label="Product Rationale" score={(assessment.scores as AnalyticalThinkingScores).productRationale} weight="15%" />
                    <ScoreItem label="Measuring Impact" score={(assessment.scores as AnalyticalThinkingScores).measuringImpact} weight="35%" />
                    <ScoreItem label="Setting Goals" score={(assessment.scores as AnalyticalThinkingScores).settingGoals} weight="25%" />
                    <ScoreItem label="Evaluating Tradeoffs" score={(assessment.scores as AnalyticalThinkingScores).evaluatingTradeoffs} weight="25%" />
                  </>
                ) : assessment.track === "product-management" ? (
                  <>
                    <ScoreItem label="Product Thinking" score={(assessment.scores as PMScores).productThinking} weight="25%" />
                    <ScoreItem label="Communication" score={(assessment.scores as PMScores).communication} weight="20%" />
                    <ScoreItem label="User Empathy" score={(assessment.scores as PMScores).userEmpathy} weight="15%" />
                    <ScoreItem label="Technical Depth" score={(assessment.scores as PMScores).technicalDepth} weight="15%" />
                    <ScoreItem label="Analytical Skills" score={(assessment.scores as PMScores).analyticalSkills} weight="15%" />
                    <ScoreItem label="Creativity" score={(assessment.scores as PMScores).creativity} weight="10%" />
                  </>
                ) : (
                  <>
                    <ScoreItem label="Structure" score={(assessment.scores as ConsultingScores).structure} weight="25%" />
                    <ScoreItem label="Problem Solving" score={(assessment.scores as ConsultingScores).problemSolving} weight="20%" />
                    <ScoreItem label="Business Judgment" score={(assessment.scores as ConsultingScores).businessJudgment} weight="20%" />
                    <ScoreItem label="Communication" score={(assessment.scores as ConsultingScores).communication} weight="15%" />
                    <ScoreItem label="Quantitative" score={(assessment.scores as ConsultingScores).quantitative} weight="10%" />
                    <ScoreItem label="Creativity" score={(assessment.scores as ConsultingScores).creativity} weight="10%" />
                  </>
                )}
              </div>
            </div>

            {/* Feedback */}
            <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                AI Feedback
              </h2>
              <p className="text-white/70 leading-relaxed">{assessment.feedback}</p>
            </div>

            {/* Dimension-Specific Feedback (Product Sense and Analytical Thinking) */}
            {(assessment.assessmentSchema === "product-sense" || assessment.assessmentSchema === "analytical-thinking") && assessment.dimensionFeedback && (
              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Detailed Dimension Feedback
                </h2>
                <div className="space-y-4">
                  {Object.entries(assessment.dimensionFeedback).map(([dimension, feedback]) => (
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

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <span className="text-xl">✓</span> Strengths
                </h2>
                <ul className="space-y-3">
                  {assessment.strengths.map((item, i) => (
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
                  {assessment.improvements.map((item, i) => (
                    <li key={i} className="text-white/70 flex items-start gap-2">
                      <span className="text-[#d4af37] mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Session Transcript
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sessionData.transcript.map((entry, i) => (
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

            {/* Actions */}
            <div className="flex gap-4 justify-center pt-4">
              <Link
                href={`/practice/${questionId}`}
                className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-lg font-medium hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
              >
                Practice Again
              </Link>
              <Link
                href={`/company/${question.companySlug}`}
                className="px-6 py-3 bg-[#0f172a] text-white rounded-lg font-medium hover:bg-[#152238] transition-colors border border-white/10"
              >
                Try Another Question
              </Link>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
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
