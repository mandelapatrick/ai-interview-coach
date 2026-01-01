"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient, AnamEvent } from "@anam-ai/js-sdk";
import type { AnamClient } from "@anam-ai/js-sdk";

export interface UseAnamAvatarOptions {
  onAvatarStartTalking?: () => void;
  onAvatarStopTalking?: () => void;
  onStreamReady?: () => void;
  onUserTranscription?: (text: string) => void;
  onAvatarTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useAnamAvatar(options: UseAnamAvatarOptions = {}) {
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

  const clientRef = useRef<AnamClient | null>(null);
  const videoElementIdRef = useRef<string | null>(null);
  const talkStreamRef = useRef<ReturnType<AnamClient["createTalkMessageStream"]> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current) {
        console.log("[Anam] Cleaning up client on unmount");
        clientRef.current.stopStreaming().catch(console.error);
      }
    };
  }, []);

  const initializeAvatar = useCallback(
    async (videoElement: HTMLVideoElement) => {
      try {
        setIsConnecting(true);
        setError(null);

        // Ensure the video element has an ID for Anam SDK
        if (!videoElement.id) {
          videoElement.id = `anam-video-${Date.now()}`;
        }
        videoElementIdRef.current = videoElement.id;

        // Step 1: Get session token from our API
        console.log("[Anam] Fetching session token...");
        const tokenRes = await fetch("/api/anam/token", { method: "POST" });
        if (!tokenRes.ok) {
          const errorData = await tokenRes.json();
          throw new Error(errorData.error || "Failed to get Anam token");
        }
        const { sessionToken } = await tokenRes.json();

        if (!sessionToken) {
          throw new Error("No session token received from Anam");
        }

        console.log("[Anam] Token received, creating client...");

        // Step 2: Create the Anam client
        const client = createClient(sessionToken);
        clientRef.current = client;

        // Step 3: Set up event listeners
        client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
          console.log("[Anam] Connection established");
        });

        client.addListener(AnamEvent.SESSION_READY, () => {
          console.log("[Anam] Session ready");
          setIsInitialized(true);
          setIsConnecting(false);
          onStreamReady?.();
        });

        client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
          console.log("[Anam] Connection closed");
          setIsInitialized(false);
        });

        client.addListener(AnamEvent.VIDEO_PLAY_STARTED, () => {
          console.log("[Anam] Video started playing");
        });

        client.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (event: { role: string; content: string }) => {
          if (event.role === "persona") {
            // Avatar is speaking
            if (!isTalking) {
              setIsTalking(true);
              onAvatarStartTalking?.();
            }
            onAvatarTranscription?.(event.content);
          } else if (event.role === "user") {
            // User is speaking
            onUserTranscription?.(event.content);
          }
        });

        client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, () => {
          // A conversation turn ended
          if (isTalking) {
            setIsTalking(false);
            onAvatarStopTalking?.();
          }
        });

        client.addListener(AnamEvent.TALK_STREAM_INTERRUPTED, () => {
          console.log("[Anam] Talk stream interrupted by user");
          setIsTalking(false);
          onAvatarStopTalking?.();
        });

        // Step 4: Start streaming to the video element
        console.log("[Anam] Starting stream to video element:", videoElement.id);
        await client.streamToVideoElement(videoElement.id);
        console.log("[Anam] Stream started successfully");

        return true;
      } catch (err) {
        console.error("[Anam] Initialization error:", err);
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
      isTalking,
    ]
  );

  // Send text to make the avatar speak
  const talk = useCallback(
    async (text: string) => {
      if (!clientRef.current || !isInitialized) {
        console.warn("[Anam] Cannot talk - not initialized");
        return;
      }

      try {
        console.log("[Anam] Sending text to avatar:", text.substring(0, 50) + "...");
        setIsTalking(true);
        onAvatarStartTalking?.();
        await clientRef.current.talk(text);
      } catch (err) {
        console.error("[Anam] Failed to send talk command:", err);
        setIsTalking(false);
        onAvatarStopTalking?.();
      }
    },
    [isInitialized, onAvatarStartTalking, onAvatarStopTalking]
  );

  // Create a streaming talk session for real-time text streaming
  const createTalkStream = useCallback(() => {
    if (!clientRef.current || !isInitialized) {
      console.warn("[Anam] Cannot create talk stream - not initialized");
      return null;
    }

    try {
      talkStreamRef.current = clientRef.current.createTalkMessageStream();
      setIsTalking(true);
      onAvatarStartTalking?.();
      console.log("[Anam] Talk stream created");
      return talkStreamRef.current;
    } catch (err) {
      console.error("[Anam] Failed to create talk stream:", err);
      return null;
    }
  }, [isInitialized, onAvatarStartTalking]);

  // Stream a text chunk to the avatar
  const streamTextChunk = useCallback(
    (chunk: string, isLast: boolean = false) => {
      if (!talkStreamRef.current || !talkStreamRef.current.isActive()) {
        // Create a new stream if needed
        const stream = createTalkStream();
        if (!stream) return;
        talkStreamRef.current = stream;
      }

      try {
        talkStreamRef.current.streamMessageChunk(chunk, isLast);
        if (isLast) {
          console.log("[Anam] Sent final chunk, ending stream");
        }
      } catch (err) {
        console.error("[Anam] Failed to stream text chunk:", err);
      }
    },
    [createTalkStream]
  );

  // End the current talk stream
  const endTalkStream = useCallback(() => {
    if (talkStreamRef.current && talkStreamRef.current.isActive()) {
      try {
        talkStreamRef.current.endMessage();
        console.log("[Anam] Talk stream ended");
      } catch (err) {
        console.error("[Anam] Failed to end talk stream:", err);
      }
    }
    talkStreamRef.current = null;
    setIsTalking(false);
    onAvatarStopTalking?.();
  }, [onAvatarStopTalking]);

  // Interrupt the avatar (stop it from speaking)
  const interrupt = useCallback(() => {
    if (talkStreamRef.current && talkStreamRef.current.isActive()) {
      endTalkStream();
    }
    setIsTalking(false);
    onAvatarStopTalking?.();
    console.log("[Anam] Avatar interrupted");
  }, [endTalkStream, onAvatarStopTalking]);

  // Stop and cleanup the avatar session
  const stopAvatar = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      console.log("[Anam] Stopping avatar session");
      await clientRef.current.stopStreaming();
      clientRef.current = null;
      talkStreamRef.current = null;
      setIsInitialized(false);
      setIsTalking(false);
    } catch (err) {
      console.error("[Anam] Failed to stop avatar:", err);
    }
  }, []);

  return {
    isInitialized,
    isConnecting,
    isTalking,
    error,
    initializeAvatar,
    talk,
    createTalkStream,
    streamTextChunk,
    endTalkStream,
    interrupt,
    stopAvatar,
  };
}
