"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHeyGenAvatar } from "@/hooks/useHeyGenAvatar";
import { Question } from "@/types";
import { getSystemPrompt } from "@/data/prompts";

interface VideoSessionProps {
  question: Question;
  userStream: MediaStream;
  onBack: () => void;
}

interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function VideoSession({ question, userStream, onBack }: VideoSessionProps) {
  const router = useRouter();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(true);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [duration, setDuration] = useState(0);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const pendingTextRef = useRef<string>("");
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  const systemPrompt = getSystemPrompt(
    question.type,
    question.title,
    question.description
  );

  const {
    isInitialized: isAvatarInitialized,
    isConnecting: isAvatarConnecting,
    isTalking: isAvatarTalking,
    error: avatarError,
    initializeAvatar,
    sendAudio: avatarSendAudio,
    endSpeaking: avatarEndSpeaking,
    interrupt: avatarInterrupt,
    stopAvatar,
  } = useHeyGenAvatar({
    onAvatarTranscription: (text) => {
      console.log("Avatar said:", text);
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, text: last.text + " " + text }];
        }
        return [...prev, { role: "assistant", text, timestamp: new Date() }];
      });
    },
    onUserTranscription: (text) => {
      console.log("User said (LiveAvatar):", text);
    },
    onStreamReady: () => {
      console.log("Avatar stream is ready!");
    },
    onError: (err) => console.error("Avatar error:", err),
  });

  // Keep transcript ref in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Timer
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

  // Set user video stream
  useEffect(() => {
    if (userVideoRef.current && userStream) {
      userVideoRef.current.srcObject = userStream;
    }
  }, [userStream]);

  // Track if avatar has been initialized
  const avatarInitializedRef = useRef(false);
  const xaiConnectedRef = useRef(false);

  // Step 1: Initialize avatar when component mounts
  useEffect(() => {
    if (avatarInitializedRef.current) return;

    const initAvatar = async () => {
      if (avatarVideoRef.current && !avatarInitializedRef.current) {
        avatarInitializedRef.current = true;
        console.log("[VideoSession] Initializing avatar...");

        const success = await initializeAvatar(avatarVideoRef.current);
        if (!success) {
          console.error("[VideoSession] Failed to initialize avatar");
          avatarInitializedRef.current = false;
        }
      }
    };

    // Small delay to ensure video element is ready
    const timer = setTimeout(initAvatar, 100);
    return () => clearTimeout(timer);
  }, [initializeAvatar]);

  // Step 2: Connect to X.AI only after avatar is initialized
  useEffect(() => {
    if (!isAvatarInitialized || xaiConnectedRef.current) return;

    const connectToXAI = async () => {
      xaiConnectedRef.current = true;
      console.log("[VideoSession] Avatar ready, connecting to X.AI...");

      try {
        setIsSessionStarted(true);

        // Get X.AI token
        const tokenRes = await fetch("/api/voice/token", { method: "POST" });
        if (!tokenRes.ok) throw new Error("Failed to get voice token");
        const { url, apiKey } = await tokenRes.json();

        if (!apiKey) throw new Error("API key not configured");

        // Set up audio context
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        if (audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        // Connect WebSocket to X.AI
        console.log("[VideoSession] Connecting to X.AI WebSocket...");
        const ws = new WebSocket(url, ["realtime", `openai-insecure-api-key.${apiKey}`]);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[VideoSession] X.AI WebSocket connected");
          console.log("[X.AI] System Prompt:", systemPrompt);
          ws.send(
            JSON.stringify({
              type: "session.update",
              session: {
                modalities: ["text", "audio"],
                instructions: systemPrompt,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: { model: "whisper-1" },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.75,          // Higher = less sensitive to background noise
                  prefix_padding_ms: 500,   // Audio context before speech
                  silence_duration_ms: 2500, // Wait 2.5s of silence before turn ends (allows longer thinking pauses)
                },
              },
            })
          );

          // Start audio capture after a brief delay
          setTimeout(() => {
            if (wsRef.current && audioContextRef.current) {
              console.log("[VideoSession] Starting audio capture from microphone");
              const source = audioContextRef.current.createMediaStreamSource(userStream);
              const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

              processor.onaudioprocess = (e) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcm16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                  }
                  const base64Audio = btoa(
                    String.fromCharCode(...new Uint8Array(pcm16.buffer))
                  );
                  wsRef.current.send(
                    JSON.stringify({
                      type: "input_audio_buffer.append",
                      audio: base64Audio,
                    })
                  );
                }
              };

              source.connect(processor);
              processor.connect(audioContextRef.current.destination);
            }
          }, 500);

          // Trigger AI to start the interview
          setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              console.log("[VideoSession] Triggering AI to start interview");
              wsRef.current.send(
                JSON.stringify({
                  type: "conversation.item.create",
                  item: {
                    type: "message",
                    role: "user",
                    content: [
                      {
                        type: "input_text",
                        text: "Hello, I'm ready to start the case interview. Please introduce yourself and present the case.",
                      },
                    ],
                  },
                })
              );
              wsRef.current.send(JSON.stringify({ type: "response.create" }));
            }
          }, 1000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Log non-audio messages for debugging (filter high-frequency events)
            if (!["response.audio.delta", "response.output_audio.delta", "input_audio_buffer.speech_started", "input_audio_buffer.speech_stopped"].includes(data.type)) {
              console.log("[X.AI]", data.type);
            }

            switch (data.type) {
              // Pipe audio to avatar (handle both event type formats)
              case "response.audio.delta":
              case "response.output_audio.delta":
                if (data.delta) {
                  avatarSendAudio(data.delta);
                }
                break;

              case "response.audio.done":
              case "response.output_audio.done":
                console.log("[X.AI] Audio stream complete");
                avatarEndSpeaking();
                break;

              // Update transcript with AI speech (handle both event type formats)
              case "response.audio_transcript.delta":
              case "response.output_audio_transcript.delta":
                if (data.delta) {
                  pendingTextRef.current += data.delta;
                  setTranscript((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, text: last.text + data.delta }];
                    }
                    return [...prev, { role: "assistant", text: data.delta, timestamp: new Date() }];
                  });
                }
                break;

              case "response.audio_transcript.done":
              case "response.output_audio_transcript.done":
                pendingTextRef.current = "";
                break;

              case "response.text.delta":
              case "response.output_text.delta":
              case "response.content_part.delta":
                const textDelta = data.delta?.text || data.delta?.content || data.delta;
                if (textDelta && typeof textDelta === "string") {
                  pendingTextRef.current += textDelta;
                  setTranscript((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, text: last.text + textDelta }];
                    }
                    return [...prev, { role: "assistant", text: textDelta, timestamp: new Date() }];
                  });
                }
                break;

              case "response.content_part.added":
                if (data.part?.text) {
                  pendingTextRef.current += data.part.text;
                  setTranscript((prev) => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === "assistant") {
                      return [...prev.slice(0, -1), { ...last, text: last.text + data.part.text }];
                    }
                    return [...prev, { role: "assistant", text: data.part.text, timestamp: new Date() }];
                  });
                }
                break;

              case "response.done":
                pendingTextRef.current = "";
                break;

              // User speech transcription
              case "conversation.item.input_audio_transcription.completed":
                if (data.transcript) {
                  avatarInterrupt();
                  setTranscript((prev) => [
                    ...prev,
                    { role: "user", text: data.transcript!, timestamp: new Date() },
                  ]);
                  wsRef.current?.send(JSON.stringify({ type: "response.create" }));
                }
                break;
            }
          } catch (e) {
            console.error("[VideoSession] Failed to parse X.AI message:", e);
          }
        };

        ws.onerror = (e) => console.error("[VideoSession] X.AI WebSocket error:", e);
        ws.onclose = () => console.log("[VideoSession] X.AI WebSocket closed");
      } catch (err) {
        console.error("[VideoSession] Failed to connect to X.AI:", err);
        xaiConnectedRef.current = false;
      }
    };

    connectToXAI();
  }, [isAvatarInitialized, systemPrompt, userStream, avatarSendAudio, avatarEndSpeaking, avatarInterrupt]);

  const cleanup = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    await stopAvatar();
  }, [stopAvatar]);

  const handleEnd = () => {
    if (transcript.length > 0) {
      setShowEndConfirm(true);
    } else {
      cleanup();
      onBack();
    }
  };

  const confirmEnd = async () => {
    // Store transcript for assessment
    sessionStorage.setItem(
      "interviewTranscript",
      JSON.stringify({
        questionId: question.id,
        transcript: transcriptRef.current,
        duration,
      })
    );

    await cleanup();
    router.push(`/assessment/${question.id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isLoading = isAvatarConnecting || (!isAvatarInitialized && !avatarError);

  return (
    <div className="flex flex-col h-full min-h-[600px] bg-[#0f172a]">
      {/* Video Area */}
      <div className="flex-1 relative min-h-[400px]">
        {/* Avatar Video (Main) */}
        <div className="absolute inset-0 bg-[#0a1122]">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a1122]">
              <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white/60">Connecting to AI interviewer...</p>
            </div>
          )}
          {/* Video element for avatar stream */}
          <video
            ref={avatarVideoRef}
            autoPlay
            playsInline
            muted={false}
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#0a1122' }}
            onLoadedMetadata={(e) => {
              const video = e.target as HTMLVideoElement;
              console.log("Avatar video: loadedmetadata", {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                clientWidth: video.clientWidth,
                clientHeight: video.clientHeight,
              });
            }}
            onCanPlay={() => console.log("Avatar video: canplay")}
            onPlay={(e) => {
              const video = e.target as HTMLVideoElement;
              console.log("Avatar video: playing", {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState,
                srcObject: video.srcObject,
              });
            }}
            onError={(e) => console.error("Avatar video error:", e)}
          />

          {/* Speaking Indicator */}
          {isAvatarTalking && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-sm">Speaking</span>
            </div>
          )}

          {/* User Video (PiP) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-[#1a2744] rounded-lg overflow-hidden shadow-xl border border-white/10">
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/50 rounded-full text-xs text-white z-10">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Live
            </div>
            <video
              ref={userVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Transcript & Controls */}
      <div className="bg-[#0f172a] border-t border-white/10">
        {/* Collapsible Transcript */}
        <div
          className={`transition-all duration-300 ${
            isTranscriptExpanded ? "max-h-64" : "max-h-12"
          } overflow-hidden`}
        >
          <button
            onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between text-white/60 hover:text-white/80 transition-colors"
          >
            <span className="text-sm">
              Transcript ({transcript.length} messages)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#d4af37] font-mono text-sm">
                {formatTime(duration)}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isTranscriptExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </div>
          </button>

          {isTranscriptExpanded && (
            <div className="px-4 pb-4 max-h-48 overflow-y-auto space-y-3">
              {transcript.map((entry, i) => (
                <div
                  key={i}
                  className={`flex ${
                    entry.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      entry.role === "user"
                        ? "bg-[#d4af37] text-[#0f172a]"
                        : "bg-[#1e293b] text-white/90"
                    }`}
                  >
                    <p className="text-sm">{entry.text}</p>
                  </div>
                </div>
              ))}
              {transcript.length === 0 && (
                <p className="text-white/40 text-sm text-center py-4">
                  Conversation will appear here...
                </p>
              )}
            </div>
          )}
        </div>

        {/* End Button */}
        <div className="p-4 flex justify-center">
          <button
            onClick={handleEnd}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
              />
            </svg>
            End Interview
          </button>
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1e293b] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">
              End Interview?
            </h3>
            <p className="text-white/60 mb-6">
              Your session will be saved and you&apos;ll receive an AI
              assessment of your performance.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Continue
              </button>
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-xl font-medium transition-colors"
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
