"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVoiceSession, TranscriptEntry } from "@/hooks/useVoiceSession";
import { Question } from "@/types";
import { getSystemPrompt } from "@/data/prompts";
import HintModal from "./HintModal";

interface VoiceSessionProps {
  question: Question;
  maxDurationSeconds?: number | null;
}

export default function VoiceSession({ question, maxDurationSeconds }: VoiceSessionProps) {
  const router = useRouter();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  const systemPrompt = getSystemPrompt(question);

  const {
    isConnected,
    isRecording,
    isSpeaking,
    isMuted,
    transcript,
    error,
    duration,
    formatDuration,
    startSession,
    endSession,
    toggleMute,
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

  // Auto-end session when duration limit reached
  useEffect(() => {
    if (!maxDurationSeconds || !isConnected) return;

    if (duration >= maxDurationSeconds) {
      setShowTimeWarning(false);
      endSession();
    } else if (duration >= maxDurationSeconds - 60 && !showTimeWarning) {
      setShowTimeWarning(true);
    }
  }, [duration, maxDurationSeconds, isConnected, endSession, showTimeWarning]);

  const handleGetHint = async () => {
    if (isLoadingHint || hintCount >= 3) return;

    setIsLoadingHint(true);
    try {
      const response = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solution: question.solution,
          transcript: transcript,
          questionTitle: question.title,
          questionDescription: question.description,
          hintNumber: hintCount + 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get hint");
      }

      const data = await response.json();
      setCurrentHint(data.hint);
      setHintCount((prev) => prev + 1);
      setShowHintModal(true);
    } catch (error) {
      console.error("Failed to get hint:", error);
    } finally {
      setIsLoadingHint(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Time limit warning banner */}
      {showTimeWarning && maxDurationSeconds && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-sm text-amber-800 font-medium">
            Less than 1 minute remaining in your free session
          </p>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-gray-600">Recording</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center gap-2">
              <span className="text-[#d4af37]">🔊</span>
              <span className="text-sm text-gray-600">AI Speaking</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-mono text-[#d4af37]">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {transcript.length === 0 && !isRecording && (
          <div className="text-center text-gray-600 py-12">
            <p>Click &quot;Start Interview&quot; to begin your practice session.</p>
            <p className="text-sm mt-2">Make sure your microphone is ready.</p>
          </div>
        )}

        {transcript.length === 0 && isRecording && (
          <div className="text-center text-gray-600 py-12">
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
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startSession}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
            >
              <MicIcon />
              Start Interview
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`flex items-center gap-2 px-6 py-4 rounded-full font-medium transition-colors border ${
                  isMuted
                    ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                    : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                }`}
                title={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={handleGetHint}
                disabled={isLoadingHint || hintCount >= 3}
                className="flex items-center gap-2 px-6 py-4 bg-white text-gray-900 rounded-full font-medium hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingHint ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <HintIcon />
                )}
                {isLoadingHint ? "Loading..." : hintCount >= 3 ? "No hints left" : `Get Hint${hintCount > 0 ? ` (${3 - hintCount})` : ""}`}
              </button>
              <button
                onClick={handleEnd}
                className="flex items-center gap-3 px-8 py-4 bg-red-600 text-white rounded-full font-semibold text-lg hover:bg-red-700 transition-colors"
              >
                <StopIcon />
                End Interview
              </button>
            </>
          )}
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              End Interview?
            </h3>
            <p className="text-gray-500 mb-6">
              Your session will be saved and you&apos;ll receive an AI assessment of your performance.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-50 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                Continue
              </button>
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all font-medium"
              >
                End & Get Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && currentHint && (
        <HintModal
          hint={currentHint}
          hintNumber={hintCount}
          onClose={() => setShowHintModal(false)}
        />
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
            ? "bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        <div className={`text-xs mb-1 ${isUser ? "text-white/80" : "text-gray-600"}`}>
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

function MicOffIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
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

function HintIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}
