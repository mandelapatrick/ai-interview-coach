"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVoiceSession, TranscriptEntry } from "@/hooks/useVoiceSession";
import { Question } from "@/types";
import { getSystemPrompt } from "@/data/prompts";

interface VoiceSessionProps {
  question: Question;
}

export default function VoiceSession({ question }: VoiceSessionProps) {
  const router = useRouter();
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const systemPrompt = getSystemPrompt(
    question.type,
    question.title,
    question.description
  );

  const {
    isConnected,
    isRecording,
    isSpeaking,
    transcript,
    error,
    duration,
    formatDuration,
    startSession,
    endSession,
  } = useVoiceSession({
    systemPrompt,
    onSessionEnd: (finalTranscript) => {
      // Store transcript in sessionStorage for assessment page
      sessionStorage.setItem(
        "lastSession",
        JSON.stringify({
          questionId: question.id,
          transcript: finalTranscript,
          duration,
        })
      );
      router.push(`/assessment/${question.id}`);
    },
  });

  const handleEnd = () => {
    if (transcript.length > 0) {
      setShowEndConfirm(true);
    } else {
      endSession();
      router.push(`/company/${question.companySlug}`);
    }
  };

  const confirmEnd = () => {
    endSession();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-gray-400">Recording</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-2">
              <span className="text-blue-400">🔊</span>
              <span className="text-sm text-gray-400">AI Speaking</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-mono text-white">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {transcript.length === 0 && !isRecording && (
          <div className="text-center text-gray-500 py-12">
            <p>Click &quot;Start Interview&quot; to begin your practice session.</p>
            <p className="text-sm mt-2">Make sure your microphone is ready.</p>
          </div>
        )}

        {transcript.length === 0 && isRecording && (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-pulse">
              <p>Connecting to AI interviewer...</p>
              <p className="text-sm mt-2">The interview will begin shortly.</p>
            </div>
          </div>
        )}

        {transcript.map((entry, index) => (
          <TranscriptBubble key={index} entry={entry} />
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="p-6 border-t border-gray-800">
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startSession}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white rounded-full font-semibold text-lg hover:bg-green-700 transition-colors"
            >
              <MicIcon />
              Start Interview
            </button>
          ) : (
            <button
              onClick={handleEnd}
              className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-full font-semibold text-lg hover:bg-red-700 transition-colors"
            >
              <StopIcon />
              End Interview
            </button>
          )}
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              End Interview?
            </h3>
            <p className="text-gray-400 mb-6">
              Your session will be saved and you&apos;ll receive an AI assessment of your performance.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                End & Get Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TranscriptBubble({ entry }: { entry: TranscriptEntry }) {
  const isUser = entry.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-100"
        }`}
      >
        <div className="text-xs text-gray-400 mb-1">
          {isUser ? "You" : "AI Interviewer"}
        </div>
        <p className="whitespace-pre-wrap">{entry.text}</p>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}
