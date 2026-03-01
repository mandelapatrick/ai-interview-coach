"use client";

import { useState } from "react";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";

const features = {
  free: [
    "1 practice session per month",
    "1 learn session per month",
    "15 minute session limit",
    "Basic AI interviewer",
    "Session transcript",
  ],
  pro: [
    "Unlimited practice sessions",
    "Unlimited learn sessions",
    "No time limits",
    "All AI interviewer modes",
    "Session transcript & recording",
    "Detailed performance assessment",
    "Hints during interview (3 per session)",
    "Priority support",
  ],
};

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const {
    plan,
    billingInterval: currentInterval,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    loading: subLoading,
  } = useSubscription();

  const monthlyPrice = 49;
  const yearlyPrice = 399;
  const yearlyMonthly = Math.round(yearlyPrice / 12);
  const savings = monthlyPrice * 12 - yearlyPrice;

  const isPro = !subLoading && plan === "pro";

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType: billingInterval }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No portal URL returned");
        setPortalLoading(false);
      }
    } catch (error) {
      console.error("Portal error:", error);
      setPortalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Ace<span className="text-[#d4af37]">Interview</span>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 text-center">
        {subLoading ? (
          <div className="h-[88px]" />
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-display">
              {isPro ? (
                "Your Plan"
              ) : (
                <>
                  Land Your Dream{" "}
                  <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] bg-clip-text text-transparent">
                    Consulting Offer
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              {isPro
                ? "Manage your Pro subscription and billing details."
                : "Invest in your career. Start free and upgrade when you\u2019re ready for unlimited practice."}
            </p>
          </>
        )}
      </div>

      {/* Current Plan Card (Pro users only) */}
      {isPro && (
        <div className="max-w-4xl mx-auto px-4 mb-12">
          <div
            className={`rounded-2xl p-6 md:p-8 border ${
              cancelAtPeriodEnd
                ? "bg-amber-50/50 border-amber-200"
                : "bg-gradient-to-r from-[#d4af37]/5 to-[#f4d03f]/5 border-[#d4af37]/20"
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Pro Plan
                  </h2>
                  {cancelAtPeriodEnd ? (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Canceling
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20">
                      Active
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  {currentInterval && (
                    <p>
                      Billed{" "}
                      {currentInterval === "yearly" ? "annually" : "monthly"}
                    </p>
                  )}
                  {currentPeriodEnd && !cancelAtPeriodEnd && (
                    <p>
                      Next renewal: {formatDate(currentPeriodEnd)}
                    </p>
                  )}
                  {cancelAtPeriodEnd && currentPeriodEnd && (
                    <p className="text-amber-600 font-medium">
                      Your Pro access ends on {formatDate(currentPeriodEnd)}.
                      Resubscribe to keep unlimited sessions.
                    </p>
                  )}
                </div>
              </div>
              {cancelAtPeriodEnd ? (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {portalLoading ? "Redirecting..." : "Resubscribe"}
                </button>
              ) : (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {portalLoading ? "Redirecting..." : "Manage Subscription"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing toggle (free users only) */}
      {!isPro && (
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setBillingInterval("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingInterval === "monthly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingInterval === "yearly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Yearly
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save ${savings}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Pricing cards */}
      <div className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Free</h3>
            <p className="text-sm text-gray-600">
              Get started with case interview practice
            </p>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-600 ml-1">/month</span>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {features.free.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/dashboard"
            className="block w-full py-3 text-center border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            {isPro ? "Go to Dashboard" : "Get Started"}
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-2xl border-2 border-[#d4af37] p-8 flex flex-col relative">
          {!isPro && billingInterval === "yearly" && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white text-xs font-medium px-3 py-1 rounded-full">
                Best value
              </span>
            </div>
          )}
          {isPro && !cancelAtPeriodEnd && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white text-xs font-medium px-3 py-1 rounded-full">
                Current plan
              </span>
            </div>
          )}
          {isPro && cancelAtPeriodEnd && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                Expiring soon
              </span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Pro</h3>
            <p className="text-sm text-gray-600">
              Unlimited access to ace every interview
            </p>
          </div>

          <div className="mb-6">
            {billingInterval === "monthly" ? (
              <>
                <span className="text-4xl font-bold text-gray-900">
                  ${monthlyPrice}
                </span>
                <span className="text-gray-600 ml-1">/month</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold text-gray-900">
                  ${yearlyMonthly}
                </span>
                <span className="text-gray-600 ml-1">/month</span>
                <p className="text-sm text-gray-500 mt-1">
                  ${yearlyPrice} billed annually
                </p>
              </>
            )}
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {features.pro.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <svg
                  className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          {isPro && cancelAtPeriodEnd ? (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? "Redirecting..." : "Resubscribe"}
            </button>
          ) : isPro ? (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="w-full py-3 border border-[#d4af37] text-[#d4af37] rounded-xl font-medium hover:bg-[#d4af37]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {portalLoading ? "Redirecting..." : "Manage Subscription"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Redirecting..." : "Upgrade to Pro"}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          Secure payments powered by Stripe. Cancel anytime.
        </div>
      </footer>
    </div>
  );
}
