"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SessionWithAssessment {
  id: string;
  question_id: string;
  question_title: string;
  question_type: string;
  question_track?: string;
  company_slug: string;
  duration_seconds: number;
  video_recording_url: string | null;
  created_at: string;
  assessments: Array<{
    overall_score: number;
    structure_score: number;
    problem_solving_score: number;
    business_judgment_score: number;
    communication_score: number;
    quantitative_score: number;
    creativity_score: number;
  }>;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionWithAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions");
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScorePct = (score: number) => Math.round((score / 5) * 100);

  const getScoreColor = (score: number) => {
    const pct = getScorePct(score);
    if (pct >= 60) return "text-[#1e4635]";
    return "text-[#ef8660]";
  };

  const getScoreRingColor = (score: number) => {
    const pct = getScorePct(score);
    if (pct >= 60) return "#1e4635";
    return "#ef8660";
  };

  const getScoreTrackColor = (score: number) => {
    const pct = getScorePct(score);
    if (pct >= 60) return "#d4ecb8";
    return "#fde8d8";
  };

  // Calculate stats
  const totalSessions = sessions.length;
  const avgScore =
    sessions.length > 0
      ? sessions.reduce((acc, s) => {
          const assessment = s.assessments?.[0];
          return acc + (assessment?.overall_score || 0);
        }, 0) / sessions.length
      : 0;
  const totalTime = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-[34px] font-normal text-[#1b1b1b] tracking-[-0.5px] font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
          Practice History
        </h1>
        <p className="text-[#1b1b1b]/45 text-[14px] mt-1">
          Track your progress and review past interview sessions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-4 text-center shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
          <div className="text-[30px] font-display text-[#1b1b1b]" style={{ fontVariationSettings: "'SOFT' 0, 'WONK' 1" }}>{totalSessions}</div>
          <div className="text-[13px] text-[#1b1b1b]/45">Total Sessions</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-4 text-center shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
          <div className={`text-[30px] font-display ${getScoreColor(avgScore)}`} style={{ fontVariationSettings: "'SOFT' 0, 'WONK' 1" }}>
            {avgScore > 0 ? `${getScorePct(avgScore)}%` : "-"}
          </div>
          <div className="text-[13px] text-[#1b1b1b]/45">Average Score</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] p-4 text-center shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
          <div className="text-[30px] font-display text-[#1e4635]" style={{ fontVariationSettings: "'SOFT' 0, 'WONK' 1" }}>
            {Math.floor(totalTime / 60)}m
          </div>
          <div className="text-[13px] text-[#1b1b1b]/45">Total Practice Time</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1b1b1b] mx-auto mb-4"></div>
          <p className="text-[#1b1b1b]/45">Loading history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#1b1b1b]/[0.07] shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
          <div className="w-16 h-16 bg-[#c1f879] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#1b1b1b]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-[15px] font-normal text-[#1b1b1b] mb-2 font-display" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1" }}>
            No practice sessions yet
          </h2>
          <p className="text-[#1b1b1b]/45 mb-6 text-[13px]">
            Complete your first interview practice to see your history here.
          </p>
          <Link
            href="/dashboard/questions"
            className="inline-block px-6 py-3 bg-[#c1f879] text-[#1b1b1b] rounded-full font-semibold hover:bg-[#b5ee6a] transition-colors text-[14px]"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#1b1b1b]/[0.07] overflow-hidden shadow-[0px_1px_4px_rgba(27,27,27,0.04),0px_4px_20px_rgba(27,27,27,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#1b1b1b]/[0.07]">
                <tr>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#1b1b1b]/45 tracking-[0.7px] uppercase">
                    Question
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#1b1b1b]/45 tracking-[0.7px] uppercase">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#1b1b1b]/45 tracking-[0.7px] uppercase">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-[10px] font-semibold text-[#1b1b1b]/45 tracking-[0.7px] uppercase">
                    Score
                  </th>
                  <th className="text-center px-6 py-3 text-[10px] font-semibold text-[#1b1b1b]/45 tracking-[0.7px] uppercase">
                    Recording
                  </th>
                  <th className="text-right px-6 py-3 text-[10px] font-semibold text-[#1b1b1b]/45 tracking-[0.7px] uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b1b1b]/[0.05]">
                {sessions.map((session) => {
                  const assessment = session.assessments?.[0];
                  const hasAssessment = !!assessment;

                  return (
                    <tr
                      key={session.id}
                      className={`hover:bg-[#1b1b1b]/[0.02] ${
                        hasAssessment ? "cursor-pointer" : ""
                      }`}
                      onClick={() =>
                        hasAssessment &&
                        (window.location.href = `/session/${session.id}`)
                      }
                    >
                      {/* Question */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#1b1b1b] text-[13px]">
                          {session.question_title}
                        </div>
                      </td>
                      {/* Duration */}
                      <td className="px-6 py-4 text-[13px] text-[#1b1b1b]/[0.68]">
                        {formatDuration(session.duration_seconds)}
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-[13px] text-[#1b1b1b]/[0.68]">
                        {formatDate(session.created_at)}
                      </td>
                      {/* Score */}
                      <td className="px-6 py-4">
                        {assessment && assessment.overall_score != null ? (
                          <div className="flex items-center gap-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0 -rotate-90">
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke={getScoreTrackColor(assessment.overall_score)}
                                strokeWidth="3"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                fill="none"
                                stroke={getScoreRingColor(assessment.overall_score)}
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={`${(assessment.overall_score / 5) * 62.83} 62.83`}
                              />
                            </svg>
                            <span className={`text-[13px] font-semibold ${getScoreColor(assessment.overall_score)}`}>
                              {getScorePct(assessment.overall_score)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#1b1b1b]/30">-</span>
                        )}
                      </td>
                      {/* Recording */}
                      <td className="px-6 py-4 text-center">
                        {session.video_recording_url ? (
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#c1f879]/15"
                            title="Recording available"
                          >
                            <svg
                              className="w-4 h-4 text-[#1e4635]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="text-[#1b1b1b]/20">-</span>
                        )}
                      </td>
                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/practice/${session.question_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-[#1e4635] hover:text-[#1e4635]/80 text-[13px] font-medium transition-colors"
                        >
                          Practice
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#c1f879]/15">
                            <svg className="w-3.5 h-3.5 text-[#1e4635]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
