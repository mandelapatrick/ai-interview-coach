"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QUESTION_TYPE_LABELS, QuestionType } from "@/types";

const TYPE_COLORS_DARK: Record<QuestionType, string> = {
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

interface SessionWithAssessment {
  id: string;
  question_id: string;
  question_title: string;
  question_type: string;
  company_slug: string;
  duration_seconds: number;
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-[#d4af37]";
    return "text-red-400";
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
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-display">
            Practice History
          </h1>
          <p className="text-white/60">
            Track your progress and review past interview sessions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-4 text-center">
            <div className="text-3xl font-bold text-white">{totalSessions}</div>
            <div className="text-sm text-white/50">Total Sessions</div>
          </div>
          <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-4 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
              {avgScore > 0 ? avgScore.toFixed(1) : "-"}
            </div>
            <div className="text-sm text-white/50">Average Score</div>
          </div>
          <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-4 text-center">
            <div className="text-3xl font-bold text-[#d4af37]">
              {Math.floor(totalTime / 60)}m
            </div>
            <div className="text-sm text-white/50">Total Practice Time</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
            <p className="text-white/50">Loading history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-[#1a2d47] rounded-xl border border-white/10">
            <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#0f172a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No practice sessions yet
            </h2>
            <p className="text-white/60 mb-6">
              Complete your first interview practice to see your history here.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-lg font-medium hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="bg-[#1a2d47] rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#152238] border-b border-white/10">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sessions.map((session) => {
                  const assessment = session.assessments?.[0];
                  const questionType = session.question_type as QuestionType;
                  const hasAssessment = !!assessment;

                  return (
                    <tr
                      key={session.id}
                      className={`hover:bg-[#213754] ${hasAssessment ? "cursor-pointer" : ""}`}
                      onClick={() => hasAssessment && (window.location.href = `/session/${session.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {session.question_title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            TYPE_COLORS_DARK[questionType] || "text-gray-400 bg-gray-400/10"
                          }`}
                        >
                          {QUESTION_TYPE_LABELS[questionType] || session.question_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50">
                        {formatDuration(session.duration_seconds)}
                      </td>
                      <td className="px-6 py-4">
                        {assessment ? (
                          <span
                            className={`font-semibold ${getScoreColor(
                              assessment.overall_score
                            )}`}
                          >
                            {assessment.overall_score.toFixed(1)}/5
                          </span>
                        ) : (
                          <span className="text-white/30">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/50 text-sm">
                        {formatDate(session.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {hasAssessment && (
                            <Link
                              href={`/session/${session.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
                            >
                              View
                            </Link>
                          )}
                          <Link
                            href={`/practice/${session.question_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#d4af37] hover:text-[#f4d03f] text-sm font-medium transition-colors"
                          >
                            Practice Again
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
  );
}
