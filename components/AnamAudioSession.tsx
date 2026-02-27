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

// Pulsing Circle Animation Component
function PulsingCircle({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer pulse rings - visible when speaking */}
      {isActive && isSpeaking && (
        <>
          <div
            className="absolute w-full h-full rounded-full bg-[#d4af37]/20 animate-pulse-ring"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute w-[85%] h-[85%] rounded-full bg-[#d4af37]/25 animate-pulse-ring"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="absolute w-[70%] h-[70%] rounded-full bg-[#d4af37]/30 animate-pulse-ring"
            style={{ animationDelay: "0.4s" }}
          />
        </>
      )}

      {/* Listening rings - subtle expanding rings when not speaking */}
      {isActive && !isSpeaking && (
        <>
          <div
            className="absolute w-full h-full rounded-full border-2 border-[#d4af37]/20 animate-ping-slow"
          />
          <div
            className="absolute w-[120%] h-[120%] rounded-full border border-[#d4af37]/10 animate-ping-slow"
            style={{ animationDelay: "0.5s" }}
          />
        </>
      )}

      {/* Main circle with gradient */}
      <div
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-[#f4d03f] via-[#d4af37] to-[#c9a227] transition-all duration-300 ${
          isActive
            ? isSpeaking
              ? "scale-110 shadow-[0_0_40px_rgba(212,175,55,0.6)]"
              : "scale-100 shadow-[0_0_25px_rgba(212,175,55,0.4)]"
            : "scale-90 opacity-60 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
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
        style={{ background: "radial-gradient(circle, #d4af37 0%, transparent 70%)" }}
      />
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: "idle" | "connecting" | "listening" | "speaking" }) {
  const configs = {
    idle: { text: "Ready", bg: "bg-gray-100", textColor: "text-gray-600" },
    connecting: { text: "Connecting...", bg: "bg-[#d4af37]/20", textColor: "text-[#d4af37]" },
    listening: { text: "Listening", bg: "bg-[#d4af37]/20", textColor: "text-[#d4af37]" },
    speaking: { text: "Speaking", bg: "bg-[#d4af37]", textColor: "text-white" },
  };

  const config = configs[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${config.bg} ${config.textColor} text-sm font-medium transition-all duration-300`}
    >
      {status === "connecting" && (
        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
      )}
      {status === "listening" && (
        <div className="relative w-2 h-2">
          <div className="absolute inset-0 rounded-full bg-current animate-ping" />
          <div className="relative w-2 h-2 rounded-full bg-current" />
        </div>
      )}
      {status === "speaking" && (
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-2 bg-current rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s`, animationDuration: "0.6s" }}
            />
          ))}
        </div>
      )}
      {config.text}
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
    default: `bg-gray-100 hover:bg-gray-200 text-gray-600 ${active ? "bg-[#d4af37]/10 text-[#d4af37]" : ""}`,
    danger: "bg-red-500/90 hover:bg-red-500 text-white",
    primary: "bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white hover:shadow-lg hover:shadow-[#d4af37]/25",
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

  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const isLoading = anamAvatar.isConnecting || (!anamAvatar.isInitialized && !anamAvatar.error && avatarInitializedRef.current);

  // Determine current status
  const getStatus = (): "idle" | "connecting" | "listening" | "speaking" => {
    if (isLoading) return "connecting";
    if (!isSessionStarted) return "idle";
    if (anamAvatar.isTalking) return "speaking";
    return "listening";
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Hidden video element for Anam (audio still plays) */}
      <video
        ref={hiddenVideoRef}
        autoPlay
        playsInline
        className="hidden"
        muted={false}
      />

      {/* Top Bar - Timer and Recording */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {isSessionStarted && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-xs text-red-400 font-medium">REC</span>
            </div>
          )}
        </div>
        <div className="text-xl font-mono text-[#d4af37] tabular-nums">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center py-12 px-6">
        <PulsingCircle isActive={isSessionStarted} isSpeaking={anamAvatar.isTalking} />
        <div className="mt-6">
          <StatusBadge status={getStatus()} />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 py-6">
        {!isSessionStarted && !isLoading ? (
          <button
            onClick={startSession}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all hover:scale-105 active:scale-95"
          >
            <MicIcon />
            Start Interview
          </button>
        ) : isSessionStarted ? (
          <>
            <ControlButton
              icon={<TranscriptIcon />}
              onClick={() => setShowTranscript(!showTranscript)}
              active={showTranscript}
              tooltip="Toggle transcript"
            />
            <ControlButton
              icon={isMuted ? <MicOffIcon /> : <MicIcon />}
              onClick={() => {
                if (isMuted) {
                  anamAvatar.unmuteInputAudio();
                } else {
                  anamAvatar.muteInputAudio();
                }
                setIsMuted(!isMuted);
              }}
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
        ) : null}
      </div>

      {/* Error Display */}
      {anamAvatar.error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {anamAvatar.error}
        </div>
      )}

      {/* Transcript Area */}
      {showTranscript && (
        <div className="flex-1 mx-4 mb-4 rounded-2xl bg-[#faf8f5] overflow-hidden flex flex-col shadow-xl">
          <div className="px-4 py-3 border-b border-black/5">
            <h3 className="text-sm font-medium text-gray-600">Transcript</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!isSessionStarted && !isLoading && (
              <div className="text-center text-gray-600 py-8">
                <p>Your conversation will appear here.</p>
              </div>
            )}

            {isLoading && (
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
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white"
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );
}

function VideoOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
