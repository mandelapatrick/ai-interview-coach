"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, PM_QUESTION_TYPE_LABELS, PMQuestionType, InterviewTrack } from "@/types";
import { TranscriptEntry } from "@/types";
import { getPendingRecording } from "@/lib/recordingTransfer";
import { uploadRecording } from "@/hooks/useVideoRecorder";
import { track } from "@/lib/analytics-client";

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
  const searchParams = useSearchParams();
  const questionId = params.questionId as string;
  const question = getQuestionById(questionId);
  const isOnboarding = searchParams.get("onboarding") === "true";
  const company = question ? getCompanyBySlug(question.companySlug) : null;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoRecordingUrl, setVideoRecordingUrl] = useState<string | null>(null);

  // Track assessment view
  useEffect(() => {
    track("assessment_view", { question_id: questionId });
  }, [questionId]);

  // Handle background upload of video recording
  useEffect(() => {
    const uploadPendingRecording = async () => {
      const blob = getPendingRecording();
      if (blob && blob.size > 0) {
        console.log("[Assessment] Uploading pending recording, blob size:", blob.size);
        try {
          const tempSessionId = `temp-${Date.now()}`;
          const url = await uploadRecording(blob, tempSessionId);
          if (url) {
            console.log("[Assessment] Recording uploaded:", url);
            setVideoRecordingUrl(url);
          } else {
            // Fallback to local blob URL
            const localUrl = URL.createObjectURL(blob);
            console.log("[Assessment] Using local blob URL:", localUrl);
            setVideoRecordingUrl(localUrl);
          }
        } catch (err) {
          console.error("[Assessment] Failed to upload recording:", err);
          // Fallback to local blob URL
          const localUrl = URL.createObjectURL(blob);
          setVideoRecordingUrl(localUrl);
        }
      }
    };

    uploadPendingRecording();
  }, []);

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
              sessionType: "practice",
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

  // Get score entries for category tiles
  const getScoreEntries = (): { label: string; score: number; weight: string }[] => {
    if (!assessment) return [];

    if (assessment.assessmentSchema === "product-sense") {
      const s = assessment.scores as ProductSenseScores;
      return [
        { label: "Product Motivation", score: s.productMotivation, weight: "20%" },
        { label: "Target Audience", score: s.targetAudience, weight: "25%" },
        { label: "Problem Identification", score: s.problemIdentification, weight: "25%" },
        { label: "Solution Development", score: s.solutionDevelopment, weight: "20%" },
        { label: "Communication", score: s.communicationStructure, weight: "10%" },
      ];
    }
    if (assessment.assessmentSchema === "analytical-thinking") {
      const s = assessment.scores as AnalyticalThinkingScores;
      return [
        { label: "Product Rationale", score: s.productRationale, weight: "15%" },
        { label: "Measuring Impact", score: s.measuringImpact, weight: "35%" },
        { label: "Setting Goals", score: s.settingGoals, weight: "25%" },
        { label: "Evaluating Tradeoffs", score: s.evaluatingTradeoffs, weight: "25%" },
      ];
    }
    if (assessment.track === "product-management") {
      const s = assessment.scores as PMScores;
      return [
        { label: "Product Thinking", score: s.productThinking, weight: "25%" },
        { label: "Communication", score: s.communication, weight: "20%" },
        { label: "User Empathy", score: s.userEmpathy, weight: "15%" },
        { label: "Technical Depth", score: s.technicalDepth, weight: "15%" },
        { label: "Analytical Skills", score: s.analyticalSkills, weight: "15%" },
        { label: "Creativity", score: s.creativity, weight: "10%" },
      ];
    }
    // Default: consulting
    const s = assessment.scores as ConsultingScores;
    return [
      { label: "Structure", score: s.structure, weight: "25%" },
      { label: "Problem Solving", score: s.problemSolving, weight: "20%" },
      { label: "Business Sense", score: s.businessJudgment, weight: "20%" },
      { label: "Communication", score: s.communication, weight: "15%" },
      { label: "Quantitative", score: s.quantitative, weight: "10%" },
      { label: "Creativity", score: s.creativity, weight: "10%" },
    ];
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-[#fcfaf6] flex items-center justify-center">
        <p className="text-[#1b1b1b]/45">Question not found</p>
      </div>
    );
  }

  const isConsulting = question.track === "consulting";
  const interviewTypeLabel = isConsulting ? "Consulting Interview" : "PM Interview";
  const overallPct = assessment ? Math.round(((assessment.overallScore ?? 0) / 5) * 100) : 0;
  const scoreEntries = getScoreEntries();
  const numCategories = scoreEntries.length;

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
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-[54px] flex items-center justify-between gap-2">
          {isOnboarding ? (
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 text-[13.5px] text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 transition-colors font-medium shrink-0"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden sm:inline">Go to Dashboard</span>
            </a>
          ) : (
            <Link
              href={`/dashboard/questions?track=${question.track}`}
              className="flex items-center gap-1.5 text-[13.5px] text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 transition-colors font-medium shrink-0"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span className="hidden xs:inline">Back to</span> Question Bank
            </Link>
          )}
          <div className="flex items-center gap-2 text-[13px] min-w-0">
            <span className="font-semibold text-[#1b1b1b] truncate">{interviewTypeLabel}</span>
            <span className="w-1 h-1 rounded-full bg-[#1b1b1b]/20 shrink-0" />
            <span className="text-[#1b1b1b]/45 shrink-0">{sessionData ? formatDuration(sessionData.duration) : "--:--"} session</span>
            {!isOnboarding && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#1b1b1b]/20 shrink-0 hidden sm:block" />
                <Link
                  href="/dashboard/history"
                  className="text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 transition-colors shrink-0 hidden sm:block"
                >
                  View History
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-5 sm:py-7">
        {/* Page header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-[26px] sm:text-[34px] font-normal text-[#1b1b1b] tracking-[-0.5px] font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
            Interview Assessment
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-[13.5px] text-[#1b1b1b]/45">
            <span>{question.title}</span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#1b1b1b]/25" />
            <span>{sessionData ? formatDuration(sessionData.duration) : "--:--"} session</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1b1b1b] mx-auto mb-4"></div>
            <p className="text-[#1b1b1b]/[0.68]">Analyzing your performance with AI...</p>
            <p className="text-[13px] text-[#1b1b1b]/45 mt-2">This may take a few seconds</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#1b1b1b]/[0.07]">
            <p className="text-[#ef8660] mb-4">{error}</p>
            <Link
              href={`/practice/${questionId}`}
              className="text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 transition-colors"
            >
              Start a new practice session
            </Link>
          </div>
        ) : !sessionData ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#1b1b1b]/[0.07]">
            <p className="text-[#1b1b1b]/45 mb-4">No session data found.</p>
            <Link
              href={`/practice/${questionId}`}
              className="text-[#1b1b1b]/45 hover:text-[#1b1b1b]/70 transition-colors"
            >
              Start a new practice session
            </Link>
          </div>
        ) : assessment ? (
          <div className="space-y-5">
            {/* Session Recording */}
            {(videoRecordingUrl || sessionData?.videoRecordingUrl) && (
              <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                <h2 className="text-[15px] font-normal text-[#1b1b1b] mb-4 font-display flex items-center gap-2" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                  <svg className="w-[18px] h-[18px] text-[#1b1b1b]/65" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Session Recording
                </h2>
                <div className="rounded-xl overflow-hidden bg-black">
                  <video
                    src={videoRecordingUrl || sessionData.videoRecordingUrl || ''}
                    controls
                    className="w-full max-h-[400px]"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <p className="text-[#1b1b1b]/45 text-[13px] mt-3">
                  Watch your interview recording to review your performance.
                </p>
              </div>
            )}

            {/* Score + AI Feedback row */}
            <div className="flex flex-col sm:flex-row gap-[18px] items-start">
              {/* Score panel */}
              <div className="flex-1 w-full bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-5 sm:p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {scoreEntries.map((entry) => (
                    <CategoryTile key={entry.label} label={entry.label} score={entry.score} weight={entry.weight} />
                  ))}
                </div>
              </div>

              {/* AI Feedback panel */}
              <div className="w-full sm:w-[315px] sm:shrink-0">
                <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-5 sm:p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
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
            {(assessment.assessmentSchema === "product-sense" || assessment.assessmentSchema === "analytical-thinking") && assessment.dimensionFeedback && (
              <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
                <h2 className="text-[15px] font-normal text-[#1b1b1b] mb-4 font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                  Detailed Dimension Feedback
                </h2>
                <div className="space-y-4">
                  {Object.entries(assessment.dimensionFeedback).map(([dimension, feedback]) => (
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
            <div className="flex flex-col sm:flex-row gap-[18px]" id="details">
              {/* Strengths */}
              <div className="flex-1 bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-5 sm:p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
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
                  {assessment.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1e4635] mt-2 shrink-0" />
                      <span className="text-[13px] leading-[21px] text-[#1b1b1b]/[0.72]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas to Improve */}
              <div className="flex-1 bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-5 sm:p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
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
                  {assessment.improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ef8660] mt-2 shrink-0" />
                      <span className="text-[13px] leading-[21px] text-[#1b1b1b]/[0.72]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-6 shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
              <h2 className="text-[15px] font-normal text-[#1b1b1b] mb-4 font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
                Session Transcript
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sessionData.transcript.map((entry, i) => (
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

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {isOnboarding ? (
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-[#c1f879] text-[#1b1b1b] rounded-full font-semibold hover:bg-[#b5ee6a] transition-colors text-center text-[14px]"
                >
                  Go to Dashboard
                </a>
              ) : (
                <>
                  <Link
                    href={`/practice/${questionId}`}
                    className="px-6 py-3 bg-[#c1f879] text-[#1b1b1b] rounded-full font-semibold hover:bg-[#b5ee6a] transition-colors text-center text-[14px]"
                  >
                    Practice Again
                  </Link>
                  <Link
                    href={`/dashboard/questions?track=${question.track}`}
                    className="px-6 py-3 bg-white text-[#1b1b1b] rounded-full font-semibold hover:bg-[#1b1b1b]/[0.03] transition-colors border border-[#1b1b1b]/[0.07] text-center text-[14px]"
                  >
                    Try Another Question
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : null}
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

function CategoryTile({ label, score, weight }: { label: string; score: number; weight: string }) {
  const pct = Math.round(((score ?? 0) / 5) * 100);
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
      <div className={`text-[9px] tracking-[0.3px] mt-0.5 ${
        isGood ? "text-[#1e4635]/40" : "text-[#6f260b]/35"
      }`}>
        ({weight})
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
