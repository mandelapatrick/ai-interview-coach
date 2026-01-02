"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient, AnamEvent } from "@anam-ai/js-sdk";
import type { AnamClient } from "@anam-ai/js-sdk";

export interface UseAnamAvatarOptions {
  systemPrompt: string;
  onAvatarStartTalking?: () => void;
  onAvatarStopTalking?: () => void;
  onStreamReady?: () => void;
  onUserTranscription?: (text: string) => void;
  onAvatarTranscription?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useAnamAvatar(options: UseAnamAvatarOptions) {
  const {
    systemPrompt,
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

        // Step 1: Get session token from our API with system prompt
        console.log("[Anam] Fetching session token with system prompt...");
        const tokenRes = await fetch("/api/anam/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemPrompt }),
        });
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
      systemPrompt,
      onAvatarStartTalking,
      onAvatarStopTalking,
      onStreamReady,
      onUserTranscription,
      onAvatarTranscription,
      onError,
      isTalking,
    ]
  );

  // Interrupt the avatar (stop it from speaking)
  const interrupt = useCallback(() => {
    setIsTalking(false);
    onAvatarStopTalking?.();
    console.log("[Anam] Avatar interrupted");
  }, [onAvatarStopTalking]);

  // Stop and cleanup the avatar session
  const stopAvatar = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      console.log("[Anam] Stopping avatar session");
      await clientRef.current.stopStreaming();
      clientRef.current = null;
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
    interrupt,
    stopAvatar,
  };
}
