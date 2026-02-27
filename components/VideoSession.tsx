"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHeyGenAvatar } from "@/hooks/useHeyGenAvatar";
import { useAnamAvatar } from "@/hooks/useAnamAvatar";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";
import { setPendingRecording } from "@/lib/recordingTransfer";
import { Question } from "@/types";
import { getSystemPrompt } from "@/data/prompts";
import { getCompanyBySlug } from "@/data/companies";
import type { AvatarProvider } from "./VideoLobby";
import HintModal from "./HintModal";

interface VideoSessionProps {
  question: Question;
  userStream: MediaStream;
  avatarProvider: AvatarProvider;
  onBack: () => void;
}

interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export default function VideoSession({ question, userStream, avatarProvider, onBack }: VideoSessionProps) {
  const router = useRouter();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [duration, setDuration] = useState(0);
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(() => userStream?.getVideoTracks()[0]?.enabled ?? true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => userStream?.getAudioTracks()[0]?.enabled ?? true);
  const [showExhibit, setShowExhibit] = useState<number | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);

  const avatarVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const pendingTextRef = useRef<string>("");
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  // Video recording refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Video recorder hook
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: recordingError,
  } = useVideoRecorder();

  const company = getCompanyBySlug(question.companySlug);

  const systemPrompt = getSystemPrompt(question);

  // HeyGen avatar hook
  const heygenAvatar = useHeyGenAvatar({
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
      console.log("HeyGen stream is ready!");
    },
    onError: (err) => console.error("HeyGen error:", err),
  });

  // Anam avatar hook - Anam handles full conversation with its own LLM
  const anamAvatar = useAnamAvatar({
    systemPrompt,
    onAvatarStartTalking: () => {
      console.log("Anam avatar started talking");
    },
    onAvatarStopTalking: () => {
      console.log("Anam avatar stopped talking");
    },
    onAvatarTranscription: (text) => {
      console.log("Anam avatar said:", text);
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
        return [...prev, { role: "assistant", text, timestamp: new Date() }];
      });
    },
    onUserTranscription: (text) => {
      console.log("User said (Anam):", text);
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "user") {
          return [...prev.slice(0, -1), { ...last, text: last.text + " " + text }];
        }
        return [...prev, { role: "user", text, timestamp: new Date() }];
      });
    },
    onStreamReady: () => {
      console.log("Anam stream is ready - conversation handled by Anam");
      setIsSessionStarted(true);
    },
    onError: (err) => console.error("Anam error:", err),
  });

  // Unified avatar interface
  const avatar = avatarProvider === "heygen" ? {
    isInitialized: heygenAvatar.isInitialized,
    isConnecting: heygenAvatar.isConnecting,
    isTalking: heygenAvatar.isTalking,
    error: heygenAvatar.error,
    initializeAvatar: heygenAvatar.initializeAvatar,
    sendAudio: heygenAvatar.sendAudio,
    endSpeaking: heygenAvatar.endSpeaking,
    interrupt: heygenAvatar.interrupt,
    stopAvatar: heygenAvatar.stopAvatar,
  } : {
    isInitialized: anamAvatar.isInitialized,
    isConnecting: anamAvatar.isConnecting,
    isTalking: anamAvatar.isTalking,
    error: anamAvatar.error,
    initializeAvatar: anamAvatar.initializeAvatar,
    // HeyGen-specific methods (unused for Anam - Anam handles conversation natively)
    sendAudio: null as ((audio: string) => void) | null,
    endSpeaking: null as (() => void) | null,
    interrupt: anamAvatar.interrupt,
    stopAvatar: anamAvatar.stopAvatar,
  };

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

  // Canvas compositor for video recording
  useEffect(() => {
    if (!isSessionStarted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (720p for good quality/size balance)
    canvas.width = 1280;
    canvas.height = 720;

    const drawFrame = () => {
      // Draw avatar video (main view)
      if (avatarVideoRef.current && avatarVideoRef.current.readyState >= 2) {
        ctx.drawImage(avatarVideoRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw placeholder background if avatar not ready
        ctx.fillStyle = "#0a1122";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw user video (picture-in-picture, bottom-right)
      if (userVideoRef.current && userVideoRef.current.readyState >= 2 && isVideoEnabled) {
        const pipWidth = 240;
        const pipHeight = 180;
        const pipX = canvas.width - pipWidth - 20;
        const pipY = canvas.height - pipHeight - 20;

        // Draw border/background for PiP
        ctx.fillStyle = "#1a2744";
        ctx.fillRect(pipX - 4, pipY - 4, pipWidth + 8, pipHeight + 8);

        // Draw user video
        ctx.drawImage(userVideoRef.current, pipX, pipY, pipWidth, pipHeight);
      }

      // Draw recording indicator
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(30, 30, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "14px sans-serif";
      ctx.fillText("REC", 45, 35);

      // Draw timer
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(canvas.width - 80, 15, 65, 30);
      ctx.fillStyle = "white";
      ctx.font = "16px monospace";
      ctx.fillText(timeStr, canvas.width - 70, 37);

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    // Start the render loop
    drawFrame();

    // Start recording after a short delay to ensure streams are ready
    const recordingTimer = setTimeout(() => {
      if (canvasRef.current && !isRecording) {
        // Capture canvas stream
        const canvasStream = canvasRef.current.captureStream(30);

        try {
          // Create audio context for mixing user mic + avatar audio
          const recordingAudioContext = new AudioContext();
          const destination = recordingAudioContext.createMediaStreamDestination();

          // Add user microphone audio
          const userAudioSource = recordingAudioContext.createMediaStreamSource(userStream);
          userAudioSource.connect(destination);

          // Add avatar video audio (AI interviewer voice)
          if (avatarVideoRef.current) {
            let avatarAudioAdded = false;

            // Method 1: Try to get audio from the avatar's srcObject MediaStream
            if (avatarVideoRef.current.srcObject) {
              const avatarStream = avatarVideoRef.current.srcObject as MediaStream;
              const avatarAudioTracks = avatarStream.getAudioTracks();
              if (avatarAudioTracks.length > 0) {
                const avatarAudioStream = new MediaStream(avatarAudioTracks);
                const avatarAudioSource = recordingAudioContext.createMediaStreamSource(avatarAudioStream);
                avatarAudioSource.connect(destination);
                avatarAudioAdded = true;
                console.log("[VideoSession] Added avatar audio from srcObject");
              }
            }

            // Method 2: Capture audio directly from the video element
            if (!avatarAudioAdded) {
              try {
                const avatarElementSource = recordingAudioContext.createMediaElementSource(avatarVideoRef.current);
                avatarElementSource.connect(destination);
                // Also connect to speakers so user can still hear it
                avatarElementSource.connect(recordingAudioContext.destination);
                avatarAudioAdded = true;
                console.log("[VideoSession] Added avatar audio from media element");
              } catch (e) {
                console.log("[VideoSession] Could not capture avatar element audio:", e);
              }
            }

            if (!avatarAudioAdded) {
              console.log("[VideoSession] Warning: Could not capture avatar audio");
            }
          }

          // Add mixed audio track to canvas stream
          const mixedAudioTrack = destination.stream.getAudioTracks()[0];
          if (mixedAudioTrack) {
            canvasStream.addTrack(mixedAudioTrack);
          }
        } catch (audioErr) {
          console.error("[VideoSession] Failed to set up audio mixing:", audioErr);
          // Fallback: just add user audio
          const audioTracks = userStream.getAudioTracks();
          audioTracks.forEach((track) => {
            canvasStream.addTrack(track);
          });
        }

        startRecording(canvasStream);
        console.log("[VideoSession] Started composite recording");
      }
    }, 1000);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(recordingTimer);
    };
  }, [isSessionStarted, isVideoEnabled, duration, startRecording, isRecording, userStream]);

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
        console.log(`[VideoSession] Initializing ${avatarProvider} avatar...`);

        const success = await avatar.initializeAvatar(avatarVideoRef.current);
        if (!success) {
          console.error(`[VideoSession] Failed to initialize ${avatarProvider} avatar`);
          avatarInitializedRef.current = false;
        }
      }
    };

    // Small delay to ensure video element is ready
    const timer = setTimeout(initAvatar, 100);
    return () => clearTimeout(timer);
  }, [avatar.initializeAvatar, avatarProvider]);

  // Step 2: Connect to X.AI only after avatar is initialized (HeyGen only)
  // Anam handles conversation natively with its own LLM
  useEffect(() => {
    if (avatarProvider !== "heygen") return; // Anam handles conversation natively
    if (!avatar.isInitialized || xaiConnectedRef.current) return;

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
                  threshold: 0.75,
                  prefix_padding_ms: 500,
                  silence_duration_ms: 10000,
                  create_response: true,
                  interrupt_response: true,
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
              // Pipe audio to HeyGen avatar
              case "response.audio.delta":
              case "response.output_audio.delta":
                if (data.delta && avatar.sendAudio) {
                  avatar.sendAudio(data.delta);
                }
                break;

              case "response.audio.done":
              case "response.output_audio.done":
                console.log("[X.AI] Audio stream complete");
                if (avatar.endSpeaking) {
                  avatar.endSpeaking();
                }
                break;

              // Update transcript with AI speech
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
                  avatar.interrupt();
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
  }, [avatar.isInitialized, systemPrompt, userStream, avatar.sendAudio, avatar.endSpeaking, avatar.interrupt, avatarProvider]);

  const cleanup = useCallback(async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    await avatar.stopAvatar();
  }, [avatar.stopAvatar]);

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

  const handleEnd = () => {
    if (transcript.length > 0) {
      setShowEndConfirm(true);
    } else {
      cleanup();
      onBack();
    }
  };

  const confirmEnd = async () => {
    // Stop recording and store blob for transfer to assessment page
    if (isRecording) {
      try {
        const blob = await stopRecording();
        if (blob && blob.size > 0) {
          console.log("[VideoSession] Recording stopped, blob size:", blob.size);
          // Store blob for upload on assessment page
          setPendingRecording(blob);
        }
      } catch (err) {
        console.error("[VideoSession] Failed to stop recording:", err);
      }
    }

    // Store transcript for assessment (recording URL will be added by assessment page after upload)
    sessionStorage.setItem(
      "lastSession",
      JSON.stringify({
        questionId: question.id,
        transcript: transcriptRef.current,
        duration,
      })
    );

    await cleanup();
    // Navigate immediately - upload will happen in background on assessment page
    router.push(`/assessment/${question.id}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle video track
  const toggleVideo = () => {
    if (userStream) {
      const videoTrack = userStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio track
  const toggleAudio = () => {
    if (userStream) {
      const audioTrack = userStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        // For Anam provider, also mute/unmute via the Anam SDK since it
        // manages its own internal microphone capture independently of userStream
        if (avatarProvider === "anam") {
          if (!audioTrack.enabled) {
            anamAvatar.muteInputAudio();
          } else {
            anamAvatar.unmuteInputAudio();
          }
        }
      }
    }
  };

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const isLoading = avatar.isConnecting || (!avatar.isInitialized && !avatar.error);

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50">
      {/* Hidden canvas for video compositing/recording */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={1280}
        height={720}
      />

      {/* Main Video Area - Top on mobile, Left on desktop */}
      <div className="flex-1 relative min-h-0">
        {/* Avatar Video (Main) */}
        <div className="absolute inset-0 bg-gray-900 rounded-2xl overflow-hidden m-1 md:m-2">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900">
              <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white/60">
                Connecting to AI interviewer...
              </p>
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
              });
            }}
            onCanPlay={() => console.log("Avatar video: canplay")}
            onPlay={(e) => {
              const video = e.target as HTMLVideoElement;
              console.log("Avatar video: playing", {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
              });
            }}
            onError={(e) => console.error("Avatar video error:", e)}
          />

          {/* Mobile-only top bar: Timer + End Interview button */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between md:hidden z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">
              {avatar.isTalking && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
              <span className="text-white text-sm font-medium">Interviewer</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                {formatTime(duration)}
              </span>
              <button
                onClick={handleEnd}
                className="px-3 py-1.5 bg-[#d4af37] hover:bg-[#b8972e] text-white rounded-lg font-medium transition-colors text-sm"
              >
                End
              </button>
            </div>
          </div>

          {/* Interviewer Label - Top Left (desktop only) */}
          <div className="absolute top-4 left-4 hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">
            {avatar.isTalking && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
            <span className="text-white text-sm font-medium">Interviewer</span>
          </div>

          {/* User Video (PiP) - Bottom Right */}
          <div className="absolute bottom-2 right-2 md:bottom-6 md:right-6 w-28 h-20 md:w-56 md:h-40 bg-gray-800 rounded-xl overflow-hidden shadow-xl border-2 border-gray-600">
            {isVideoEnabled ? (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            )}

            {/* User Video Controls - Bottom */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={toggleAudio}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isAudioEnabled
                    ? "bg-white/20 hover:bg-white/30"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isAudioEnabled ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
              <button
                onClick={toggleVideo}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isVideoEnabled
                    ? "bg-white/20 hover:bg-white/30"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isVideoEnabled ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - hidden on mobile, full sidebar on desktop */}
      <div className="hidden md:flex flex-shrink-0 md:w-[360px] md:h-full md:max-h-[calc(100vh-170px)] bg-white flex-col border-l border-gray-200 overflow-hidden">
        {/* Header - Company & Timer */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {company?.name?.charAt(0) || "?"}
                </div>
              )}
              <div>
                <div className="text-sm text-gray-600">{company?.name}</div>
                <h2 className="font-semibold text-gray-900 text-sm leading-tight">{question.title}</h2>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-mono font-semibold text-gray-900">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 text-xs text-gray-600 line-clamp-2">
            {question.description}
          </p>
        </div>

        {/* Exhibits Section */}
        {question.additionalInfoImages && question.additionalInfoImages.length > 0 && (
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-3">Exhibits</h3>
            <div className="flex gap-2">
              {question.additionalInfoImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setShowExhibit(index)}
                  className="w-12 h-12 rounded-xl bg-[#d4af37]/10 hover:bg-[#d4af37]/20 flex items-center justify-center transition-colors"
                >
                  <svg className="w-6 h-6 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              ))}
            </div>
            <button
              onClick={handleGetHint}
              disabled={isLoadingHint || hintCount >= 3}
              className="mt-3 w-full py-2 text-sm text-gray-600 hover:text-gray-700 flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingHint ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              {isLoadingHint ? "Getting hint..." : hintCount >= 3 ? "No hints left" : `Get Hint${hintCount > 0 ? ` (${3 - hintCount} left)` : ""}`}
            </button>
          </div>
        )}

        {/* Hint Button (when no exhibits) */}
        {(!question.additionalInfoImages || question.additionalInfoImages.length === 0) && (
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <button
              onClick={handleGetHint}
              disabled={isLoadingHint || hintCount >= 3}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-700 flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingHint ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              {isLoadingHint ? "Getting hint..." : hintCount >= 3 ? "No hints left" : `Get Hint${hintCount > 0 ? ` (${3 - hintCount} left)` : ""}`}
            </button>
          </div>
        )}

        {/* Live Conversation */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Live Conversation</span>
            </div>
          </div>

          <div
            ref={transcriptContainerRef}
            className="flex-1 overflow-y-auto px-4 space-y-4 min-h-0"
          >
            {transcript.map((entry, i) => (
              <div key={i} className="text-sm">
                <span className={`text-xs font-medium ${entry.role === "assistant" ? "text-[#d4af37]" : "text-blue-600"}`}>
                  {entry.role === "assistant" ? "AI Interviewer" : "You"}
                </span>
                <p className="text-gray-700 mt-0.5 leading-relaxed">{entry.text}</p>
              </div>
            ))}
            {transcript.length === 0 && (
              <p className="text-gray-600 text-sm text-center py-8">
                Conversation will appear here...
              </p>
            )}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Recording in progress
            </div>
            <button
              onClick={handleEnd}
              className="px-5 py-2 bg-[#d4af37] hover:bg-[#b8972e] text-white rounded-lg font-medium transition-colors text-sm"
            >
              End Interview
            </button>
          </div>
        </div>
      </div>

      {/* Exhibit Modal */}
      {showExhibit !== null && question.additionalInfoImages && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setShowExhibit(null)}
        >
          <div className="bg-white rounded-2xl p-4 max-w-4xl max-h-[90vh] overflow-auto mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Exhibit {showExhibit + 1}</h3>
              <button
                onClick={() => setShowExhibit(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={question.additionalInfoImages[showExhibit]}
              alt={`Exhibit ${showExhibit + 1}`}
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              End Interview?
            </h3>
            <p className="text-gray-500 mb-6">
              Your session will be saved and you&apos;ll receive an AI
              assessment of your performance.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                Continue
              </button>
              <button
                onClick={confirmEnd}
                className="flex-1 px-4 py-2.5 bg-[#d4af37] hover:bg-[#b8972e] text-white rounded-xl font-medium transition-colors"
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
