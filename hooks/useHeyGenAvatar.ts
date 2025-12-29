"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  LiveAvatarSession,
  SessionEvent,
  SessionState,
  AgentEventsEnum,
} from "@heygen/liveavatar-web-sdk";

export interface UseHeyGenAvatarOptions {
  onAvatarStartTalking?: () => void;
  onAvatarStopTalking?: () => void;
  onStreamReady?: () => void;
  onUserTranscription?: (text: string) => void;
  onAvatarTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useHeyGenAvatar(options: UseHeyGenAvatarOptions = {}) {
  const {
    onAvatarStartTalking,
    onAvatarStopTalking,
    onStreamReady,
    onUserTranscription,
    onAvatarTranscription,
    onError,
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const audioBufferRef = useRef<string[]>([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        console.log("[HeyGen] Cleaning up session on unmount");
        sessionRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const initializeAvatar = useCallback(
    async (videoElement: HTMLVideoElement) => {
      try {
        setIsConnecting(true);
        setError(null);
        videoElementRef.current = videoElement;

        // Step 1: Get session token from our API
        console.log("[HeyGen] Fetching session token...");
        const tokenRes = await fetch("/api/heygen/token", { method: "POST" });
        if (!tokenRes.ok) {
          const errorData = await tokenRes.json();
          throw new Error(errorData.error || "Failed to get LiveAvatar token");
        }
        const { sessionToken, sessionId: sid } = await tokenRes.json();

        if (!sessionToken) {
          throw new Error("No session token received from LiveAvatar");
        }

        console.log("[HeyGen] Token received:", { sessionId: sid });
        setSessionId(sid);

        // Step 2: Create the session
        console.log("[HeyGen] Creating LiveAvatarSession...");
        const session = new LiveAvatarSession(sessionToken, {
          voiceChat: true,
        });
        sessionRef.current = session;

        // Step 3: Set up event listeners
        session.on(SessionEvent.SESSION_STATE_CHANGED, (state) => {
          console.log("[HeyGen] State changed:", state);
          if (state === SessionState.CONNECTED) {
            console.log("[HeyGen] Session connected successfully");
            setIsInitialized(true);
            setIsConnecting(false);
          } else if (state === SessionState.DISCONNECTED) {
            console.log("[HeyGen] Session disconnected");
            setIsInitialized(false);
          }
        });

        session.on(SessionEvent.SESSION_STREAM_READY, () => {
          console.log("[HeyGen] Stream ready, attaching to video element");
          try {
            // WORKAROUND: The SDK's attach() calls LiveKit's track.attach() twice
            // (once for video, once for audio), but each call OVERWRITES srcObject
            // with a new MediaStream containing only that track.
            // Result: The audio attach overwrites the video, leaving only audio.
            //
            // Fix: Intercept srcObject setter to combine both tracks into one stream.

            let videoTrack: MediaStreamTrack | null = null;
            const originalDescriptor = Object.getOwnPropertyDescriptor(
              HTMLMediaElement.prototype,
              'srcObject'
            );

            if (originalDescriptor) {
              // Temporarily override srcObject setter to capture and combine tracks
              Object.defineProperty(videoElement, 'srcObject', {
                set(stream: MediaStream | null) {
                  if (stream) {
                    const vTracks = stream.getVideoTracks();
                    const aTracks = stream.getAudioTracks();

                    console.log("[HeyGen] srcObject being set with tracks - video:", vTracks.length, "audio:", aTracks.length);

                    if (vTracks.length > 0) {
                      // First call (video track) - save it
                      videoTrack = vTracks[0];
                      console.log("[HeyGen] Captured video track:", videoTrack.label);
                    }

                    if (aTracks.length > 0 && vTracks.length === 0 && videoTrack) {
                      // Second call (audio only) - add the saved video track
                      console.log("[HeyGen] Adding captured video track to audio stream");
                      stream.addTrack(videoTrack);
                    }
                  }
                  originalDescriptor.set?.call(this, stream);
                },
                get() {
                  return originalDescriptor.get?.call(this);
                },
                configurable: true,
              });
            }

            // Call attach - our interceptor will combine the tracks
            session.attach(videoElement);

            // Restore original srcObject behavior
            if (originalDescriptor) {
              Object.defineProperty(videoElement, 'srcObject', originalDescriptor);
            }

            // Verify the fix worked
            if (videoElement.srcObject instanceof MediaStream) {
              const stream = videoElement.srcObject;
              console.log("[HeyGen] Final stream tracks - video:", stream.getVideoTracks().length, "audio:", stream.getAudioTracks().length);
            }

            console.log("[HeyGen] Stream attached successfully");

            // Ensure video plays (start muted to bypass autoplay policy, then unmute)
            videoElement.muted = true;
            videoElement.play()
              .then(() => {
                console.log("[HeyGen] Video playing, unmuting");
                videoElement.muted = false;
              })
              .catch((e) => {
                console.log("[HeyGen] Video autoplay blocked:", e.message);
              });

            onStreamReady?.();
          } catch (attachErr) {
            console.error("[HeyGen] Failed to attach stream:", attachErr);
          }
        });

        session.on(SessionEvent.SESSION_DISCONNECTED, (reason) => {
          console.log("[HeyGen] Disconnected:", reason);
          setIsInitialized(false);
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
          console.log("[HeyGen] Avatar started speaking");
          setIsTalking(true);
          onAvatarStartTalking?.();
        });

        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          console.log("[HeyGen] Avatar stopped speaking");
          setIsTalking(false);
          onAvatarStopTalking?.();
        });

        session.on(AgentEventsEnum.USER_TRANSCRIPTION, (event) => {
          console.log("[HeyGen] User transcription:", event.text);
          onUserTranscription?.(event.text);
        });

        session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, (event) => {
          console.log("[HeyGen] Avatar transcription:", event.text);
          onAvatarTranscription?.(event.text);
        });

        // Step 4: Start the session
        console.log("[HeyGen] Starting session...");
        await session.start();
        console.log("[HeyGen] Session start() completed");

        return true;
      } catch (err) {
        console.error("[HeyGen] Initialization error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize avatar";
        setError(errorMessage);
        onError?.(errorMessage);
        setIsConnecting(false);
        return false;
      }
    },
    [
      onAvatarStartTalking,
      onAvatarStopTalking,
      onStreamReady,
      onUserTranscription,
      onAvatarTranscription,
      onError,
    ]
  );

  // Buffer audio chunks from X.AI (Custom Mode streaming)
  const sendAudio = useCallback(
    (audioBase64: string) => {
      if (!sessionRef.current || !isInitialized) {
        return;
      }

      // Buffer audio chunks - they'll be sent together when endSpeaking is called
      audioBufferRef.current.push(audioBase64);
    },
    [isInitialized]
  );

  // Send all buffered audio to avatar and signal end of speaking
  const endSpeaking = useCallback(() => {
    if (!sessionRef.current || !isInitialized) return;

    try {
      // Concatenate all buffered audio chunks
      const fullAudio = audioBufferRef.current.join("");
      audioBufferRef.current = []; // Clear buffer

      if (fullAudio.length === 0) {
        console.log("[HeyGen] No audio to send");
        return;
      }

      console.log("[HeyGen] Sending buffered audio, total length:", fullAudio.length);

      // Use repeatAudio which handles chunking and sends agent.speak_end automatically
      sessionRef.current.repeatAudio(fullAudio);
    } catch (err) {
      console.error("[HeyGen] Failed to send audio:", err);
      audioBufferRef.current = []; // Clear buffer on error
    }
  }, [isInitialized]);

  // Interrupt avatar speaking
  const interrupt = useCallback(() => {
    if (!sessionRef.current) return;

    try {
      console.log("[HeyGen] Interrupting avatar");
      sessionRef.current.interrupt();
    } catch (err) {
      console.error("[HeyGen] Failed to interrupt avatar:", err);
    }
  }, []);

  // Start listening mode
  const startListening = useCallback(() => {
    if (!sessionRef.current || !isInitialized) return;

    try {
      console.log("[HeyGen] Starting listening mode");
      sessionRef.current.startListening();
    } catch (err) {
      console.error("[HeyGen] Failed to start listening:", err);
    }
  }, [isInitialized]);

  // Stop listening mode
  const stopListening = useCallback(() => {
    if (!sessionRef.current) return;

    try {
      console.log("[HeyGen] Stopping listening mode");
      sessionRef.current.stopListening();
    } catch (err) {
      console.error("[HeyGen] Failed to stop listening:", err);
    }
  }, []);

  // Stop and cleanup the avatar session
  const stopAvatar = useCallback(async () => {
    if (!sessionRef.current) return;

    try {
      console.log("[HeyGen] Stopping avatar session");
      await sessionRef.current.stop();
      sessionRef.current = null;
      setIsInitialized(false);
      setSessionId(null);
    } catch (err) {
      console.error("[HeyGen] Failed to stop avatar:", err);
    }
  }, []);

  return {
    isInitialized,
    isConnecting,
    isTalking,
    error,
    sessionId,
    initializeAvatar,
    sendAudio,
    endSpeaking,
    interrupt,
    startListening,
    stopListening,
    stopAvatar,
  };
}
