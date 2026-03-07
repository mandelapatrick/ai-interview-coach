"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  DataPacket_Kind,
} from "livekit-client";

export interface UseLiveKitSessionOptions {
  systemPrompt: string;
  userStream: MediaStream;
  onAvatarStartTalking?: () => void;
  onAvatarStopTalking?: () => void;
  onAvatarTranscription?: (text: string) => void;
  onUserTranscription?: (text: string) => void;
  onStreamReady?: () => void;
  onError?: (error: string) => void;
}

export function useLiveKitSession(options: UseLiveKitSessionOptions) {
  const {
    systemPrompt,
    userStream,
    onAvatarStartTalking,
    onAvatarStopTalking,
    onAvatarTranscription,
    onUserTranscription,
    onStreamReady,
    onError,
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const isTalkingRef = useRef(false);
  const streamReadyFiredRef = useRef(false);
  const agentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (agentTimeoutRef.current) {
        clearTimeout(agentTimeoutRef.current);
        agentTimeoutRef.current = null;
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      streamReadyFiredRef.current = false;
    };
  }, []);

  const initializeSession = useCallback(
    async (videoElement: HTMLVideoElement): Promise<boolean> => {
      try {
        setIsConnecting(true);
        setError(null);
        videoElementRef.current = videoElement;

        // Step 1: Get token from our API
        console.log("[LiveKit] Fetching token...");
        const tokenRes = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemPrompt }),
        });

        if (!tokenRes.ok) {
          const errorData = await tokenRes.json();
          throw new Error(errorData.error || "Failed to get LiveKit token");
        }

        const { token, url } = await tokenRes.json();

        // Step 2: Create and connect room
        console.log("[LiveKit] Connecting to room...");
        const room = new Room();
        roomRef.current = room;

        // Step 3: Set up event listeners before connecting
        streamReadyFiredRef.current = false;

        // Log participant connect/disconnect for debugging
        room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
          console.log(`[LiveKit] Participant connected: ${participant.identity}`);
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
          console.log(`[LiveKit] Participant disconnected: ${participant.identity}`);
        });

        // Handle remote tracks (agent audio + Anam video)
        room.on(
          RoomEvent.TrackSubscribed,
          (
            track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant
          ) => {
            console.log(
              `[LiveKit] Track subscribed: ${track.kind} from ${participant.identity}`
            );

            // Fire onStreamReady on first track subscription (agent is active)
            if (!streamReadyFiredRef.current) {
              streamReadyFiredRef.current = true;
              if (agentTimeoutRef.current) {
                clearTimeout(agentTimeoutRef.current);
                agentTimeoutRef.current = null;
              }
              onStreamReady?.();
            }

            if (track.kind === Track.Kind.Video) {
              // Anam avatar video — attach to the video element
              const mediaStream = new MediaStream([
                track.mediaStreamTrack,
              ]);
              if (videoElementRef.current) {
                // Preserve any existing audio tracks on the element
                const existingSrc = videoElementRef.current
                  .srcObject as MediaStream | null;
                if (existingSrc) {
                  existingSrc.addTrack(track.mediaStreamTrack);
                } else {
                  videoElementRef.current.srcObject = mediaStream;
                }
                videoElementRef.current.play().catch(console.error);
              }
            } else if (track.kind === Track.Kind.Audio) {
              // Agent TTS audio — attach to video element or play separately
              if (videoElementRef.current) {
                const existingSrc = videoElementRef.current
                  .srcObject as MediaStream | null;
                if (existingSrc) {
                  existingSrc.addTrack(track.mediaStreamTrack);
                } else {
                  videoElementRef.current.srcObject = new MediaStream([
                    track.mediaStreamTrack,
                  ]);
                }
              } else {
                // Fallback: create an audio element
                const audioEl = document.createElement("audio");
                audioEl.srcObject = new MediaStream([
                  track.mediaStreamTrack,
                ]);
                audioEl.autoplay = true;
                document.body.appendChild(audioEl);
              }
            }
          }
        );

        room.on(
          RoomEvent.TrackUnsubscribed,
          (track: RemoteTrack) => {
            console.log(`[LiveKit] Track unsubscribed: ${track.kind}`);
          }
        );

        // Handle agent speaking state via active speaker changes
        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const agentSpeaking = speakers.some(
            (p) => !p.isLocal && p.isSpeaking
          );
          if (agentSpeaking && !isTalkingRef.current) {
            isTalkingRef.current = true;
            setIsTalking(true);
            onAvatarStartTalking?.();
          } else if (!agentSpeaking && isTalkingRef.current) {
            isTalkingRef.current = false;
            setIsTalking(false);
            onAvatarStopTalking?.();
          }
        });

        // Handle transcription via data messages from agent
        room.on(
          RoomEvent.DataReceived,
          (
            payload: Uint8Array,
            participant?: RemoteParticipant,
            kind?: DataPacket_Kind
          ) => {
            try {
              const message = JSON.parse(
                new TextDecoder().decode(payload)
              );
              if (message.type === "transcription") {
                if (message.role === "agent" || message.role === "assistant") {
                  onAvatarTranscription?.(message.text);
                } else if (message.role === "user") {
                  onUserTranscription?.(message.text);
                }
              }
            } catch {
              // Not a JSON message, ignore
            }
          }
        );

        // Handle built-in LiveKit transcription events
        room.on(
          RoomEvent.TranscriptionReceived,
          (segments, participant) => {
            const text = segments
              .map((s: { text: string }) => s.text)
              .join(" ");
            if (participant?.isLocal) {
              onUserTranscription?.(text);
            } else {
              onAvatarTranscription?.(text);
            }
          }
        );

        room.on(RoomEvent.Disconnected, () => {
          console.log("[LiveKit] Disconnected from room");
          setIsInitialized(false);
        });

        // Step 4: Connect to room
        await room.connect(url, token);
        console.log("[LiveKit] Connected to room:", room.name);

        // Log any already-connected participants
        console.log(`[LiveKit] Remote participants: ${room.remoteParticipants.size}`);
        for (const [, p] of room.remoteParticipants) {
          console.log(`[LiveKit] Already in room: ${p.identity}`);
        }

        // Step 5: Publish user's microphone
        // Use setMicrophoneEnabled so the track source is correctly set to
        // Track.Source.Microphone — the agent's STT only subscribes to mic-source tracks.
        if (userStream) {
          const audioTrack = userStream.getAudioTracks()[0];
          const deviceId = audioTrack?.getSettings().deviceId;
          // Stop the lobby's audio track — setMicrophoneEnabled will create its own
          audioTrack?.stop();
          await room.localParticipant.setMicrophoneEnabled(true, {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
          });
          console.log("[LiveKit] Microphone enabled and published");
        } else {
          await room.localParticipant.setMicrophoneEnabled(true);
          console.log("[LiveKit] Microphone enabled (default device)");
        }

        // Timeout if agent never publishes tracks
        agentTimeoutRef.current = setTimeout(() => {
          if (!streamReadyFiredRef.current) {
            const msg = "Agent did not connect within 30s — ensure the Python agent is running";
            console.error(`[LiveKit] ${msg}`);
            setError(msg);
            onError?.(msg);
          }
        }, 30000);

        setIsInitialized(true);
        setIsConnecting(false);
        return true;
      } catch (err) {
        console.error("[LiveKit] Initialization error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to initialize LiveKit session";
        setError(errorMessage);
        onError?.(errorMessage);
        setIsConnecting(false);
        return false;
      }
    },
    [
      systemPrompt,
      userStream,
      onAvatarStartTalking,
      onAvatarStopTalking,
      onAvatarTranscription,
      onUserTranscription,
      onStreamReady,
      onError,
    ]
  );

  const interrupt = useCallback(() => {
    isTalkingRef.current = false;
    setIsTalking(false);
    onAvatarStopTalking?.();
    console.log("[LiveKit] Avatar interrupted");
  }, [onAvatarStopTalking]);

  const stopSession = useCallback(async () => {
    if (!roomRef.current) return;

    try {
      console.log("[LiveKit] Stopping session");
      await roomRef.current.disconnect();
      roomRef.current = null;
      setIsInitialized(false);
      isTalkingRef.current = false;
      setIsTalking(false);
    } catch (err) {
      console.error("[LiveKit] Failed to stop session:", err);
    }
  }, []);

  return {
    isInitialized,
    isConnecting,
    isTalking,
    error,
    initializeSession,
    interrupt,
    stopSession,
  };
}
