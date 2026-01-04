"use client";

import { useRef, useState, useCallback } from "react";

interface UseVideoRecorderOptions {
  frameRate?: number;
  videoBitsPerSecond?: number;
}

interface UseVideoRecorderReturn {
  isRecording: boolean;
  recordingDuration: number;
  recordedBlob: Blob | null;
  startRecording: (canvasStream: MediaStream) => void;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
}

export function useVideoRecorder(
  options: UseVideoRecorderOptions = {}
): UseVideoRecorderReturn {
  const { videoBitsPerSecond = 2500000 } = options; // 2.5 Mbps default

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(
    (canvasStream: MediaStream) => {
      try {
        setError(null);
        chunksRef.current = [];
        setRecordedBlob(null);
        setRecordingDuration(0);

        // Determine supported mime type
        const mimeType = getSupportedMimeType();
        if (!mimeType) {
          setError("No supported video format found in this browser");
          return;
        }

        const mediaRecorder = new MediaRecorder(canvasStream, {
          mimeType,
          videoBitsPerSecond,
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder error:", event);
          setError("Recording error occurred");
          setIsRecording(false);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setRecordedBlob(blob);
          setIsRecording(false);

          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start(1000); // Collect data every second
        setIsRecording(true);

        // Track recording duration
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration((d) => d + 1);
        }, 1000);

        console.log("[VideoRecorder] Recording started with mimeType:", mimeType);
      } catch (err) {
        console.error("[VideoRecorder] Failed to start recording:", err);
        setError("Failed to start recording");
      }
    },
    [videoBitsPerSecond]
  );

  const stopRecording = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
        resolve(recordedBlob);
        return;
      }

      const recorder = mediaRecorderRef.current;

      // Wait for the onstop event to fire and blob to be created
      const originalOnStop = recorder.onstop;
      recorder.onstop = (event) => {
        if (originalOnStop) {
          originalOnStop.call(recorder, event);
        }
        // Give a small delay for state to update
        setTimeout(() => {
          const mimeType = getSupportedMimeType() || "video/webm";
          const blob = new Blob(chunksRef.current, { type: mimeType });
          resolve(blob);
        }, 100);
      };

      recorder.stop();
      console.log("[VideoRecorder] Recording stopped");

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    });
  }, [recordedBlob]);

  return {
    isRecording,
    recordingDuration,
    recordedBlob,
    startRecording,
    stopRecording,
    error,
  };
}

function getSupportedMimeType(): string | null {
  const mimeTypes = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return null;
}

export async function uploadRecording(
  blob: Blob,
  sessionId: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", blob, `recording-${sessionId}.webm`);
    formData.append("sessionId", sessionId);

    const response = await fetch("/api/recordings", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload recording");
    }

    const data = await response.json();
    return data.url;
  } catch (err) {
    console.error("[VideoRecorder] Failed to upload recording:", err);
    return null;
  }
}
