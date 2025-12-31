"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface TranscriptEntry {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface UseVoiceSessionOptions {
  systemPrompt: string;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
  onSessionEnd?: (transcript: TranscriptEntry[]) => void;
}

export function useVoiceSession(options: UseVoiceSessionOptions) {
  const { systemPrompt, onTranscriptUpdate, onSessionEnd } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  // Keep transcript ref in sync
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

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

  // Notify transcript updates
  useEffect(() => {
    onTranscriptUpdate?.(transcript);
  }, [transcript, onTranscriptUpdate]);

  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    isPlayingRef.current = true;
    setIsSpeaking(true);

    const audioContext = audioContextRef.current;
    if (!audioContext) {
      console.error("No audio context for playback");
      isPlayingRef.current = false;
      setIsSpeaking(false);
      return;
    }

    // Ensure audio context is running
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    console.log("Playing audio queue, items:", audioQueueRef.current.length);

    while (audioQueueRef.current.length > 0) {
      const audioData = audioQueueRef.current.shift()!;

      try {
        const audioBuffer = audioContext.createBuffer(1, audioData.length, 24000);
        audioBuffer.getChannelData(0).set(audioData);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        await new Promise<void>((resolve) => {
          source.onended = () => resolve();
          source.start();
        });
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }

    isPlayingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      setTranscript([]);
      setDuration(0);

      // Get connection details from API
      const tokenRes = await fetch("/api/voice/token", { method: "POST" });
      if (!tokenRes.ok) {
        throw new Error("Failed to get voice session token");
      }
      const { url, apiKey } = await tokenRes.json();

      if (!apiKey) {
        throw new Error("API key not configured");
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Set up audio context for playback
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Resume audio context (required after user interaction)
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      console.log("AudioContext state:", audioContextRef.current.state);

      // Connect WebSocket with auth header
      const ws = new WebSocket(url, ["realtime", `openai-insecure-api-key.${apiKey}`]);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        // Log system prompt being sent to X.AI
        console.log("[X.AI] System Prompt:", systemPrompt);

        // Send session configuration
        ws.send(
          JSON.stringify({
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: systemPrompt,
              voice: "sage",
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: {
                model: "whisper-1",
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.75,          // Higher = less sensitive to background noise
                prefix_padding_ms: 500,   // Audio context before speech
                silence_duration_ms: 10000, // Wait 10s of silence before turn ends (allows natural thinking pauses like real interviews)
              },
            },
          })
        );

        // Start audio capture after small delay
        setTimeout(() => startAudioCapture(stream, ws), 500);

        // Trigger AI to start the interview
        setTimeout(() => {
          // Add a conversation item to prompt the AI to introduce itself
          ws.send(
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

          // Request the AI to respond
          ws.send(
            JSON.stringify({
              type: "response.create",
            })
          );
        }, 1000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
        setError("Connection error. Please try again.");
      };

      ws.onclose = (e) => {
        console.log("WebSocket closed:", e.code, e.reason);
        setIsConnected(false);
        setIsRecording(false);
      };
    } catch (err) {
      console.error("Failed to start session:", err);
      setError(err instanceof Error ? err.message : "Failed to start session");
    }
  }, [systemPrompt, playAudioQueue]);

  const startAudioCapture = useCallback(
    async (stream: MediaStream, ws: WebSocket) => {
      const audioContext = audioContextRef.current;
      if (!audioContext) return;

      try {
        // Use ScriptProcessor for broader compatibility
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            const base64Audio = btoa(
              String.fromCharCode(...new Uint8Array(pcm16.buffer))
            );
            ws.send(
              JSON.stringify({
                type: "input_audio_buffer.append",
                audio: base64Audio,
              })
            );
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        setIsRecording(true);
      } catch (err) {
        console.error("Audio capture error:", err);
        setError("Failed to capture audio");
      }
    },
    []
  );

  const handleWebSocketMessage = useCallback(
    (data: { type: string; delta?: string; transcript?: string; error?: { message: string } }) => {
      // Log all messages for debugging
      console.log("WS Message:", data.type, data);

      switch (data.type) {
        case "session.created":
          console.log("Session created successfully");
          break;

        case "session.updated":
          console.log("Session updated successfully");
          break;

        case "response.created":
          console.log("Response started");
          break;

        case "response.done":
          console.log("Response completed");
          break;

        case "response.audio.delta":
        case "response.output_audio.delta":
          if (data.delta) {
            try {
              console.log("Received audio chunk, length:", data.delta.length);
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768;
              }
              audioQueueRef.current.push(float32);
              playAudioQueue();
            } catch (e) {
              console.error("Audio decode error:", e);
            }
          }
          break;

        case "response.audio_transcript.delta":
        case "response.output_audio_transcript.delta":
          if (data.delta) {
            setTranscript((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + data.delta },
                ];
              }
              return [
                ...prev,
                { role: "assistant", text: data.delta!, timestamp: new Date() },
              ];
            });
          }
          break;

        case "conversation.item.input_audio_transcription.completed":
          if (data.transcript) {
            setTranscript((prev) => [
              ...prev,
              { role: "user", text: data.transcript!, timestamp: new Date() },
            ]);
          }
          break;

        case "error":
          console.error("API error:", data);
          setError(data.error?.message || "An error occurred");
          break;

        default:
          // Log other message types for debugging
          if (data.type.includes("error")) {
            console.error("Error message:", data);
          }
      }
    },
    [playAudioQueue]
  );

  const endSession = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);

    // Callback with final transcript
    onSessionEnd?.(transcriptRef.current);
  }, [onSessionEnd]);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    isConnected,
    isRecording,
    isSpeaking,
    transcript,
    error,
    duration,
    formatDuration,
    startSession,
    endSession,
  };
}
