"use client";

import { useState } from "react";
import { Question } from "@/types";
import InterviewModeSelector from "./InterviewModeSelector";
import VideoLobby, { AvatarProvider } from "./VideoLobby";
import VideoSession from "./VideoSession";
import VoiceSession from "./VoiceSession";

type FlowState = "mode-select" | "audio" | "video-lobby" | "video-session";

interface PracticeFlowProps {
  question: Question;
}

export default function PracticeFlow({ question }: PracticeFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>("video-lobby");
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [avatarProvider, setAvatarProvider] = useState<AvatarProvider>("anam");

  const handleModeSelect = (mode: "audio" | "video") => {
    if (mode === "audio") {
      setFlowState("audio");
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

  switch (flowState) {
    case "mode-select":
      return <InterviewModeSelector onSelectMode={handleModeSelect} />;

    case "audio":
      return <VoiceSession question={question} />;

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
        />
      ) : null;

    default:
      return null;
  }
}
