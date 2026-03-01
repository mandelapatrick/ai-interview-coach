"use client";

interface PlanBadgeProps {
  plan: "free" | "pro";
}

export default function PlanBadge({ plan }: PlanBadgeProps) {
  if (plan === "pro") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#d4af37]/10 text-[#d4af37]">
        Pro
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      Free
    </span>
  );
}
