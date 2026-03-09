"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
} from "livekit-client";

export interface TranscriptEntry {
  speaker: "interviewer" | "candidate";
  text: string;
  timestamp: Date;
}

export interface UseLiveKitLearnSessionOptions {
  interviewerPrompt: string;
  candidatePrompt: string;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
  onSpeakerChange?: (speaker: "interviewer" | "candidate" | null) => void;
  onError?: (error: string) => void;
  onSessionEnd?: () => void;
}

export interface UseLiveKitLearnSessionReturn {
  isInitialized: boolean;
  isConnecting: boolean;
  currentSpeaker: "interviewer" | "candidate" | null;
  isPaused: boolean;
  transcript: TranscriptEntry[];
  error: string | null;
  reconnectingAvatar: "interviewer" | "candidate" | null;
  initializeAvatars: (
    interviewerVideo: HTMLVideoElement,
    candidateVideo: HTMLVideoElement
  ) => Promise<boolean>;
  pause: () => void;
  resume: () => void;
  askCandidateQuestion: (question: string) => Promise<void>;
  stopAvatars: () => Promise<void>;
}

export function useLiveKitLearnSession(
  options: UseLiveKitLearnSessionOptions
): UseLiveKitLearnSessionReturn {
  const {
    interviewerPrompt,
    candidatePrompt,
    onTranscriptUpdate,
    onSpeakerChange,
    onError,
    onSessionEnd,
  } = options;

  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<
    "interviewer" | "candidate" | null
  >(null);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const interviewerVideoRef = useRef<HTMLVideoElement | null>(null);
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);
  const agentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const audioTracksRef = useRef<Map<string, RemoteTrack>>(new Map());

  // Track which participants map to which role
  // The agent publishes two avatar participants; we identify them by their identity/metadata
  const participantRoleMap = useRef<Map<string, "interviewer" | "candidate">>(new Map());

  // Segment deduplication maps per participant
  const segmentMaps = useRef<Map<string, Map<string, string>>>(new Map());

  // Refs for callbacks to avoid stale closures
  const onSpeakerChangeRef = useRef(onSpeakerChange);
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  const onErrorRef = useRef(onError);
  const onSessionEndRef = useRef(onSessionEnd);

  useEffect(() => { onSpeakerChangeRef.current = onSpeakerChange; }, [onSpeakerChange]);
  useEffect(() => { onTranscriptUpdateRef.current = onTranscriptUpdate; }, [onTranscriptUpdate]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { onSessionEndRef.current = onSessionEnd; }, [onSessionEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (agentTimeoutRef.current) {
        clearTimeout(agentTimeoutRef.current);
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  const addToTranscript = useCallback((entry: TranscriptEntry) => {
    transcriptRef.current = [...transcriptRef.current, entry];
    setTranscript(transcriptRef.current);
    onTranscriptUpdateRef.current?.(transcriptRef.current);
  }, []);

  const updateSpeaker = useCallback((speaker: "interviewer" | "candidate" | null) => {
    setCurrentSpeaker(speaker);
    onSpeakerChangeRef.current?.(speaker);

    // Mute/unmute video elements based on who is speaking
    if (interviewerVideoRef.current) {
      interviewerVideoRef.current.muted = speaker !== "interviewer";
    }
    if (candidateVideoRef.current) {
      candidateVideoRef.current.muted = speaker !== "candidate";
    }
  }, []);

  // Mute/unmute all remote audio tracks (for pause/resume)
  const setAllAudioMuted = useCallback((muted: boolean) => {
    audioTracksRef.current.forEach((track) => {
      for (const el of track.attachedElements) {
        el.muted = muted;
      }
    });
  }, []);

  // Send data message to agent
  const sendDataMessage = useCallback(async (payload: object) => {
    if (!roomRef.current) return;
    try {
      const data = new TextEncoder().encode(JSON.stringify(payload));
      await roomRef.current.localParticipant.publishData(data, { reliable: true });
    } catch (e) {
      console.error("[LearnLK] Failed to send data message:", e);
    }
  }, []);

  // Determine participant role from identity or metadata
  const getParticipantRole = useCallback((participant: RemoteParticipant): "interviewer" | "candidate" | null => {
    // Check cache first
    const cached = participantRoleMap.current.get(participant.identity);
    if (cached) return cached;

    // Try to determine from identity or metadata
    const identity = participant.identity.toLowerCase();
    const metadata = participant.metadata?.toLowerCase() || "";

    let role: "interviewer" | "candidate" | null = null;
    if (identity.includes("interviewer") || metadata.includes("interviewer")) {
      role = "interviewer";
    } else if (identity.includes("candidate") || metadata.includes("candidate")) {
      role = "candidate";
    }

    // If we can't determine from naming, assign based on order of appearance
    if (!role) {
      const existingRoles = new Set(participantRoleMap.current.values());
      if (!existingRoles.has("interviewer")) {
        role = "interviewer";
      } else if (!existingRoles.has("candidate")) {
        role = "candidate";
      }
    }

    if (role) {
      participantRoleMap.current.set(participant.identity, role);
      console.log(`[LearnLK] Mapped participant ${participant.identity} to role: ${role}`);
    }

    return role;
  }, []);

  const initializeAvatars = useCallback(
    async (
      interviewerVideo: HTMLVideoElement,
      candidateVideo: HTMLVideoElement
    ): Promise<boolean> => {
      try {
        setIsConnecting(true);
        setError(null);

        interviewerVideoRef.current = interviewerVideo;
        candidateVideoRef.current = candidateVideo;

        // Clear any stale srcObject from previous sessions
        interviewerVideo.srcObject = null;
        candidateVideo.srcObject = null;

        // Clear stale role mappings and segment data
        participantRoleMap.current.clear();
        segmentMaps.current.clear();

        console.log("[LearnLK] Cleared stale video sources and role mappings");

        // Initially mute candidate, unmute interviewer
        interviewerVideo.muted = false;
        candidateVideo.muted = true;

        console.log("[LearnLK] Fetching token...");

        const tokenRes = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "learn",
            interviewerPrompt,
            candidatePrompt,
            maxTurns: 10,
          }),
        });

        if (!tokenRes.ok) {
          const errorData = await tokenRes.json();
          throw new Error(errorData.error || "Failed to get LiveKit token");
        }

        const { token, url } = await tokenRes.json();

        console.log("[LearnLK] Connecting to room...");
        const room = new Room();
        roomRef.current = room;

        let streamReadyFired = false;

        // Handle remote tracks (avatar video + agent audio)
        room.on(
          RoomEvent.TrackSubscribed,
          (
            track: RemoteTrack,
            publication: RemoteTrackPublication,
            participant: RemoteParticipant
          ) => {
            console.log(`[LearnLK] Track subscribed: ${track.kind} from ${participant.identity}`);

            if (!streamReadyFired) {
              streamReadyFired = true;
              if (agentTimeoutRef.current) {
                clearTimeout(agentTimeoutRef.current);
                agentTimeoutRef.current = null;
              }
            }

            const role = getParticipantRole(participant);

            if (track.kind === Track.Kind.Video) {
              const targetVideo = role === "candidate"
                ? candidateVideoRef.current
                : interviewerVideoRef.current;

              if (targetVideo) {
                // Always create a fresh MediaStream to avoid stale track issues
                targetVideo.srcObject = new MediaStream([track.mediaStreamTrack]);
                targetVideo.play().catch(console.error);
                console.log(`[LearnLK] Attached video track to ${role || "unknown"} video element`);
              }
            } else if (track.kind === Track.Kind.Audio) {
              // Attach audio - LiveKit will handle playback via its own <audio> element
              track.attach();
              audioTracksRef.current.set(track.sid, track);
              console.log(`[LearnLK] Attached audio track from ${role || "unknown"}`);
            }
          }
        );

        room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          console.log(`[LearnLK] Track unsubscribed: ${track.kind}`);
          audioTracksRef.current.delete(track.sid);
        });

        room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
          console.log(`[LearnLK] Participant connected: ${participant.identity} (metadata: ${participant.metadata || "none"})`);
          const role = getParticipantRole(participant);
          console.log(`[LearnLK] Mapped participant ${participant.identity} → ${role || "unknown"}`);
        });

        room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
          console.log(`[LearnLK] Participant disconnected: ${participant.identity}`);
        });

        // Handle speaker identification via active speakers
        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          const activeSpeaker = speakers.find((p) => !p.isLocal && p.isSpeaking);
          if (activeSpeaker) {
            const role = participantRoleMap.current.get(activeSpeaker.identity);
            if (role) {
              updateSpeaker(role);
            }
          }
        });

        // Handle transcription events - each agent session publishes its own transcriptions
        room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
          if (!participant || participant.isLocal) return;

          const role = participantRoleMap.current.get(participant.identity);
          if (!role) return;

          // Get or create segment map for this participant
          if (!segmentMaps.current.has(participant.identity)) {
            segmentMaps.current.set(participant.identity, new Map());
          }
          const segMap = segmentMaps.current.get(participant.identity)!;

          for (const seg of segments) {
            segMap.set(seg.id, seg.text);
          }

          const allFinal = segments.every((s: any) => s.final);
          if (allFinal && segments.length > 0) {
            // Collect full text from all segments
            const fullText = Array.from(segMap.values()).join(" ").trim();
            if (fullText) {
              addToTranscript({
                speaker: role,
                text: fullText,
                timestamp: new Date(),
              });
            }
            // Clear segment map for next utterance
            segMap.clear();
          }
        });

        // Handle data messages from agent (speaker_change, session_end)
        room.on(RoomEvent.DataReceived, (data, participant) => {
          if (participant?.isLocal) return;
          try {
            const msg = JSON.parse(new TextDecoder().decode(data));
            console.log("[LearnLK] Data received:", msg);

            if (msg.type === "speaker_change") {
              updateSpeaker(msg.speaker);
            } else if (msg.type === "session_end") {
              console.log(`[LearnLK] Session ended: ${msg.reason}`);
              onSessionEndRef.current?.();
            }
          } catch (e) {
            // Not JSON, ignore
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          console.log("[LearnLK] Disconnected from room");
          setIsInitialized(false);
        });

        // Connect to room
        await room.connect(url, token);
        console.log("[LearnLK] Connected to room:", room.name);

        // Unlock audio playback (no mic needed for learn mode)
        await room.startAudio();
        console.log("[LearnLK] Audio playback unlocked");

        // Timeout if agent never publishes tracks
        agentTimeoutRef.current = setTimeout(() => {
          if (!streamReadyFired) {
            const msg = "Agent did not connect within 30s — ensure the Python agent is running";
            console.error(`[LearnLK] ${msg}`);
            setError(msg);
            onErrorRef.current?.(msg);
          }
        }, 30000);

        setIsInitialized(true);
        setIsConnecting(false);
        updateSpeaker("interviewer");

        return true;
      } catch (err) {
        console.error("[LearnLK] Initialization error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize session";
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
        setIsConnecting(false);
        return false;
      }
    },
    [interviewerPrompt, candidatePrompt, updateSpeaker, addToTranscript, getParticipantRole, sendDataMessage]
  );

  const pause = useCallback(() => {
    setIsPaused(true);
    setAllAudioMuted(true);
    sendDataMessage({ type: "pause" });
  }, [sendDataMessage, setAllAudioMuted]);

  const resume = useCallback(() => {
    setIsPaused(false);
    setAllAudioMuted(false);
    sendDataMessage({ type: "resume" });
  }, [sendDataMessage, setAllAudioMuted]);

  const askCandidateQuestion = useCallback(
    async (question: string) => {
      // Add user's question to transcript
      addToTranscript({
        speaker: "interviewer",
        text: `[User Question] ${question}`,
        timestamp: new Date(),
      });

      setIsPaused(false);
      await sendDataMessage({ type: "ask_question", text: question });
    },
    [addToTranscript, sendDataMessage]
  );

  const stopAvatars = useCallback(async () => {
    try {
      console.log("[LearnLK] Stopping session...");

      // Tell agent to stop
      await sendDataMessage({ type: "end" });

      // Disconnect from room
      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }

      setIsInitialized(false);
      setCurrentSpeaker(null);
      setIsPaused(false);
      audioTracksRef.current.clear();

      console.log("[LearnLK] Session stopped");
    } catch (err) {
      console.error("[LearnLK] Failed to stop session:", err);
    }
  }, [sendDataMessage]);

  return {
    isInitialized,
    isConnecting,
    currentSpeaker,
    isPaused,
    transcript,
    error,
    reconnectingAvatar: null, // Not applicable for LiveKit-based session
    initializeAvatars,
    pause,
    resume,
    askCandidateQuestion,
    stopAvatars,
  };
}
