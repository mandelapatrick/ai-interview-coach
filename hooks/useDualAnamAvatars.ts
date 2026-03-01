"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient, AnamEvent } from "@anam-ai/js-sdk";
import type { AnamClient } from "@anam-ai/js-sdk";

// Explicit turn state machine to prevent race conditions
type TurnState =
  | "interviewer_speaking"
  | "waiting_for_candidate"
  | "candidate_speaking"
  | "waiting_for_interviewer";

export interface TranscriptEntry {
  speaker: "interviewer" | "candidate";
  text: string;
  timestamp: Date;
}

export interface UseDualAnamAvatarsOptions {
  interviewerPrompt: string;
  candidatePrompt: string;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
  onSpeakerChange?: (speaker: "interviewer" | "candidate" | null) => void;
  onError?: (error: string) => void;
  onSessionEnd?: () => void;
}

export interface UseDualAnamAvatarsReturn {
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

export function useDualAnamAvatars(
  options: UseDualAnamAvatarsOptions
): UseDualAnamAvatarsReturn {
  const {
    interviewerPrompt,
    candidatePrompt,
    onTranscriptUpdate,
    onSpeakerChange,
    onError,
    onSessionEnd,
  } = options;

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<
    "interviewer" | "candidate" | null
  >(null);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reconnectingAvatar, setReconnectingAvatar] = useState<
    "interviewer" | "candidate" | null
  >(null);

  // Refs
  const interviewerRetryCountRef = useRef(0);
  const candidateRetryCountRef = useRef(0);
  const reconnectingRef = useRef(false);
  const isPausedRef = useRef(false); // Ref version of isPaused for use in event listeners
  const interviewerClientRef = useRef<AnamClient | null>(null);
  const candidateClientRef = useRef<AnamClient | null>(null);
  const interviewerVideoRef = useRef<HTMLVideoElement | null>(null);
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentInterviewerTextRef = useRef<string>("");
  const currentCandidateTextRef = useRef<string>("");
  const turnCountRef = useRef(0);
  const isInterviewerTalkingRef = useRef(false);
  const isCandidateTalkingRef = useRef(false);
  const turnStateRef = useRef<TurnState>("interviewer_speaking");

  // Timeout refs for fallback speech-end detection
  const interviewerSpeechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const candidateSpeechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const SPEECH_END_TIMEOUT = 3000; // 3 seconds of silence = speech ended
  const MAX_RECONNECT_RETRIES = 2;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (interviewerClientRef.current) {
        interviewerClientRef.current.stopStreaming().catch(console.error);
      }
      if (candidateClientRef.current) {
        candidateClientRef.current.stopStreaming().catch(console.error);
      }
      if (interviewerSpeechTimeoutRef.current) {
        clearTimeout(interviewerSpeechTimeoutRef.current);
      }
      if (candidateSpeechTimeoutRef.current) {
        clearTimeout(candidateSpeechTimeoutRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, []);

  // Update speaker state and notify
  const updateSpeaker = useCallback(
    (speaker: "interviewer" | "candidate" | null) => {
      setCurrentSpeaker(speaker);
      onSpeakerChange?.(speaker);

      // Mute/unmute video elements based on who is speaking
      // When speaker is null (transition), mute both to avoid overlap
      if (interviewerVideoRef.current) {
        interviewerVideoRef.current.muted = speaker !== "interviewer";
      }
      if (candidateVideoRef.current) {
        candidateVideoRef.current.muted = speaker !== "candidate";
      }

      console.log("[DualAnam] Speaker changed to:", speaker);
    },
    [onSpeakerChange]
  );

  // Add to transcript
  const addToTranscript = useCallback(
    (entry: TranscriptEntry) => {
      setTranscript((prev) => {
        const updated = [...prev, entry];
        onTranscriptUpdate?.(updated);
        return updated;
      });
    },
    [onTranscriptUpdate]
  );

  // Handle connection lost for a specific avatar
  const handleConnectionLost = useCallback(
    async (avatar: "interviewer" | "candidate", reason: string) => {
      // Prevent concurrent reconnection attempts
      if (reconnectingRef.current) return;

      const retryCount =
        avatar === "interviewer"
          ? interviewerRetryCountRef.current
          : candidateRetryCountRef.current;

      if (retryCount >= MAX_RECONNECT_RETRIES) {
        const msg = `${avatar} stream failed after ${MAX_RECONNECT_RETRIES} reconnection attempts`;
        console.error("[DualAnam]", msg);
        setError(msg);
        onError?.(msg);
        setReconnectingAvatar(null);
        return;
      }

      reconnectingRef.current = true;
      console.warn(`[DualAnam] ${avatar} connection lost (${reason}), attempting reconnect (${retryCount + 1}/${MAX_RECONNECT_RETRIES})...`);

      // Update retry count
      if (avatar === "interviewer") {
        interviewerRetryCountRef.current++;
      } else {
        candidateRetryCountRef.current++;
      }

      setReconnectingAvatar(avatar);

      // Pause the conversation while reconnecting
      isPausedRef.current = true;
      setIsPaused(true);

      // Interrupt the other avatar to prevent it from talking into the void
      try {
        if (avatar === "interviewer" && candidateClientRef.current) {
          candidateClientRef.current.interruptPersona();
        } else if (avatar === "candidate" && interviewerClientRef.current) {
          interviewerClientRef.current.interruptPersona();
        }
      } catch (e) {
        console.warn("[DualAnam] Failed to interrupt other avatar during reconnect:", e);
      }

      // Stop the dead client
      try {
        const deadClient =
          avatar === "interviewer"
            ? interviewerClientRef.current
            : candidateClientRef.current;
        if (deadClient) {
          await deadClient.stopStreaming().catch(() => {});
        }
      } catch (e) {
        console.warn("[DualAnam] Failed to stop dead client:", e);
      }

      try {
        // Fetch a new token for the disconnected avatar
        const tokenRes = await fetch("/api/anam/learn-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewerPrompt,
            candidatePrompt,
          }),
        });

        if (!tokenRes.ok) {
          throw new Error("Failed to get reconnection token");
        }

        const tokens = await tokenRes.json();
        const newToken =
          avatar === "interviewer"
            ? tokens.interviewerToken
            : tokens.candidateToken;

        // Create a new client
        const newClient = createClient(newToken);

        // Get the video element
        const videoEl =
          avatar === "interviewer"
            ? interviewerVideoRef.current
            : candidateVideoRef.current;

        if (!videoEl) {
          throw new Error("Video element not found for reconnection");
        }

        // Ensure video element has an ID
        if (!videoEl.id) {
          videoEl.id = `${avatar}-video-${Date.now()}`;
        }

        // Mute input audio (Learn mode = watch-only)
        newClient.muteInputAudio();

        // Register CONNECTION_CLOSED listener on the new client
        newClient.addListener(AnamEvent.CONNECTION_CLOSED, (r: string) => {
          console.warn(`[DualAnam] ${avatar} connection closed (reconnected client):`, r);
          handleConnectionLost(avatar, r);
        });

        // Start streaming to the video element
        await newClient.streamToVideoElement(videoEl.id);

        // Update the client ref
        if (avatar === "interviewer") {
          interviewerClientRef.current = newClient;
        } else {
          candidateClientRef.current = newClient;
        }

        console.log(`[DualAnam] ${avatar} reconnected successfully`);

        // Reset reconnecting state
        setReconnectingAvatar(null);
        reconnectingRef.current = false;

        // Resume the conversation
        isPausedRef.current = false;
        setIsPaused(false);

        // Prompt the reconnected avatar to continue
        turnStateRef.current =
          avatar === "interviewer"
            ? "waiting_for_interviewer"
            : "waiting_for_candidate";
        updateSpeaker(avatar);
        newClient.sendUserMessage(
          "Please continue the interview from where you left off."
        );
      } catch (err) {
        console.error(`[DualAnam] Reconnection failed for ${avatar}:`, err);
        reconnectingRef.current = false;
        // Retry by calling handleConnectionLost again (retry count already incremented)
        handleConnectionLost(avatar, "RECONNECT_FAILED");
      }
    },
    [interviewerPrompt, candidatePrompt, updateSpeaker, onError]
  );

  // Initialize both avatars
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

        // Ensure video elements have IDs
        if (!interviewerVideo.id) {
          interviewerVideo.id = `interviewer-video-${Date.now()}`;
        }
        if (!candidateVideo.id) {
          candidateVideo.id = `candidate-video-${Date.now()}`;
        }

        console.log("[DualAnam] Fetching tokens...");

        // Get tokens from API
        const tokenRes = await fetch("/api/anam/learn-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            interviewerPrompt,
            candidatePrompt,
          }),
        });

        if (!tokenRes.ok) {
          const errorData = await tokenRes.json();
          throw new Error(errorData.error || "Failed to get tokens");
        }

        const { interviewerToken, candidateToken } = await tokenRes.json();

        console.log("[DualAnam] Tokens received, creating clients...");

        // Create interviewer client
        const interviewerClient = createClient(interviewerToken);
        interviewerClientRef.current = interviewerClient;

        // Create candidate client
        const candidateClient = createClient(candidateToken);
        candidateClientRef.current = candidateClient;

        // Helper function to handle interviewer finishing speaking
        const handleInterviewerFinished = () => {
          if (!isInterviewerTalkingRef.current || !currentInterviewerTextRef.current) return;

          const spokenText = currentInterviewerTextRef.current.trim();
          console.log("[DualAnam] Interviewer finished speaking:", spokenText.substring(0, 50) + "...");

          addToTranscript({
            speaker: "interviewer",
            text: spokenText,
            timestamp: new Date(),
          });

          // Reset for next turn
          currentInterviewerTextRef.current = "";
          isInterviewerTalkingRef.current = false;

          // Clear timeout since we're handling the turn pass
          if (interviewerSpeechTimeoutRef.current) {
            clearTimeout(interviewerSpeechTimeoutRef.current);
            interviewerSpeechTimeoutRef.current = null;
          }

          // Now trigger candidate to respond by sending interviewer's message
          if (!isPausedRef.current && turnCountRef.current < 10 && spokenText) {
            turnCountRef.current++;
            console.log("[DualAnam] Sending interviewer's message to candidate:", spokenText.substring(0, 50) + "...");

            // Atomic turn state transition - candidate's turn now
            turnStateRef.current = "waiting_for_candidate";
            updateSpeaker(null);

            // Send message immediately (turn state guards protect against race conditions)
            try {
              candidateClient.sendUserMessage(spokenText);
            } catch (err) {
              console.error("[DualAnam] Failed to send message to candidate:", err);
            }
          }
        };

        // Set up connection closed listeners for reconnection
        interviewerClient.addListener(AnamEvent.CONNECTION_CLOSED, (reason: string) => {
          console.warn("[DualAnam] Interviewer connection closed:", reason);
          handleConnectionLost("interviewer", reason);
        });

        candidateClient.addListener(AnamEvent.CONNECTION_CLOSED, (reason: string) => {
          console.warn("[DualAnam] Candidate connection closed:", reason);
          handleConnectionLost("candidate", reason);
        });

        // Set up interviewer event listeners
        interviewerClient.addListener(AnamEvent.SESSION_READY, () => {
          console.log("[DualAnam] Interviewer session ready");
        });

        interviewerClient.addListener(
          AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED,
          (event: { role: string; content: string }) => {
            if (event.role === "persona") {
              // GUARD: Only allow interviewer speech if turn state permits
              if (turnStateRef.current !== "interviewer_speaking" &&
                  turnStateRef.current !== "waiting_for_interviewer") {
                console.log("[DualAnam] Ignoring interviewer speech - not their turn, state:", turnStateRef.current);
                interviewerClient.interruptPersona();
                return;
              }

              // Clear any existing timeout
              if (interviewerSpeechTimeoutRef.current) {
                clearTimeout(interviewerSpeechTimeoutRef.current);
              }

              // Start interviewer speaking
              if (!isInterviewerTalkingRef.current) {
                isInterviewerTalkingRef.current = true;
                turnStateRef.current = "interviewer_speaking";
                updateSpeaker("interviewer");
                // Interrupt candidate as safety
                candidateClient.interruptPersona();
                console.log("[DualAnam] Interviewer started speaking");
              }
              currentInterviewerTextRef.current += event.content;

              // Set timeout to detect end of speech (fallback if MESSAGE_HISTORY_UPDATED doesn't fire)
              interviewerSpeechTimeoutRef.current = setTimeout(() => {
                console.log("[DualAnam] Interviewer speech timeout triggered");
                handleInterviewerFinished();
              }, SPEECH_END_TIMEOUT);
            }
          }
        );

        interviewerClient.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, () => {
          // Interviewer finished speaking
          console.log("[DualAnam] Interviewer MESSAGE_HISTORY_UPDATED, talking:", isInterviewerTalkingRef.current, "text length:", currentInterviewerTextRef.current.length);
          handleInterviewerFinished();
        });

        // Set up candidate event listeners
        candidateClient.addListener(AnamEvent.SESSION_READY, () => {
          console.log("[DualAnam] Candidate session ready");
        });

        // Helper function to handle candidate finishing speaking
        const handleCandidateFinished = () => {
          if (!isCandidateTalkingRef.current || !currentCandidateTextRef.current) return;

          const spokenText = currentCandidateTextRef.current.trim();
          console.log("[DualAnam] Candidate finished speaking:", spokenText.substring(0, 50) + "...");

          addToTranscript({
            speaker: "candidate",
            text: spokenText,
            timestamp: new Date(),
          });

          // Reset for next turn
          currentCandidateTextRef.current = "";
          isCandidateTalkingRef.current = false;

          // Clear timeout since we're handling the turn pass
          if (candidateSpeechTimeoutRef.current) {
            clearTimeout(candidateSpeechTimeoutRef.current);
            candidateSpeechTimeoutRef.current = null;
          }

          // Switch back to interviewer for follow-up by sending candidate's response
          if (!isPausedRef.current && turnCountRef.current < 10 && spokenText) {
            console.log("[DualAnam] Sending candidate's response to interviewer:", spokenText.substring(0, 50) + "...");

            // Atomic turn state transition - interviewer's turn now
            turnStateRef.current = "waiting_for_interviewer";
            updateSpeaker(null);

            // Send message immediately (turn state guards protect against race conditions)
            try {
              interviewerClient.sendUserMessage(spokenText);
            } catch (err) {
              console.error("[DualAnam] Failed to send message to interviewer:", err);
            }
          } else if (turnCountRef.current >= 10) {
            // End the interview after 10 turns
            onSessionEnd?.();
          }
        };

        candidateClient.addListener(
          AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED,
          (event: { role: string; content: string }) => {
            if (event.role === "persona") {
              // GUARD: Only allow candidate speech if turn state permits
              if (turnStateRef.current !== "candidate_speaking" &&
                  turnStateRef.current !== "waiting_for_candidate") {
                console.log("[DualAnam] Ignoring candidate speech - not their turn, state:", turnStateRef.current);
                candidateClient.interruptPersona();
                return;
              }

              // Clear any existing timeout
              if (candidateSpeechTimeoutRef.current) {
                clearTimeout(candidateSpeechTimeoutRef.current);
              }

              // Start candidate speaking
              if (!isCandidateTalkingRef.current) {
                isCandidateTalkingRef.current = true;
                turnStateRef.current = "candidate_speaking";
                updateSpeaker("candidate");
                // Interrupt interviewer as safety
                interviewerClient.interruptPersona();
                console.log("[DualAnam] Candidate started speaking");
              }
              currentCandidateTextRef.current += event.content;

              // Set timeout to detect end of speech (fallback if MESSAGE_HISTORY_UPDATED doesn't fire)
              candidateSpeechTimeoutRef.current = setTimeout(() => {
                console.log("[DualAnam] Candidate speech timeout triggered");
                handleCandidateFinished();
              }, SPEECH_END_TIMEOUT);
            }
          }
        );

        candidateClient.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, () => {
          // Candidate finished speaking
          console.log("[DualAnam] Candidate MESSAGE_HISTORY_UPDATED, talking:", isCandidateTalkingRef.current, "text length:", currentCandidateTextRef.current.length);
          handleCandidateFinished();
        });

        console.log("[DualAnam] Starting streams...");

        // Mute input audio BEFORE starting streams to prevent microphone permission request
        // In Learn mode, user is just watching - no mic needed
        interviewerClient.muteInputAudio();
        candidateClient.muteInputAudio();
        console.log("[DualAnam] Input audio muted for both avatars (Learn mode - no mic needed)");

        // Initially mute candidate, unmute interviewer
        interviewerVideo.muted = false;
        candidateVideo.muted = true;

        // Start interviewer stream first
        console.log("[DualAnam] Starting interviewer stream...");
        await interviewerClient.streamToVideoElement(interviewerVideo.id);
        console.log("[DualAnam] Interviewer stream started");

        // Short delay before starting candidate to prevent overlap
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Start candidate stream (will be muted until their turn)
        console.log("[DualAnam] Starting candidate stream...");
        await candidateClient.streamToVideoElement(candidateVideo.id);
        // Immediately interrupt any auto-greeting the candidate might try
        candidateClient.interruptPersona();
        console.log("[DualAnam] Candidate stream started (auto-greeting interrupted)");

        console.log("[DualAnam] Streams started successfully");

        setIsInitialized(true);
        setIsConnecting(false);
        updateSpeaker("interviewer");

        return true;
      } catch (err) {
        console.error("[DualAnam] Initialization error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initialize avatars";
        setError(errorMessage);
        onError?.(errorMessage);
        setIsConnecting(false);
        return false;
      }
    },
    [
      interviewerPrompt,
      candidatePrompt,
      updateSpeaker,
      addToTranscript,
      onError,
      onSessionEnd,
      handleConnectionLost,
    ]
  );

  // Pause the interview
  const pause = useCallback(() => {
    setIsPaused(true);
    isPausedRef.current = true; // Update ref for event listeners
    // Interrupt both avatars to stop them talking/animating
    if (interviewerClientRef.current) {
      interviewerClientRef.current.interruptPersona();
    }
    if (candidateClientRef.current) {
      candidateClientRef.current.interruptPersona();
    }
    // Mute both avatars
    if (interviewerVideoRef.current) {
      interviewerVideoRef.current.muted = true;
    }
    if (candidateVideoRef.current) {
      candidateVideoRef.current.muted = true;
    }
  }, []);

  // Resume the interview
  const resume = useCallback(() => {
    setIsPaused(false);
    isPausedRef.current = false; // Update ref for event listeners
    // Unmute the current speaker
    if (currentSpeaker === "interviewer" && interviewerVideoRef.current) {
      interviewerVideoRef.current.muted = false;
    } else if (currentSpeaker === "candidate" && candidateVideoRef.current) {
      candidateVideoRef.current.muted = false;
    }
    // Resume the conversation by prompting the current speaker to continue
    if (currentSpeaker === "interviewer" && interviewerClientRef.current) {
      turnStateRef.current = "waiting_for_interviewer";
      interviewerClientRef.current.sendUserMessage("Please continue the interview from where you left off.");
    } else if (currentSpeaker === "candidate" && candidateClientRef.current) {
      turnStateRef.current = "waiting_for_candidate";
      candidateClientRef.current.sendUserMessage("Please continue your response from where you left off.");
    } else if (interviewerClientRef.current) {
      // Default: prompt interviewer to continue
      turnStateRef.current = "waiting_for_interviewer";
      interviewerClientRef.current.sendUserMessage("Please continue the interview from where you left off.");
    }
  }, [currentSpeaker]);

  // Ask the candidate a clarifying question
  const askCandidateQuestion = useCallback(
    async (question: string) => {
      // Add user's question to transcript
      addToTranscript({
        speaker: "interviewer", // Show as interviewer since user is asking
        text: `[User Question] ${question}`,
        timestamp: new Date(),
      });

      // Send the question to the candidate avatar so it responds
      if (candidateClientRef.current) {
        updateSpeaker("candidate");
        turnStateRef.current = "waiting_for_candidate";

        // Unmute candidate so user hears the response
        if (candidateVideoRef.current) {
          candidateVideoRef.current.muted = false;
        }

        // Unpause the interview
        isPausedRef.current = false;
        setIsPaused(false);

        candidateClientRef.current.sendUserMessage(question);
      }
    },
    [addToTranscript, updateSpeaker]
  );

  // Video track health check - detect silently dead streams
  useEffect(() => {
    if (!isInitialized) return;

    healthCheckIntervalRef.current = setInterval(() => {
      if (reconnectingRef.current) return;

      // Check interviewer video tracks
      const iStream = interviewerVideoRef.current?.srcObject as MediaStream | null;
      if (iStream && iStream.getVideoTracks().every((t) => t.readyState === "ended")) {
        console.warn("[DualAnam] Interviewer video tracks ended, triggering reconnect");
        handleConnectionLost("interviewer", "TRACK_ENDED");
      }

      // Check candidate video tracks
      const cStream = candidateVideoRef.current?.srcObject as MediaStream | null;
      if (cStream && cStream.getVideoTracks().every((t) => t.readyState === "ended")) {
        console.warn("[DualAnam] Candidate video tracks ended, triggering reconnect");
        handleConnectionLost("candidate", "TRACK_ENDED");
      }
    }, 5000);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [isInitialized, handleConnectionLost]);

  // Stop both avatars
  const stopAvatars = useCallback(async () => {
    try {
      console.log("[DualAnam] Stopping avatars...");

      if (interviewerClientRef.current) {
        await interviewerClientRef.current.stopStreaming();
        interviewerClientRef.current = null;
      }

      if (candidateClientRef.current) {
        await candidateClientRef.current.stopStreaming();
        candidateClientRef.current = null;
      }

      setIsInitialized(false);
      setCurrentSpeaker(null);
      setIsPaused(false);
      turnStateRef.current = "interviewer_speaking"; // Reset turn state

      console.log("[DualAnam] Avatars stopped");
    } catch (err) {
      console.error("[DualAnam] Failed to stop avatars:", err);
    }
  }, []);

  return {
    isInitialized,
    isConnecting,
    currentSpeaker,
    isPaused,
    transcript,
    error,
    reconnectingAvatar,
    initializeAvatars,
    pause,
    resume,
    askCandidateQuestion,
    stopAvatars,
  };
}
