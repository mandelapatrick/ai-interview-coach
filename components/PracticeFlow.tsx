"use client";

import { useState } from "react";
import { Question } from "@/types";
import InterviewModeSelector from "./InterviewModeSelector";
import VideoLobby, { AvatarProvider } from "./VideoLobby";
import VideoSession from "./VideoSession";
import VoiceSession from "./VoiceSession";
import AnamAudioSession from "./AnamAudioSession";

type FlowState = "mode-select" | "audio" | "audio-xai" | "video-lobby" | "video-session";

interface PracticeFlowProps {
  question: Question;
}

export default function PracticeFlow({ question }: PracticeFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>("mode-select");
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [avatarProvider, setAvatarProvider] = useState<AvatarProvider>("anam");

  const handleModeSelect = (mode: "audio" | "audio-xai" | "video") => {
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

  switch (flowState) {
    case "mode-select":
      return <InterviewModeSelector onSelectMode={handleModeSelect} />;

    case "audio":
      return <AnamAudioSession question={question} />;

    case "audio-xai":
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
