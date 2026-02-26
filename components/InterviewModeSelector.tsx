"use client";

interface InterviewModeSelectorProps {
  onSelectMode: (mode: "audio" | "audio-xai" | "video") => void;
}

export default function InterviewModeSelector({
  onSelectMode,
}: InterviewModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
        Choose Interview Mode
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Select how you&apos;d like to practice this case interview
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Audio Interview Option (Default - Kimi K2) */}
        <button
          onClick={() => onSelectMode("audio")}
          className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-gray-200 hover:border-[#d4af37]/50 transition-all hover:shadow-lg hover:shadow-[#d4af37]/10"
        >
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-[#d4af37]/10 transition-colors">
            <MicrophoneIcon className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Audio Interview
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Voice-only conversation with AI interviewer. Great for quick
            practice on the go.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="px-4 py-2 bg-gray-50 rounded-full text-sm text-gray-600">
              Microphone only
            </div>
          </div>
        </button>

        {/* Video Interview Option */}
        <button
          onClick={() => onSelectMode("video")}
          className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border border-[#d4af37]/30 hover:border-[#d4af37] transition-all hover:shadow-lg hover:shadow-[#d4af37]/20"
        >
          <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white text-xs font-bold rounded-full">
            NEW
          </div>
          <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center mb-4 group-hover:from-[#d4af37]/30 group-hover:to-[#f4d03f]/20 transition-colors">
            <VideoIcon className="w-8 h-8 text-[#d4af37]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Video Interview
          </h3>
          <p className="text-sm text-gray-600 text-center">
            Face-to-face with an AI avatar interviewer. The most realistic
            interview experience.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="px-4 py-2 bg-gray-50 rounded-full text-sm text-[#d4af37]">
              Camera + Microphone
            </div>
          </div>
        </button>
      </div>

      {/* Alternative Models */}
      <div className="mt-6 w-full max-w-md">
        <p className="text-xs text-gray-500 text-center mb-3">Alternative models</p>
        <button
          onClick={() => onSelectMode("audio-xai")}
          className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-300 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
            <MicrophoneIcon className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-medium text-gray-900">Audio Interview (Grok)</h4>
            <p className="text-xs text-gray-600">Alternative model powered by X.AI</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function MicrophoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

