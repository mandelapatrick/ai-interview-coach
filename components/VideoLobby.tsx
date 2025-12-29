"use client";

import { useState, useEffect, useRef } from "react";

interface VideoLobbyProps {
  onJoin: (stream: MediaStream) => void;
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
      onJoin(stream);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white/60">Requesting camera access...</p>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
          <CameraOffIcon className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Camera Access Required
        </h3>
        <p className="text-white/60 text-center max-w-md mb-6">
          {permissionError}
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-[#1a2d47] text-white rounded-lg hover:bg-[#152238] transition-colors border border-white/10"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-2 font-display">
        Ready to Join?
      </h2>
      <p className="text-white/60 mb-8">
        Check your camera and microphone before joining
      </p>

      {/* Video Preview */}
      <div className="relative w-full max-w-2xl aspect-video bg-[#0f172a] rounded-2xl overflow-hidden mb-6 border border-white/10">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${
            !isVideoEnabled ? "hidden" : ""
          }`}
        />
        {!isVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-[#1a2d47] flex items-center justify-center">
              <CameraOffIcon className="w-12 h-12 text-white/40" />
            </div>
          </div>
        )}

        {/* Control Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          <button
            onClick={toggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioEnabled
                ? "bg-[#1a2d47] hover:bg-[#152238]"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isAudioEnabled ? (
              <MicIcon className="w-6 h-6 text-white" />
            ) : (
              <MicOffIcon className="w-6 h-6 text-white" />
            )}
          </button>
          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoEnabled
                ? "bg-[#1a2d47] hover:bg-[#152238]"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isVideoEnabled ? (
              <VideoIcon className="w-6 h-6 text-white" />
            ) : (
              <VideoOffIcon className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Device Selection */}
      <div className="w-full max-w-md space-y-4 mb-8">
        <div>
          <label className="block text-sm text-white/60 mb-2">Camera</label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a2d47] text-white rounded-lg border border-white/10 focus:border-[#d4af37] focus:outline-none"
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-2">Microphone</label>
          <select
            value={selectedMicrophone}
            onChange={(e) => setSelectedMicrophone(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a2d47] text-white rounded-lg border border-white/10 focus:border-[#d4af37] focus:outline-none"
          >
            {microphones.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-[#1a2d47] text-white rounded-lg hover:bg-[#152238] transition-colors border border-white/10"
        >
          Back
        </button>
        <button
          onClick={handleJoin}
          disabled={!stream}
          className="px-8 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Join Interview
        </button>
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
