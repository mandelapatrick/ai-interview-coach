"use client";

import { useState, useEffect, useRef } from "react";

export type AvatarProvider = "heygen" | "anam";

interface VideoLobbyProps {
  onJoin: (stream: MediaStream, avatarProvider: AvatarProvider) => void;
  onBack: () => void;
}

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
}

export default function VideoLobby({ onJoin, onBack }: VideoLobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [selectedAvatarProvider, setSelectedAvatarProvider] = useState<AvatarProvider>("anam");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get available devices
  useEffect(() => {
    async function getDevices() {
      try {
        // First request permissions
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Get device list after permissions granted
        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices
          .filter((d) => d.kind === "videoinput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${d.deviceId.slice(0, 5)}`,
          }));

        const audioDevices = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
          }));

        setCameras(videoDevices);
        setMicrophones(audioDevices);

        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
        if (audioDevices.length > 0) {
          setSelectedMicrophone(audioDevices[0].deviceId);
        }

        // Stop temp stream
        tempStream.getTracks().forEach((track) => track.stop());

        setIsLoading(false);
      } catch (error) {
        console.error("Permission error:", error);
        setPermissionError(
          "Camera and microphone access is required for video interviews. Please allow access and try again."
        );
        setIsLoading(false);
      }
    }

    getDevices();
  }, []);

  // Start video preview when devices are selected
  useEffect(() => {
    if (!selectedCamera || !selectedMicrophone) return;

    async function startPreview() {
      try {
        // Stop existing stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: selectedCamera },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: {
            deviceId: { exact: selectedMicrophone },
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (error) {
        console.error("Failed to start preview:", error);
        setPermissionError("Failed to access camera or microphone.");
      }
    }

    startPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [selectedCamera, selectedMicrophone]);

  // Toggle video track
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio track
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleJoin = () => {
    if (stream) {
      onJoin(stream, selectedAvatarProvider);
    }
  };

  // Get short label for device (truncate long names)
  const getShortLabel = (label: string, maxLength: number = 20) => {
    if (label.length <= maxLength) return label;
    return label.slice(0, maxLength) + "...";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500">Requesting camera access...</p>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)] px-4">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <CameraOffIcon className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Camera Access Required
          </h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {permissionError}
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)] px-4 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-16 w-full max-w-5xl">
        {/* Left side - Video Preview */}
        <div className="flex flex-col items-center flex-1 w-full lg:max-w-[600px]">
          {/* Video Container */}
          <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover -scale-x-100 ${!isVideoEnabled ? "hidden" : ""}`}
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-20 h-20 rounded-full bg-[#374151] flex items-center justify-center">
                  <CameraOffIcon className="w-10 h-10 text-gray-400" />
                </div>
              </div>
            )}

            {/* Control Overlay - centered at bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <button
                onClick={toggleAudio}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isAudioEnabled
                    ? "bg-[#3c4043] hover:bg-[#4a4f52]"
                    : "bg-[#ea4335] hover:bg-[#d33426]"
                }`}
                title={isAudioEnabled ? "Turn off microphone" : "Turn on microphone"}
              >
                {isAudioEnabled ? (
                  <MicIcon className="w-5 h-5 text-white" />
                ) : (
                  <MicOffIcon className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={toggleVideo}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  isVideoEnabled
                    ? "bg-[#3c4043] hover:bg-[#4a4f52]"
                    : "bg-[#ea4335] hover:bg-[#d33426]"
                }`}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoEnabled ? (
                  <VideoIcon className="w-5 h-5 text-white" />
                ) : (
                  <VideoOffIcon className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Device Selectors - pill buttons below video */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <div className="relative">
              <select
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                className="appearance-none pl-8 pr-6 py-2 bg-transparent text-gray-700 text-sm rounded-full border border-gray-300 hover:bg-gray-50 focus:outline-none focus:border-gray-400 cursor-pointer"
              >
                {microphones.map((mic) => (
                  <option key={mic.deviceId} value={mic.deviceId} className="bg-white text-gray-900">
                    {getShortLabel(mic.label)}
                  </option>
                ))}
              </select>
              <MicIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="appearance-none pl-8 pr-6 py-2 bg-transparent text-gray-700 text-sm rounded-full border border-gray-300 hover:bg-gray-50 focus:outline-none focus:border-gray-400 cursor-pointer"
              >
                {cameras.map((camera) => (
                  <option key={camera.deviceId} value={camera.deviceId} className="bg-white text-gray-900">
                    {getShortLabel(camera.label)}
                  </option>
                ))}
              </select>
              <VideoIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right side - Join CTA */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:min-w-[280px]">
          <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center mb-4">
            <VideoIcon className="w-6 h-6 text-[#d4af37]" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2 font-display">
            Ready to join?
          </h2>

          <p className="text-gray-400 text-sm mb-6">
            Your interview will begin when you click join
          </p>

          <button
            onClick={handleJoin}
            disabled={!stream}
            className="w-full lg:w-auto px-10 py-3 bg-[#d4af37] hover:bg-[#c4a030] text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            Join now
          </button>

          <button
            onClick={onBack}
            className="w-full lg:w-auto px-10 py-3 text-[#d4af37] hover:bg-[#d4af37]/10 rounded-full font-medium transition-all border border-[#d4af37]/30"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}

function MicOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function VideoOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
    </svg>
  );
}

function CameraOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
