"use client";

import Link from "next/link";

interface UpgradeModalProps {
  sessionType: "practice" | "learn";
  onClose: () => void;
}

export default function UpgradeModal({ sessionType, onClose }: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-slide-up"
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Free limit reached
              </h3>
              <p className="text-xs text-gray-500">Upgrade for unlimited access</p>
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

        {/* Content */}
        <div className="bg-[#faf8f5] rounded-xl p-4 mb-5 border border-[#d4af37]/20">
          <p className="text-gray-700 leading-relaxed">
            You&apos;ve used your free {sessionType} session this month.
            Upgrade to Pro for unlimited {sessionType === "practice" ? "practice sessions" : "learning sessions"},
            no time limits, and detailed assessments.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-xl font-medium text-center hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
          >
            View Plans
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
