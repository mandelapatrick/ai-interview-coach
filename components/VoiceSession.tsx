"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLiveKitSession } from "@/hooks/useLiveKitSession";
import { Question, TranscriptEntry } from "@/types";
import { getSystemPrompt } from "@/data/prompts";
import HintModal from "./HintModal";

interface VoiceSessionProps {
  question: Question;
  maxDurationSeconds?: number | null;
}

// Pulsing Circle Animation Component
function PulsingCircle({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer pulse rings - visible when speaking */}
      {isActive && isSpeaking && (
        <>
          <div
            className="absolute w-full h-full rounded-full bg-[#c1f879]/20 animate-pulse-ring"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute w-[85%] h-[85%] rounded-full bg-[#c1f879]/25 animate-pulse-ring"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="absolute w-[70%] h-[70%] rounded-full bg-[#c1f879]/30 animate-pulse-ring"
            style={{ animationDelay: "0.4s" }}
          />
        </>
      )}

      {/* Listening rings - subtle expanding rings when not speaking */}
      {isActive && !isSpeaking && (
        <>
          <div
            className="absolute w-full h-full rounded-full border-2 border-[#c1f879]/20 animate-ping-slow"
          />
          <div
            className="absolute w-[120%] h-[120%] rounded-full border border-[#c1f879]/10 animate-ping-slow"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}

      {/* Main circle with gradient */}
      <div
        className={`relative w-20 h-20 rounded-full bg-[#c1f879] transition-all duration-300 ${
          isActive
            ? isSpeaking
              ? "scale-110 shadow-[0_0_40px_rgba(193,248,121,0.6)]"
              : "scale-100 shadow-[0_0_25px_rgba(193,248,121,0.4)]"
            : "scale-90 opacity-60 shadow-[0_0_15px_rgba(193,248,121,0.2)]"
        }`}
      >
        {/* Inner highlight */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/30 to-transparent" />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-3 h-3 rounded-full bg-white/40 transition-all duration-300 ${
            isSpeaking ? "scale-125" : "scale-100"
          }`} />
        </div>
      </div>

      {/* Glow effect */}
      <div
        className={`absolute w-24 h-24 rounded-full blur-xl transition-opacity duration-500 ${
          isActive ? "opacity-50" : "opacity-0"
        }`}
        style={{ background: "radial-gradient(circle, #c1f879 0%, transparent 70%)" }}
      />
    </div>
  );
}


// Circular Control Button Component
function ControlButton({
  icon,
  onClick,
  disabled = false,
  active = false,
  variant = "default",
  tooltip
}: {
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: "default" | "danger" | "primary";
  tooltip?: string;
}) {
  const variants = {
    default: `bg-gray-100 hover:bg-gray-200 text-gray-600 ${active ? "bg-[#c1f879]/10 text-[#4d7c0f]" : ""}`,
    danger: "bg-red-500/90 hover:bg-red-500 text-white",
    primary: "bg-[#c1f879] text-[#1b1b1b] hover:shadow-lg hover:shadow-[#c1f879]/25",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${variants[variant]} ${
        disabled ? "opacity-40 cursor-not-allowed" : "hover:scale-105 active:scale-95"
      } shadow-lg`}
    >
      {icon}
    </button>
  );
}

export default function VoiceSession({ question, maxDurationSeconds }: VoiceSessionProps) {
  const router = useRouter();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const userStreamRef = useRef<MediaStream | null>(null);
  const dummyVideoRef = useRef<HTMLVideoElement | null>(null);

  const systemPrompt = getSystemPrompt(question);

  // Keep transcript ref in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const livekitSession = useLiveKitSession({
    systemPrompt,
    userStream: userStreamRef.current!,
    avatarMode: "none",
    onAvatarStartTalking: () => {},
    onAvatarStopTalking: () => {},
    onAvatarTranscription: (text) => {
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, text }];
        }
        return [...prev, { role: "assistant", text, timestamp: new Date() }];
      });
    },
    onUserTranscription: (text) => {
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "user") {
          return [...prev.slice(0, -1), { ...last, text }];
        }
        return [...prev, { role: "user", text, timestamp: new Date() }];
      });
    },
    onStreamReady: () => {
      console.log("[VoiceSession] LiveKit stream ready");
    },
    onError: (err) => console.error("[VoiceSession] LiveKit error:", err),
  });

  // Timer for session duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Auto-end session when duration limit reached
  useEffect(() => {
    if (!maxDurationSeconds || !isRecording) return;

    if (duration >= maxDurationSeconds) {
      setShowTimeWarning(false);
      endSession();
    } else if (duration >= maxDurationSeconds - 60 && !showTimeWarning) {
      setShowTimeWarning(true);
    }
  }, [duration, maxDurationSeconds, isRecording, showTimeWarning]);

  const startSession = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      userStreamRef.current = stream;

      // Create a dummy video element for LiveKit (audio-only mode)
      const dummyVideo = document.createElement("video");
      dummyVideoRef.current = dummyVideo;

      setIsRecording(true);
      setTranscript([]);
      setDuration(0);

      // Ref is already populated synchronously above, initialize immediately
      const success = await livekitSession.initializeSession(dummyVideo);
      if (!success) {
        setIsRecording(false);
      }
    } catch (err) {
      console.error("[VoiceSession] Failed to start:", err);
    }
  }, [livekitSession]);

  const endSession = useCallback(() => {
    // Stop LiveKit
    livekitSession.stopSession();

    // Stop media stream
    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach((track) => track.stop());
      userStreamRef.current = null;
    }

    setIsRecording(false);

    // Store transcript for assessment page
    const finalTranscript = transcriptRef.current;
    if (finalTranscript.length > 0) {
      sessionStorage.setItem(
        "lastSession",
        JSON.stringify({
          questionId: question.id,
          transcript: finalTranscript,
          duration,
        })
      );
      router.push(`/assessment/${question.id}`);
    }
  }, [livekitSession, question.id, duration, router]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (userStreamRef.current) {
      userStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
  }, [isMuted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const error = livekitSession.error;
  const isSpeaking = livekitSession.isTalking;


  return (
    <div className="flex flex-col h-full bg-white">
      {/* Time limit warning banner */}
      {showTimeWarning && maxDurationSeconds && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-sm text-amber-800 font-medium">
            Less than 1 minute remaining in your free session
          </p>
        </div>
      )}

      {/* Top Bar - Timer and Recording */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs text-red-400 font-medium">REC</span>
            </div>
          )}
        </div>
        <div className="text-xl font-mono text-[#4d7c0f] tabular-nums">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center py-12 px-6">
        <PulsingCircle isActive={isRecording} isSpeaking={isSpeaking} />
      </div>

      {/* Control Buttons */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 py-6">
        {!isRecording ? (
          <button
            onClick={startSession}
            className="flex items-center gap-3 px-8 py-4 bg-[#c1f879] text-[#1b1b1b] rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-[#c1f879]/25 transition-all hover:scale-105 active:scale-95"
          >
            <MicIcon />
            Start Interview
          </button>
        ) : (
          <>
            <ControlButton
              icon={<TranscriptIcon />}
              onClick={() => setShowTranscript(!showTranscript)}
              active={showTranscript}
              tooltip="Toggle transcript"
            />
            <ControlButton
              icon={isMuted ? <MicOffIcon /> : <MicIcon />}
              onClick={toggleMute}
              active={!isMuted}
              tooltip={isMuted ? "Unmute" : "Mute"}
            />
            <ControlButton
              icon={isLoadingHint ? <LoadingSpinner /> : <HintIcon />}
              onClick={handleGetHint}
              disabled={isLoadingHint || hintCount >= 3}
              tooltip={hintCount >= 3 ? "No hints left" : `Get hint (${3 - hintCount} left)`}
            />
            <ControlButton
              icon={<EndCallIcon />}
              onClick={handleEnd}
              variant="danger"
              tooltip="End interview"
            />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Transcript Area */}
      {showTranscript && (
        <div className="flex-1 mx-4 mb-4 rounded-2xl bg-[#faf8f5] overflow-hidden flex flex-col shadow-xl">
          <div className="px-4 py-3 border-b border-black/5">
            <h3 className="text-sm font-medium text-gray-600">Transcript</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!isRecording && (
              <div className="text-center text-gray-600 py-8">
                <p>Your conversation will appear here.</p>
              </div>
            )}

            {isRecording && transcript.length === 0 && (
              <div className="text-center text-gray-600 py-8">
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  <span>Connecting...</span>
                </div>
              </div>
            )}

            {transcript.map((entry, index) => (
              <TranscriptBubble key={index} entry={entry} />
            ))}
          </div>
        </div>
      )}

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 border border-gray-200 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              End Interview?
            </h3>
            <p className="text-gray-500 mb-6">
              Your session will be saved and you&apos;ll receive an AI assessment of your performance.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2 bg-[#c1f879] text-[#1b1b1b] rounded-lg hover:shadow-lg hover:shadow-[#c1f879]/25 transition-all font-medium"
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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-[#c1f879] text-[#1b1b1b]"
            : "bg-white text-gray-800 border border-gray-100"
        }`}
      >
        <div className={`text-xs mb-1 font-medium ${isUser ? "text-white/70" : "text-gray-600"}`}>
          {isUser ? "You" : "AI Interviewer"}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.text}</p>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
    </svg>
  );
}

function TranscriptIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function EndCallIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
    </svg>
  );
}

function HintIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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
