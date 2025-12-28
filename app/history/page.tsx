"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { QUESTION_TYPE_LABELS, TYPE_COLORS, QuestionType } from "@/types";

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
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-yellow-600";
    return "text-red-600";
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Practice History
          </h1>
          <p className="text-gray-600">
            Track your progress and review past interview sessions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{totalSessions}</div>
            <div className="text-sm text-gray-500">Total Sessions</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
              {avgScore > 0 ? avgScore.toFixed(1) : "-"}
            </div>
            <div className="text-sm text-gray-500">Average Score</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {Math.floor(totalTime / 60)}m
            </div>
            <div className="text-sm text-gray-500">Total Practice Time</div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading history...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No practice sessions yet
            </h2>
            <p className="text-gray-600 mb-6">
              Complete your first interview practice to see your history here.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => {
                  const assessment = session.assessments?.[0];
                  const questionType = session.question_type as QuestionType;

                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {session.question_title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            TYPE_COLORS[questionType] || "text-gray-600 bg-gray-100"
                          }`}
                        >
                          {QUESTION_TYPE_LABELS[questionType] || session.question_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
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
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDate(session.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/practice/${session.question_id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Practice Again
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
