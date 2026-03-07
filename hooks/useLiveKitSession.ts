"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  LocalAudioTrack,
} from "livekit-client";

export interface UseLiveKitSessionOptions {
  systemPrompt: string;
  userStream: MediaStream;
  avatarMode?: "anam" | "heygen" | "none";
  onAgentAudioData?: (base64Audio: string) => void;
  onAgentSpeakingDone?: () => void;
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
    avatarMode = "anam",
    onAgentAudioData,
    onAgentSpeakingDone,
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
  const agentSegmentsRef = useRef(new Map<string, string>());
  const userSegmentsRef = useRef(new Map<string, string>());
  const agentAudioTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioBridgeCtxRef = useRef<AudioContext | null>(null);

  // Refs to avoid stale closures in TrackSubscribed/ActiveSpeakersChanged handlers
  const onAgentAudioDataRef = useRef(onAgentAudioData);
  const onAgentSpeakingDoneRef = useRef(onAgentSpeakingDone);
  useEffect(() => { onAgentAudioDataRef.current = onAgentAudioData; }, [onAgentAudioData]);
  useEffect(() => { onAgentSpeakingDoneRef.current = onAgentSpeakingDone; }, [onAgentSpeakingDone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (agentTimeoutRef.current) {
        clearTimeout(agentTimeoutRef.current);
        agentTimeoutRef.current = null;
      }
      if (audioBridgeCtxRef.current) {
        audioBridgeCtxRef.current.close().catch(() => {});
        audioBridgeCtxRef.current = null;
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
          body: JSON.stringify({ systemPrompt, avatarMode }),
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
              // Skip video track attachment for heygen mode (HeyGen provides its own video)
              if (avatarMode === "heygen") {
                console.log("[LiveKit] Skipping video track (heygen mode)");
                return;
              }
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
              // Agent TTS audio — store ref for recording capture
              agentAudioTrackRef.current = track.mediaStreamTrack;

              if (avatarMode === "heygen" && onAgentAudioDataRef.current) {
                // Audio bridge: convert MediaStreamTrack -> PCM16 -> base64 for HeyGen
                console.log("[LiveKit] Setting up audio bridge for HeyGen");
                const bridgeCtx = new AudioContext({ sampleRate: 24000 });
                audioBridgeCtxRef.current = bridgeCtx;

                const source = bridgeCtx.createMediaStreamSource(
                  new MediaStream([track.mediaStreamTrack])
                );
                // ScriptProcessorNode for PCM extraction
                const processor = bridgeCtx.createScriptProcessor(4096, 1, 1);

                processor.onaudioprocess = (e) => {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcm16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
                  }
                  const uint8 = new Uint8Array(pcm16.buffer);
                  let binaryString = '';
                  for (let i = 0; i < uint8.length; i++) {
                    binaryString += String.fromCharCode(uint8[i]);
                  }
                  onAgentAudioDataRef.current?.(binaryString);
                };

                source.connect(processor);
                // Connect to destination to keep the processor alive (silent output)
                processor.connect(bridgeCtx.destination);
                // Do NOT call track.attach() — HeyGen handles playback
              } else {
                // Default: let LiveKit SDK attach its own <audio> element for playback
                track.attach();
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
            // Signal to HeyGen that agent finished speaking
            onAgentSpeakingDoneRef.current?.();
          }
        });

        // Handle built-in LiveKit transcription events with segment deduplication
        room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
          const isLocal = participant?.isLocal;
          const segMap = isLocal ? userSegmentsRef.current : agentSegmentsRef.current;
          const callback = isLocal ? onUserTranscription : onAvatarTranscription;

          for (const seg of segments) {
            segMap.set(seg.id, seg.text);
          }

          const fullText = Array.from(segMap.values()).join(" ");
          if (fullText.trim()) {
            callback?.(fullText);
          }

          const allFinal = segments.every((s: any) => s.final);
          if (allFinal && segments.length > 0) {
            segMap.clear();
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log("[LiveKit] Disconnected from room");
          setIsInitialized(false);
        });

        // Step 4: Connect to room
        await room.connect(url, token);
        console.log("[LiveKit] Connected to room:", room.name);

        // Unlock audio playback on mobile browsers
        await room.startAudio();
        console.log("[LiveKit] Audio playback unlocked");

        // Log any already-connected participants
        console.log(`[LiveKit] Remote participants: ${room.remoteParticipants.size}`);
        for (const [, p] of room.remoteParticipants) {
          console.log(`[LiveKit] Already in room: ${p.identity}`);
        }

        // Step 5: Publish user's microphone
        // Publish the existing lobby mic track directly to preserve the user gesture chain
        // and avoid re-requesting getUserMedia (which can fail when gesture context expires on mobile).
        if (userStream) {
          const audioTrack = userStream.getAudioTracks()[0];
          if (audioTrack) {
            const localTrack = new LocalAudioTrack(audioTrack, undefined, false);
            await room.localParticipant.publishTrack(localTrack, {
              source: Track.Source.Microphone,
            });
            console.log("[LiveKit] Published existing microphone track");
          } else {
            await room.localParticipant.setMicrophoneEnabled(true);
            console.log("[LiveKit] Microphone enabled (no existing track)");
          }
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
      avatarMode,
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
      if (audioBridgeCtxRef.current) {
        await audioBridgeCtxRef.current.close().catch(() => {});
        audioBridgeCtxRef.current = null;
      }
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
    agentAudioTrackRef,
  };
}
