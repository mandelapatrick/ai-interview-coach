"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Question } from "@/types";
import { useDualAnamAvatars, TranscriptEntry } from "@/hooks/useDualAnamAvatars";
import { getSystemPrompt, getCandidatePrompt } from "@/data/prompts";
import ClarifyingQuestionModal from "./ClarifyingQuestionModal";

interface LearnSessionProps {
  question: Question;
  onEnd: (transcript: TranscriptEntry[]) => void;
}

export default function LearnSession({ question, onEnd }: LearnSessionProps) {
  const interviewerVideoRef = useRef<HTMLVideoElement>(null);
  const candidateVideoRef = useRef<HTMLVideoElement>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const avatarInitializedRef = useRef(false);

  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [duration, setDuration] = useState(0);

  // Get prompts
  const interviewerPrompt = getSystemPrompt(question);
  const candidatePrompt = getCandidatePrompt(question);

  // Dual avatar hook
  const {
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
  } = useDualAnamAvatars({
    interviewerPrompt,
    candidatePrompt,
    onSessionEnd: () => {
      handleEndInterview();
    },
    onError: (err) => {
      console.error("[LearnSession] Error:", err);
    },
  });

  // Initialize avatars on mount
  useEffect(() => {
    if (avatarInitializedRef.current) return;

    const initAvatars = async () => {
      if (!interviewerVideoRef.current || !candidateVideoRef.current) return;

      avatarInitializedRef.current = true;
      await initializeAvatars(
        interviewerVideoRef.current,
        candidateVideoRef.current
      );
    };

    const timer = setTimeout(initAvatars, 100);
    return () => clearTimeout(timer);
  }, [initializeAvatars]);

  // Duration timer
  useEffect(() => {
    if (!isInitialized || isPaused) return;

    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInitialized, isPaused]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop =
        transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle end interview
  const handleEndInterview = useCallback(async () => {
    await stopAvatars();
    onEnd(transcript);
  }, [stopAvatars, onEnd, transcript]);

  // Handle clarifying question
  const handleAskQuestion = async (questionText: string) => {
    setShowQuestionModal(false);
    await askCandidateQuestion(questionText);
    resume();
  };

  // Open question modal and pause
  const handleOpenQuestionModal = () => {
    pause();
    setShowQuestionModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Video Section - Vertical on mobile, Side by Side on desktop */}
        <div className="flex-1 flex flex-col md:flex-row gap-1 md:gap-4 p-1 md:p-4 min-h-0">
          {/* Interviewer Video */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100 min-h-0">
            <video
              ref={interviewerVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Interviewer Label */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center gap-2">
              <div
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium backdrop-blur-sm ${
                  currentSpeaker === "interviewer"
                    ? "bg-blue-500 text-white"
                    : "bg-black/50 text-gray-300"
                }`}
              >
                Interviewer
              </div>
              {currentSpeaker === "interviewer" && (
                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            {/* Mobile-only timer overlay on first video */}
            <div className="absolute top-2 right-2 md:hidden">
              <span className="text-white font-mono text-xs font-semibold bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
                {formatDuration(duration)}
              </span>
            </div>
            {/* Loading overlay */}
            {isConnecting && (
              <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-3 md:mb-4" />
                <p className="text-gray-500 text-sm">Connecting interviewer...</p>
              </div>
            )}
          </div>

          {/* Candidate Video */}
          <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-100 min-h-0">
            <video
              ref={candidateVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* Candidate Label */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 flex items-center gap-2">
              <div
                className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm font-medium backdrop-blur-sm ${
                  currentSpeaker === "candidate"
                    ? "bg-violet-500 text-white"
                    : "bg-black/50 text-gray-300"
                }`}
              >
                Expert Candidate
              </div>
              {currentSpeaker === "candidate" && (
                <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            {/* Loading overlay */}
            {isConnecting && (
              <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center">
                <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-violet-400/30 border-t-violet-400 rounded-full animate-spin mb-3 md:mb-4" />
                <p className="text-gray-500 text-sm">Connecting candidate...</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Transcript (hidden on mobile) */}
        <div className="hidden md:flex w-96 border-l border-gray-200 flex-col bg-gray-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Live Transcript</h3>
              <span className="text-sm text-gray-600">{formatDuration(duration)}</span>
            </div>
            {error && (
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Transcript */}
          <div
            ref={transcriptContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {transcript.length === 0 ? (
              <p className="text-gray-600 text-center text-sm py-8">
                {isConnecting
                  ? "Connecting to avatars..."
                  : "The interview will begin shortly..."}
              </p>
            ) : (
              transcript.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    entry.speaker === "interviewer"
                      ? "bg-blue-500/10 border-l-2 border-blue-400"
                      : "bg-violet-500/10 border-l-2 border-violet-400"
                  }`}
                >
                  <span
                    className={`text-xs font-medium uppercase ${
                      entry.speaker === "interviewer"
                        ? "text-blue-400"
                        : "text-violet-400"
                    }`}
                  >
                    {entry.speaker}
                  </span>
                  <p className="text-gray-700 text-sm mt-1">{entry.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile error display */}
      {error && (
        <div className="md:hidden mx-2 mb-1 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Control Bar */}
      <div className="border-t border-gray-200 p-2 md:p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 md:gap-4">
          {/* Pause/Resume Button */}
          <button
            onClick={isPaused ? resume : pause}
            disabled={!isInitialized}
            className="px-3 py-2 md:px-6 md:py-2.5 bg-gray-100 text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-all border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
          >
            {isPaused ? (
              <>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Resume</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Pause</span>
              </>
            )}
          </button>

          {/* Ask Question Button */}
          <button
            onClick={handleOpenQuestionModal}
            disabled={!isInitialized}
            className="px-3 py-2 md:px-6 md:py-2.5 bg-violet-500/20 text-violet-600 font-medium rounded-lg hover:bg-violet-500/30 transition-all border border-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="hidden sm:inline">Ask Question</span>
            <span className="sm:hidden">Ask</span>
          </button>

          {/* End Interview Button */}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="px-3 py-2 md:px-6 md:py-2.5 bg-red-500/20 text-red-500 font-medium rounded-lg hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center gap-1.5 md:gap-2 text-sm md:text-base"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="hidden sm:inline">End Interview</span>
            <span className="sm:hidden">End</span>
          </button>
        </div>
      </div>

      {/* End Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">End Interview?</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to end the interview demonstration? You&apos;ll see a
              summary of what was covered.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndConfirm(false);
                  handleEndInterview();
                }}
                className="px-4 py-2 bg-red-500 text-gray-900 rounded-lg hover:bg-red-600 transition-all"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clarifying Question Modal */}
      <ClarifyingQuestionModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          resume();
        }}
        onSubmit={handleAskQuestion}
      />
    </div>
  );
}
