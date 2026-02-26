"use client";

interface HintModalProps {
  hint: string;
  hintNumber: number;
  onClose: () => void;
}

export default function HintModal({ hint, hintNumber, onClose }: HintModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl p-6 max-w-md w-full mx-4 mb-0 sm:mb-0 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#d4af37]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Hint #{hintNumber}</h3>
              <p className="text-xs text-gray-500">
                {hintNumber === 1 && "A gentle nudge"}
                {hintNumber === 2 && "Getting warmer"}
                {hintNumber >= 3 && "Strong guidance"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors -mr-2 -mt-2"
          >
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Hint Content */}
        <div className="bg-[#faf8f5] rounded-xl p-4 mb-5 border border-[#d4af37]/20">
          <p className="text-gray-700 leading-relaxed">{hint}</p>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#d4af37] hover:bg-[#b8972e] text-white rounded-xl font-medium transition-colors"
        >
          Got it
        </button>

        {/* Hint usage note */}
        {hintNumber >= 3 && (
          <p className="text-xs text-gray-600 text-center mt-3">
            Maximum hints reached for this session
          </p>
        )}
      </div>
    </div>
  );
}
