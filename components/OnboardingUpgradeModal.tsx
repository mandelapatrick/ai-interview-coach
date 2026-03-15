"use client";

import Link from "next/link";

interface OnboardingUpgradeModalProps {
  onViewPlans: () => void;
  onSkip: () => void;
}

export default function OnboardingUpgradeModal({ onViewPlans, onSkip }: OnboardingUpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-slide-up text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-[#d4af37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">
          You just saw how experts ace interviews
        </h2>
        <p className="text-gray-500 mb-6">
          Unlock unlimited access to master yours
        </p>

        {/* Benefits */}
        <div className="bg-[#faf8f5] rounded-xl p-4 mb-6 border border-[#d4af37]/20 text-left space-y-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">Unlimited learn &amp; practice sessions</span>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">Real-time AI feedback on your answers</span>
          </div>
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-700 text-sm">Detailed assessments to track your progress</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            onClick={onViewPlans}
            className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-xl font-medium text-center hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
          >
            Unlock Full Access
          </Link>
          <button
            onClick={onSkip}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Explore Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
