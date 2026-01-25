"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient, AnamEvent } from "@anam-ai/js-sdk";
import type { AnamClient } from "@anam-ai/js-sdk";

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

  // Refs
  const interviewerClientRef = useRef<AnamClient | null>(null);
  const candidateClientRef = useRef<AnamClient | null>(null);
  const interviewerVideoRef = useRef<HTMLVideoElement | null>(null);
  const candidateVideoRef = useRef<HTMLVideoElement | null>(null);
  const currentInterviewerTextRef = useRef<string>("");
  const currentCandidateTextRef = useRef<string>("");
  const turnCountRef = useRef(0);
  const isInterviewerTalkingRef = useRef(false);
  const isCandidateTalkingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (interviewerClientRef.current) {
        interviewerClientRef.current.stopStreaming().catch(console.error);
      }
      if (candidateClientRef.current) {
        candidateClientRef.current.stopStreaming().catch(console.error);
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

        // Set up interviewer event listeners
        interviewerClient.addListener(AnamEvent.SESSION_READY, () => {
          console.log("[DualAnam] Interviewer session ready");
        });

        interviewerClient.addListener(
          AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED,
          (event: { role: string; content: string }) => {
            if (event.role === "persona") {
              // Prevent overlap: only start if candidate is not talking
              if (!isInterviewerTalkingRef.current && !isCandidateTalkingRef.current) {
                isInterviewerTalkingRef.current = true;
                updateSpeaker("interviewer");
                console.log("[DualAnam] Interviewer started speaking");
              }
              if (isInterviewerTalkingRef.current) {
                currentInterviewerTextRef.current += event.content;
              }
            }
          }
        );

        interviewerClient.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, () => {
          // Interviewer finished speaking
          console.log("[DualAnam] Interviewer MESSAGE_HISTORY_UPDATED, talking:", isInterviewerTalkingRef.current, "text length:", currentInterviewerTextRef.current.length);
          if (isInterviewerTalkingRef.current && currentInterviewerTextRef.current) {
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

            // Now trigger candidate to respond by sending interviewer's message
            if (!isPaused && turnCountRef.current < 10 && spokenText) {
              turnCountRef.current++;
              console.log("[DualAnam] Sending interviewer's message to candidate:", spokenText.substring(0, 50) + "...");

              // Clear speaker while transitioning (no one is actively speaking)
              updateSpeaker(null);

              // Send the interviewer's text to the candidate as "user input"
              // Use longer delay for more natural turn-taking
              setTimeout(() => {
                // Don't set speaker here - let MESSAGE_STREAM_EVENT_RECEIVED handle it
                // when the candidate actually starts speaking
                try {
                  candidateClient.sendUserMessage(spokenText);
                } catch (err) {
                  console.error("[DualAnam] Failed to send message to candidate:", err);
                }
              }, 1000);
            }
          }
        });

        // Set up candidate event listeners
        candidateClient.addListener(AnamEvent.SESSION_READY, () => {
          console.log("[DualAnam] Candidate session ready");
        });

        candidateClient.addListener(
          AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED,
          (event: { role: string; content: string }) => {
            if (event.role === "persona") {
              // Prevent overlap: only start if interviewer is not talking
              if (!isCandidateTalkingRef.current && !isInterviewerTalkingRef.current) {
                isCandidateTalkingRef.current = true;
                updateSpeaker("candidate");
                console.log("[DualAnam] Candidate started speaking");
              }
              if (isCandidateTalkingRef.current) {
                currentCandidateTextRef.current += event.content;
              }
            }
          }
        );

        candidateClient.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, () => {
          // Candidate finished speaking
          console.log("[DualAnam] Candidate MESSAGE_HISTORY_UPDATED, talking:", isCandidateTalkingRef.current, "text length:", currentCandidateTextRef.current.length);
          if (isCandidateTalkingRef.current && currentCandidateTextRef.current) {
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

            // Switch back to interviewer for follow-up by sending candidate's response
            if (!isPaused && turnCountRef.current < 10 && spokenText) {
              console.log("[DualAnam] Sending candidate's response to interviewer:", spokenText.substring(0, 50) + "...");

              // Clear speaker while transitioning (no one is actively speaking)
              updateSpeaker(null);

              // Send the candidate's text to the interviewer as "user input"
              // Use longer delay for more natural turn-taking
              setTimeout(() => {
                // Don't set speaker here - let MESSAGE_STREAM_EVENT_RECEIVED handle it
                // when the interviewer actually starts speaking
                try {
                  interviewerClient.sendUserMessage(spokenText);
                } catch (err) {
                  console.error("[DualAnam] Failed to send message to interviewer:", err);
                }
              }, 1000);
            } else if (turnCountRef.current >= 10) {
              // End the interview after 10 turns
              onSessionEnd?.();
            }
          }
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
        console.log("[DualAnam] Candidate stream started");

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
      isPaused,
      onError,
      onSessionEnd,
    ]
  );

  // Pause the interview
  const pause = useCallback(() => {
    setIsPaused(true);
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
    // Unmute the current speaker
    if (currentSpeaker === "interviewer" && interviewerVideoRef.current) {
      interviewerVideoRef.current.muted = false;
    } else if (currentSpeaker === "candidate" && candidateVideoRef.current) {
      candidateVideoRef.current.muted = false;
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

      // The candidate client should respond based on its system prompt
      // For now, we just switch to the candidate speaker
      updateSpeaker("candidate");
    },
    [addToTranscript, updateSpeaker]
  );

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
    initializeAvatars,
    pause,
    resume,
    askCandidateQuestion,
    stopAvatars,
  };
}
