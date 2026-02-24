"use client";

import { useState } from "react";
import { Question } from "@/types";
import LearnSession from "./LearnSession";

type FlowState = "intro" | "watching" | "summary";

interface LearnFlowProps {
  question: Question;
}

export default function LearnFlow({ question }: LearnFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>("intro");
  const [sessionTranscript, setSessionTranscript] = useState<
    Array<{ speaker: "interviewer" | "candidate"; text: string; timestamp: Date }>
  >([]);

  const handleStartWatching = () => {
    setFlowState("watching");
  };

  const handleSessionEnd = (
    transcript: Array<{ speaker: "interviewer" | "candidate"; text: string; timestamp: Date }>
  ) => {
    setSessionTranscript(transcript);
    setFlowState("summary");
  };

  const handleBackToIntro = () => {
    setFlowState("intro");
    setSessionTranscript([]);
  };

  switch (flowState) {
    case "intro":
      return (
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 font-display">Learn Mode</h2>
              <p className="text-lg text-gray-600 mb-6">
                Watch a simulated interview between an AI interviewer and an expert candidate.
                Learn how to structure your answers and what excellent responses look like.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 mb-8 text-left border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">What to expect:</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-gray-800">Two AI avatars</strong> - An interviewer asks
                    questions, and an expert candidate demonstrates quality responses
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-gray-800">Interactive controls</strong> - Pause anytime
                    to absorb key points or ask clarifying questions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-violet-400 mt-1">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong className="text-gray-800">Best practices</strong> - See frameworks,
                    structured thinking, and communication patterns in action
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStartWatching}
              className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              Start Learning
            </button>
          </div>
        </div>
      );

    case "watching":
      return <LearnSession question={question} onEnd={handleSessionEnd} />;

    case "summary":
      return (
        <div className="h-full flex flex-col p-8 overflow-auto">
          <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 font-display">Session Complete</h2>
              <p className="text-lg text-gray-600">
                Here&apos;s a summary of the interview demonstration you just watched.
              </p>
            </div>

            {/* Transcript Summary */}
            <div className="bg-white rounded-xl p-6 mb-8 border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Conversation Transcript</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {sessionTranscript.length > 0 ? (
                  sessionTranscript.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        entry.speaker === "interviewer"
                          ? "bg-blue-500/10 border-l-2 border-blue-400"
                          : "bg-violet-500/10 border-l-2 border-violet-400"
                      }`}
                    >
                      <span
                        className={`text-xs font-medium uppercase ${
                          entry.speaker === "interviewer"
                            ? "text-blue-400"
                            : "text-violet-400"
                        }`}
                      >
                        {entry.speaker}
                      </span>
                      <p className="text-gray-700 mt-1">{entry.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No transcript available.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleBackToIntro}
                className="px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-all border border-gray-200"
              >
                Watch Again
              </button>
              <a
                href={`/practice/${question.id}`}
                className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
              >
                Practice Now
              </a>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
