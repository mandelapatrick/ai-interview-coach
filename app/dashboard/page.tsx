"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QUESTION_TYPE_LABELS, QuestionType } from "@/types";

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
  }>;
}

const TYPE_COLORS: Record<string, string> = {
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
  "product-sense": "text-violet-400 bg-violet-400/10",
  "analytical-thinking": "text-emerald-400 bg-emerald-400/10",
  behavioral: "text-amber-400 bg-amber-400/10",
  technical: "text-blue-400 bg-blue-400/10",
  strategy: "text-rose-400 bg-rose-400/10",
  estimation: "text-indigo-400 bg-indigo-400/10",
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionWithAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions");
        if (response.ok) {
          const data = await response.json();
          setSessions(data.slice(0, 3)); // Get only 3 most recent
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
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-[#d4af37]";
    return "text-red-400";
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-display">
          Welcome to AceInterview!
        </h1>
        <p className="text-white/60">Ready to get started?</p>
      </div>

      {/* Based on your recent practice */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Based on your recent practice
        </h2>
        <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37] mb-4"></div>
              <p className="text-white/50">Loading...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <svg
                className="w-12 h-12 text-white/30 mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3 className="text-lg font-semibold text-white mb-2">
                Hmmm, no activity.
              </h3>
              <p className="text-white/50 text-center mb-4 max-w-md">
                We&apos;ll suggest personalized questions based on your practice
                history. Begin by exploring the question bank.
              </p>
              <Link
                href="/dashboard/questions"
                className="text-[#d4af37] hover:text-[#f4d03f] font-medium transition-colors"
              >
                Start exploring
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const assessment = session.assessments?.[0];
                const questionType = session.question_type as QuestionType;
                return (
                  <Link
                    key={session.id}
                    href={`/session/${session.id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-[#152238] hover:bg-[#1c3a5c] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#d4af37]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">
                          {session.question_title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              TYPE_COLORS[questionType] ||
                              "text-gray-400 bg-gray-400/10"
                            }`}
                          >
                            {QUESTION_TYPE_LABELS[questionType] ||
                              session.question_type}
                          </span>
                          <span className="text-xs text-white/40">
                            {formatDate(session.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {assessment && assessment.overall_score != null && (
                      <div
                        className={`font-semibold ${getScoreColor(
                          assessment.overall_score
                        )}`}
                      >
                        {assessment.overall_score.toFixed(1)}/5
                      </div>
                    )}
                  </Link>
                );
              })}
              <Link
                href="/dashboard/history"
                className="block text-center text-[#d4af37] hover:text-[#f4d03f] font-medium pt-2 transition-colors"
              >
                View all history
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Pick back up */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Pick back up</h2>
        <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-8">
          <div className="flex flex-col items-center justify-center py-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Nothing in progress
            </h3>
            <p className="text-white/50 text-center mb-4">
              Practice sessions you&apos;ve started will show up here.
            </p>
            <Link
              href="/dashboard/questions"
              className="text-[#d4af37] hover:text-[#f4d03f] font-medium transition-colors"
            >
              Go to Question Bank
            </Link>
          </div>
        </div>
      </section>

      {/* Quick access to tracks */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">
          Browse by track
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/consulting"
            className="group bg-[#1a2d47] rounded-xl border border-white/10 p-6 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-blue-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                  Consulting
                </h3>
                <p className="text-sm text-white/50">MBB & Big 4 case interviews</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/pm"
            className="group bg-[#1a2d47] rounded-xl border border-white/10 p-6 hover:border-violet-500/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-violet-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                  Product Management
                </h3>
                <p className="text-sm text-white/50">FAANG & tech company PMs</p>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
