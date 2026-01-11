"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnamAvatar } from "@/hooks/useAnamAvatar";
import { Question } from "@/types";
import { getSystemPrompt } from "@/data/prompts";
import HintModal from "./HintModal";

interface AnamAudioSessionProps {
  question: Question;
}

interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function AnamAudioSession({ question }: AnamAudioSessionProps) {
  const router = useRouter();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [duration, setDuration] = useState(0);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const avatarInitializedRef = useRef(false);

  const systemPrompt = getSystemPrompt(question);

  // Anam avatar hook - handles full conversation with Kimi K2
  const anamAvatar = useAnamAvatar({
    systemPrompt,
    onAvatarStartTalking: () => {
      console.log("[AnamAudio] Avatar started talking");
    },
    onAvatarStopTalking: () => {
      console.log("[AnamAudio] Avatar stopped talking");
    },
    onAvatarTranscription: (text) => {
      console.log("[AnamAudio] AI said:", text);
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
        return [...prev, { role: "assistant", text, timestamp: new Date() }];
      });
    },
    onUserTranscription: (text) => {
      console.log("[AnamAudio] User said:", text);
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "user") {
          return [...prev.slice(0, -1), { ...last, text: last.text + " " + text }];
        }
        return [...prev, { role: "user", text, timestamp: new Date() }];
      });
    },
    onStreamReady: () => {
      console.log("[AnamAudio] Stream ready");
      setIsSessionStarted(true);
    },
    onError: (err) => console.error("[AnamAudio] Error:", err),
  });

  // Keep transcript ref in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Timer for session duration
  useEffect(() => {
    if (isSessionStarted) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionStarted]);

  // Initialize Anam when starting session
  const startSession = async () => {
    if (avatarInitializedRef.current) return;

    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      if (hiddenVideoRef.current) {
        avatarInitializedRef.current = true;
        console.log("[AnamAudio] Initializing Anam...");
        const success = await anamAvatar.initializeAvatar(hiddenVideoRef.current);
        if (!success) {
          console.error("[AnamAudio] Failed to initialize");
          avatarInitializedRef.current = false;
        }
      }
    } catch (err) {
      console.error("[AnamAudio] Failed to start:", err);
    }
  };

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

      if (!response.ok) throw new Error("Failed to get hint");

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

  const handleEnd = () => {
    if (transcript.length > 0) {
      setShowEndConfirm(true);
    } else {
      anamAvatar.stopAvatar();
      router.back();
    }
  };

  const confirmEnd = async () => {
    await anamAvatar.stopAvatar();

    sessionStorage.setItem(
      "lastSession",
      JSON.stringify({
        questionId: question.id,
        transcript: transcriptRef.current,
        duration,
      })
    );

    router.push(`/assessment/${question.id}`);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isLoading = anamAvatar.isConnecting || (!anamAvatar.isInitialized && !anamAvatar.error && avatarInitializedRef.current);

  return (
    <div className="flex flex-col h-full">
      {/* Hidden video element for Anam (audio still plays) */}
      <video
        ref={hiddenVideoRef}
        autoPlay
        playsInline
        className="hidden"
        muted={false}
      />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          {isSessionStarted && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm text-white/60">Recording</span>
            </div>
          )}
          {anamAvatar.isTalking && (
            <div className="flex items-center gap-2">
              <span className="text-[#d4af37]">🔊</span>
              <span className="text-sm text-white/60">AI Speaking</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-mono text-[#d4af37]">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Audio Visualization Area */}
      {isSessionStarted && (
        <div className="flex items-center justify-center py-8 border-b border-white/10">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-[#d4af37] rounded-full transition-all duration-150 ${
                  anamAvatar.isTalking
                    ? "animate-pulse"
                    : ""
                }`}
                style={{
                  height: anamAvatar.isTalking
                    ? `${20 + Math.random() * 30}px`
                    : "8px",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transcript Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {!isSessionStarted && !isLoading && (
          <div className="text-center text-white/50 py-12">
            <p>Click &quot;Start Interview&quot; to begin your practice session.</p>
            <p className="text-sm mt-2">Make sure your microphone is ready.</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-white/60 py-12">
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
      {anamAvatar.error && (
        <div className="mx-6 mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {anamAvatar.error}
        </div>
      )}

      {/* Controls */}
      <div className="p-6 border-t border-white/10">
        <div className="flex justify-center gap-4">
          {!isSessionStarted && !isLoading ? (
            <button
              onClick={startSession}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
            >
              <MicIcon />
              Start Interview
            </button>
          ) : isSessionStarted ? (
            <>
              <button
                onClick={handleGetHint}
                disabled={isLoadingHint || hintCount >= 3}
                className="flex items-center gap-2 px-6 py-4 bg-[#1a2d47] text-white rounded-full font-medium hover:bg-[#243a5a] transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingHint ? (
                  <LoadingSpinner />
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
          ) : null}
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a2d47] rounded-xl p-6 max-w-md mx-4 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">
              End Interview?
            </h3>
            <p className="text-white/60 mb-6">
              Your session will be saved and you&apos;ll receive an AI assessment of your performance.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 bg-[#0f172a] text-white rounded-lg hover:bg-[#152238] transition-colors border border-white/10"
              >
                Continue
              </button>
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all font-medium"
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
            ? "bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a]"
            : "bg-[#1a2d47] text-white border border-white/10"
        }`}
      >
        <div className={`text-xs mb-1 ${isUser ? "text-[#0f172a]/60" : "text-white/50"}`}>
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

function HintIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
