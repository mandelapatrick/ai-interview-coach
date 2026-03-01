"use client";

import { useState } from "react";
import { Question } from "@/types";
import { useSubscription } from "@/hooks/useSubscription";
import InterviewModeSelector from "./InterviewModeSelector";
import VideoLobby, { AvatarProvider } from "./VideoLobby";
import VideoSession from "./VideoSession";
import VoiceSession from "./VoiceSession";
import AnamAudioSession from "./AnamAudioSession";
import UpgradeModal from "./UpgradeModal";

type FlowState = "mode-select" | "audio" | "audio-xai" | "video-lobby" | "video-session";

interface PracticeFlowProps {
  question: Question;
}

export default function PracticeFlow({ question }: PracticeFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>("mode-select");
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [avatarProvider, setAvatarProvider] = useState<AvatarProvider>("anam");
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { canPractice, maxDurationSeconds, loading } = useSubscription();

  const handleModeSelect = (mode: "audio" | "audio-xai" | "video") => {
    if (!canPractice) {
      setShowUpgrade(true);
      return;
    }

    if (mode === "audio") {
      setFlowState("audio"); // Uses Anam (Kimi K2) - default
    } else if (mode === "audio-xai") {
      setFlowState("audio-xai"); // Uses X.AI (Grok)
    } else {
      setFlowState("video-lobby");
    }
  };

  const handleVideoLobbyJoin = (stream: MediaStream, provider: AvatarProvider) => {
    setUserStream(stream);
    setAvatarProvider(provider);
    setFlowState("video-session");
  };

  const handleVideoLobbyBack = () => {
    setFlowState("mode-select");
  };

  const handleVideoSessionBack = () => {
    // Stop the stream if going back
    if (userStream) {
      userStream.getTracks().forEach((track) => track.stop());
      setUserStream(null);
    }
    setFlowState("mode-select");
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  switch (flowState) {
    case "mode-select":
      return (
        <>
          <InterviewModeSelector onSelectMode={handleModeSelect} />
          {showUpgrade && (
            <UpgradeModal
              sessionType="practice"
              onClose={() => setShowUpgrade(false)}
            />
          )}
        </>
      );

    case "audio":
      return <AnamAudioSession question={question} maxDurationSeconds={maxDurationSeconds} />;

    case "audio-xai":
      return <VoiceSession question={question} maxDurationSeconds={maxDurationSeconds} />;

    case "video-lobby":
      return (
        <VideoLobby onJoin={handleVideoLobbyJoin} onBack={handleVideoLobbyBack} />
      );

    case "video-session":
      return userStream ? (
        <VideoSession
          question={question}
          userStream={userStream}
          avatarProvider={avatarProvider}
          onBack={handleVideoSessionBack}
          maxDurationSeconds={maxDurationSeconds}
        />
      ) : null;

    default:
      return null;
  }
}
