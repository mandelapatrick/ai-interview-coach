"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  QUESTION_TYPE_LABELS,
  PM_QUESTION_TYPE_LABELS,
  TYPE_COLORS_DARK,
  PM_TYPE_COLORS_DARK,
  QuestionType,
  PMQuestionType,
} from "@/types";

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

  const getTypeColor = (questionType: string) => {
    if (TYPE_COLORS_DARK[questionType as QuestionType]) {
      return TYPE_COLORS_DARK[questionType as QuestionType];
    }
    if (PM_TYPE_COLORS_DARK[questionType as PMQuestionType]) {
      return PM_TYPE_COLORS_DARK[questionType as PMQuestionType];
    }
    return "text-gray-400 bg-gray-400/10";
  };

  const getTypeLabel = (questionType: string) => {
    if (QUESTION_TYPE_LABELS[questionType as QuestionType]) {
      return QUESTION_TYPE_LABELS[questionType as QuestionType];
    }
    if (PM_QUESTION_TYPE_LABELS[questionType as PMQuestionType]) {
      return PM_QUESTION_TYPE_LABELS[questionType as PMQuestionType];
    }
    return questionType;
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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
          Practice History
        </h1>
        <p className="text-gray-500">
          Track your progress and review past interview sessions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{totalSessions}</div>
          <div className="text-sm text-gray-400">Total Sessions</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
            {avgScore > 0 ? avgScore.toFixed(1) : "-"}
          </div>
          <div className="text-sm text-gray-400">Average Score</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-[#d4af37]">
            {Math.floor(totalTime / 60)}m
          </div>
          <div className="text-sm text-gray-400">Total Practice Time</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading history...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No practice sessions yet
          </h2>
          <p className="text-gray-500 mb-6">
            Complete your first interview practice to see your history here.
          </p>
          <Link
            href="/dashboard/questions"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-lg font-medium hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Recording
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => {
                  const assessment = session.assessments?.[0];
                  const questionType = session.question_type;
                  const hasAssessment = !!assessment;

                  return (
                    <tr
                      key={session.id}
                      className={`hover:bg-gray-100 ${
                        hasAssessment ? "cursor-pointer" : ""
                      }`}
                      onClick={() =>
                        hasAssessment &&
                        (window.location.href = `/session/${session.id}`)
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {session.question_title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                            questionType
                          )}`}
                        >
                          {getTypeLabel(questionType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {formatDuration(session.duration_seconds)}
                      </td>
                      <td className="px-6 py-4">
                        {assessment && assessment.overall_score != null ? (
                          <span
                            className={`font-semibold ${getScoreColor(
                              assessment.overall_score
                            )}`}
                          >
                            {assessment.overall_score.toFixed(1)}/5
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {session.video_recording_url ? (
                          <span
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#d4af37]/10"
                            title="Recording available"
                          >
                            <svg
                              className="w-4 h-4 text-[#d4af37]"
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
                          <span className="text-gray-200">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(session.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {hasAssessment && (
                            <Link
                              href={`/session/${session.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
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
        </div>
      )}
    </div>
  );
}
