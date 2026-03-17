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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b1b1b] mx-auto mb-4"></div>
          <p className="text-[#1b1b1b]/45">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-[#fcfaf6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#ef8660] mb-4">{error || "Session not found"}</p>
          <Link
            href="/dashboard/history"
            className="text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 transition-colors"
          >
            &larr; Back to History
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

  // Get interview type label
  const questionType = session.question_type as QuestionType;
  const typeLabel = QUESTION_TYPE_LABELS[questionType] || session.question_type;
  const isConsulting = !assessment?.assessment_schema || assessment?.assessment_schema === "consulting";
  const interviewTypeLabel = isConsulting ? "Consulting Interview" : "PM Interview";

  // Convert score to percentage (out of 5 → percentage)
  const overallPct = assessment ? Math.round((assessment.overall_score / 5) * 100) : 0;

  // Get score entries for category tiles
  const getScoreEntries = (): { label: string; score: number }[] => {
    if (!assessment) return [];

    if (assessment.assessment_schema === "product-sense" && assessment.scores) {
      const s = assessment.scores as ProductSenseScores;
      return [
        { label: "Product Motivation", score: s.productMotivation },
        { label: "Target Audience", score: s.targetAudience },
        { label: "Problem Identification", score: s.problemIdentification },
        { label: "Solution Development", score: s.solutionDevelopment },
        { label: "Communication", score: s.communicationStructure },
      ];
    }
    if (assessment.assessment_schema === "analytical-thinking" && assessment.scores) {
      const s = assessment.scores as AnalyticalThinkingScores;
      return [
        { label: "Product Rationale", score: s.productRationale },
        { label: "Measuring Impact", score: s.measuringImpact },
        { label: "Setting Goals", score: s.settingGoals },
        { label: "Evaluating Tradeoffs", score: s.evaluatingTradeoffs },
      ];
    }
    if (assessment.assessment_schema === "pm-generic" && assessment.scores) {
      const s = assessment.scores as PMScores;
      return [
        { label: "Product Thinking", score: s.productThinking },
        { label: "Communication", score: s.communication },
        { label: "User Empathy", score: s.userEmpathy },
        { label: "Technical Depth", score: s.technicalDepth },
        { label: "Analytical Skills", score: s.analyticalSkills },
        { label: "Creativity", score: s.creativity },
      ];
    }
    // Default: consulting or legacy
    return [
      { label: "Structure", score: assessment.scores ? (assessment.scores as ConsultingScores).structure : assessment.structure_score },
      { label: "Problem Solving", score: assessment.scores ? (assessment.scores as ConsultingScores).problemSolving : assessment.problem_solving_score },
      { label: "Business Sense", score: assessment.scores ? (assessment.scores as ConsultingScores).businessJudgment : assessment.business_judgment_score },
      { label: "Communication", score: assessment.scores ? (assessment.scores as ConsultingScores).communication : assessment.communication_score },
      { label: "Quantitative", score: assessment.scores ? (assessment.scores as ConsultingScores).quantitative : assessment.quantitative_score },
      { label: "Creativity", score: assessment.scores ? (assessment.scores as ConsultingScores).creativity : assessment.creativity_score },
    ];
  };

  const scoreEntries = getScoreEntries();
  const numCategories = scoreEntries.length;

  // Get score badge
  const getScoreBadge = (pct: number) => {
    if (pct >= 80) return { label: "Excellent", bg: "bg-[#d4ecb8]", text: "text-[#1e4635]" };
    if (pct >= 60) return { label: "Good", bg: "bg-[#d4ecb8]", text: "text-[#1e4635]" };
    if (pct >= 40) return { label: "Needs Improvement", bg: "bg-[#fde8d8]", text: "text-[#6f260b]" };
    return { label: "Needs Improvement", bg: "bg-[#fde8d8]", text: "text-[#6f260b]" };
  };

  const scoreBadge = getScoreBadge(overallPct);

  return (
    <div className="min-h-screen bg-[#fcfaf6]">
      {/* Topbar */}
      <header className="bg-[#fcfaf6] border-b border-[#1b1b1b]/[0.08] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 h-[54px] flex items-center justify-between">
          <Link
            href="/dashboard/questions"
            className="flex items-center gap-1.5 text-[13.5px] text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 transition-colors font-medium"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Question Bank
          </Link>
          <div className="flex items-center gap-2 text-[13px]">
            <span className="font-semibold text-[#1b1b1b]">{interviewTypeLabel}</span>
            <span className="w-1 h-1 rounded-full bg-[#1b1b1b]/20" />
            <span className="text-[#1b1b1b]/45">{formatDuration(session.duration_seconds)} session</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-7">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-[34px] font-normal text-[#1b1b1b] tracking-[-0.5px] font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
            Interview Assessment
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-[13.5px] text-[#1b1b1b]/45">
            <span>{session.question_title}</span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#1b1b1b]/25" />
            <span>Completed on {formatDate(session.created_at)}</span>
          </div>
        </div>

        {assessment ? (
          <div className="space-y-5">
            {/* Session Recording */}
            {session.video_recording_url && (
              <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                <h2 className="text-[15px] font-normal text-[#1b1b1b] mb-4 font-display flex items-center gap-2" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                  <svg className="w-[18px] h-[18px] text-[#1b1b1b]/65" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Session Recording
                </h2>
                <div className="rounded-xl overflow-hidden bg-black">
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
                  <p className="text-[#1b1b1b]/45 text-[13px]">
                    Watch your interview recording to review your performance.
                  </p>
                  <a
                    href={session.video_recording_url}
                    download
                    className="text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 text-[13px] flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            )}

            {/* Score + AI Feedback row */}
            <div className="flex gap-[18px] items-start">
              {/* Score panel */}
              <div className="flex-1 bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#1b1b1b]/65" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="12" width="4" height="9" rx="1" />
                      <rect x="10" y="7" width="4" height="14" rx="1" />
                      <rect x="17" y="3" width="4" height="18" rx="1" />
                    </svg>
                    <span className="text-[15px] font-normal text-[#1b1b1b] font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                      Overall Score
                    </span>
                  </div>
                  <Link
                    href="#details"
                    className="bg-[#c1f879] text-[#1b1b1b] text-[13px] font-semibold px-[18px] py-2 rounded-full tracking-[0.1px] hover:bg-[#b5ee6a] transition-colors"
                  >
                    Details &rarr;
                  </Link>
                </div>

                {/* Gauge + score info */}
                <div className="flex items-center gap-5 pb-5 border-b border-[#1b1b1b]/[0.07] mb-5">
                  <ScoreGauge percentage={overallPct} />
                  <div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[13px] font-semibold ${scoreBadge.bg} ${scoreBadge.text}`}>
                      {scoreBadge.label}
                    </span>
                    <p className="text-[13px] text-[#1b1b1b]/45 mt-2">
                      {overallPct}% overall across {numCategories} categories
                    </p>
                  </div>
                </div>

                {/* Category tiles */}
                <div className="grid grid-cols-3 gap-3">
                  {scoreEntries.map((entry) => (
                    <CategoryTile key={entry.label} label={entry.label} score={entry.score} />
                  ))}
                </div>
              </div>

              {/* AI Feedback panel */}
              <div className="w-[315px] shrink-0">
                <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center" style={{ backgroundImage: "linear-gradient(135deg, rgb(232, 211, 248) 0%, rgb(204, 242, 251) 100%)" }}>
                      <span className="text-[#1b1b1b] text-sm">&#10022;</span>
                    </div>
                    <span className="text-[15px] font-normal text-[#1b1b1b] font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                      AI Feedback
                    </span>
                  </div>

                  {/* Feedback paragraphs */}
                  <div className="space-y-2.5 mb-4">
                    {assessment.feedback.split("\n").filter(Boolean).map((paragraph, i) => (
                      <p key={i} className="text-[13px] leading-[22px] text-[#1b1b1b]/[0.68]">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Recommendation box */}
                  {assessment.improvements && assessment.improvements.length > 0 && (
                    <div className="bg-[#c1f879]/10 border border-[#c1f879]/30 rounded-[10px] p-3.5">
                      <div className="flex gap-2.5 items-start">
                        <span className="text-[#1e4635]/70 text-[13px] mt-0.5 shrink-0">&#10022;</span>
                        <p className="text-[13px] leading-[20px] text-[#1b1b1b]/65">
                          {assessment.improvements[0]}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dimension-Specific Feedback */}
            {(assessment.assessment_schema === "product-sense" || assessment.assessment_schema === "analytical-thinking") && assessment.dimension_feedback && (
              <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                <h2 className="text-[15px] font-normal text-[#1b1b1b] mb-4 font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                  Detailed Dimension Feedback
                </h2>
                <div className="space-y-4">
                  {Object.entries(assessment.dimension_feedback).map(([dimension, feedback]) => (
                    <div key={dimension} className="border-l-2 border-[#c1f879]/50 pl-4">
                      <h3 className="text-[12px] font-semibold text-[#1e4635] uppercase tracking-[0.5px] mb-1">
                        {formatDimensionName(dimension)}
                      </h3>
                      <p className="text-[13px] leading-[21px] text-[#1b1b1b]/[0.68]">{feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths + Areas to Improve */}
            <div className="flex gap-[18px]" id="details">
              {/* Strengths */}
              <div className="flex-1 bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-[18px] h-[18px] text-[#1e4635]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <span className="text-[15px] font-normal text-[#1b1b1b] font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                      Strengths
                    </span>
                  </div>
                  <span className="bg-[#d4ecb8] text-[#1e4635] text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
                    {assessment.strengths?.length || 0} items
                  </span>
                </div>
                <ul className="space-y-3">
                  {assessment.strengths?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e4635] mt-2 shrink-0" />
                      <span className="text-[13px] leading-[21px] text-[#1b1b1b]/[0.72]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="flex-1 bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-[18px] h-[18px] text-[#ef8660]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    <span className="text-[15px] font-normal text-[#1b1b1b] font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                      Areas to Improve
                    </span>
                  </div>
                  <span className="bg-[#fde8d8] text-[#6f260b] text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
                    {assessment.improvements?.length || 0} items
                  </span>
                </div>
                <ul className="space-y-3">
                  {assessment.improvements?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef8660] mt-2 shrink-0" />
                      <span className="text-[13px] leading-[21px] text-[#1b1b1b]/[0.72]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transcript */}
            {transcript.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                <h2 className="text-[15px] font-normal text-[#1b1b1b] mb-4 font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                  Session Transcript
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {transcript.map((entry, i) => (
                    <div key={i}>
                      <div className="text-[11px] font-semibold text-[#1b1b1b]/45 uppercase tracking-[0.5px] mb-1">
                        {entry.role === "user" ? "You" : "AI Interviewer"}
                      </div>
                      <p
                        className={`text-[13px] leading-[21px] text-[#1b1b1b]/[0.72] p-3 rounded-xl ${
                          entry.role === "user"
                            ? "bg-[#c1f879]/10 border-l-[3px] border-[#c1f879]"
                            : "bg-[#1b1b1b]/[0.03] border-l-[3px] border-[#1b1b1b]/10"
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link
                href={`/practice/${session.question_id}`}
                className="px-6 py-3 bg-[#c1f879] text-[#1b1b1b] rounded-full font-semibold hover:bg-[#b5ee6a] transition-colors text-center text-[14px]"
              >
                Practice Again
              </Link>
              <Link
                href="/dashboard/history"
                className="px-6 py-3 bg-white text-[#1b1b1b] rounded-full font-semibold hover:bg-[#1b1b1b]/[0.03] transition-colors border border-[#1b1b1b]/[0.07] text-center text-[14px]"
              >
                View All Sessions
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#1b1b1b]/[0.07]">
            <p className="text-[#1b1b1b]/45 mb-4">No assessment available for this session.</p>
            <p className="text-[#1b1b1b]/[0.68] text-[13px]">
              Assessments are generated when you complete an interview practice session.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function ScoreGauge({ percentage }: { percentage: number }) {
  const size = 98;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 60) return "#1e4635";
    return "#ef8660";
  };

  const getTrackColor = (pct: number) => {
    if (pct >= 60) return "#d4ecb8";
    return "#fde8d8";
  };

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getTrackColor(percentage)}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[22px] text-[#1b1b1b] font-display" style={{ fontVariationSettings: "'SOFT' 0, 'WONK' 1" }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function CategoryTile({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 5) * 100);
  const isGood = pct >= 60;

  return (
    <div className={`rounded-xl border border-[#1b1b1b]/[0.06] p-4 ${
      isGood ? "bg-[#f1fae9]" : "bg-[#fef4ed]"
    }`}>
      <div className={`text-[30px] font-display leading-[30px] ${
        isGood ? "text-[#1e4635]" : "text-[#ef8660]"
      }`} style={{ fontVariationSettings: "'SOFT' 0, 'WONK' 1" }}>
        {pct}%
      </div>
      <div className={`text-[10px] font-semibold uppercase tracking-[0.7px] mt-1.5 ${
        isGood ? "text-[#1e4635]/60" : "text-[#6f260b]/55"
      }`}>
        {label}
      </div>
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
