"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LearnSession from "@/components/LearnSession";
import OnboardingUpgradeModal from "@/components/OnboardingUpgradeModal";
import { getQuestionById } from "@/data/questions";
import { track } from "@/lib/analytics-client";
import { trackMetaEvent } from "@/lib/meta-pixel";

type OnboardingStep = "role-selection" | "referral-source" | "learn" | "upgrade";

const ROLES = [
  "Consulting",
  "Product Management",
  "Strategy",
  "Investment Banking",
  "Software Engineering",
  "Other",
];

const REFERRAL_SOURCES = [
  "TikTok",
  "Instagram",
  "YouTube",
  "Facebook",
  "LinkedIn",
  "X",
  "Threads",
  "Google",
  "ChatGPT",
  "Friends",
  "Other",
];

function getQuestionIdForRole(role: string): string {
  if (role === "Product Management") return "pm-231";
  return "mck-1";
}

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("role-selection");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedReferral, setSelectedReferral] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const questionId = getQuestionIdForRole(selectedRole);
  const question = getQuestionById(questionId);

  const handleReferralNext = async () => {
    track("onboarding_step", { step: "referral" });
    setIsSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          referral_source: selectedReferral,
          markComplete: true,
        }),
      });
      trackMetaEvent('CompleteRegistration', { content_name: selectedRole });
    } catch (err) {
      console.error("Failed to save onboarding:", err);
    }
    setIsSaving(false);
    setStep("learn");
    track("onboarding_step", { step: "learn" });
  };

  const handleLearnEnd = () => {
    track("onboarding_learn_completed", { role: selectedRole, question_id: questionId });
    setStep("upgrade");
  };

  const handleViewPlans = () => {
    track("onboarding_upgrade_prompt", { action: "view_plans" });
  };

  const handleUpgradeSkip = () => {
    track("onboarding_upgrade_prompt", { action: "skip" });
    router.push("/dashboard");
  };

  // Step 3: Learn Mode
  if (step === "learn" && question) {
    return (
      <div className="h-screen">
        <LearnSession
          question={question}
          onEnd={handleLearnEnd}
          maxDurationSeconds={300}
        />
      </div>
    );
  }

  // Step 4: Upgrade Modal
  if (step === "upgrade") {
    return (
      <OnboardingUpgradeModal
        onViewPlans={handleViewPlans}
        onSkip={handleUpgradeSkip}
      />
    );
  }

  // Steps 1 & 2: Role Selection and Referral Source
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step === "role-selection" ? "bg-[#d4af37]" : "bg-[#d4af37]"}`} />
          <div className={`h-1.5 w-12 rounded-full transition-colors ${step === "referral-source" ? "bg-[#d4af37]" : "bg-gray-200"}`} />
          <div className="h-1.5 w-12 rounded-full bg-gray-200" />
        </div>

        {step === "role-selection" && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
              What roles are you interested in?
            </h1>
            <p className="text-gray-500 mb-8">
              We&apos;ll personalize your first practice interview
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    selectedRole === role
                      ? "bg-[#d4af37] text-white border-[#d4af37] shadow-md shadow-[#d4af37]/20"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                track("onboarding_step", { step: "role" });
                setStep("referral-source");
              }}
              disabled={!selectedRole}
              className="w-full max-w-xs mx-auto px-8 py-3 bg-[#d4af37] hover:bg-[#c4a030] text-white rounded-full font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {step === "referral-source" && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
              How did you hear about us?
            </h1>
            <p className="text-gray-500 mb-8">
              Help us understand where you found us
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {REFERRAL_SOURCES.map((source) => (
                <button
                  key={source}
                  onClick={() => setSelectedReferral(source)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all ${
                    selectedReferral === source
                      ? "bg-[#d4af37] text-white border-[#d4af37] shadow-md shadow-[#d4af37]/20"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep("role-selection")}
                className="px-8 py-3 text-gray-600 hover:text-gray-800 rounded-full font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleReferralNext}
                disabled={!selectedReferral || isSaving}
                className="px-8 py-3 bg-[#d4af37] hover:bg-[#c4a030] text-white rounded-full font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
