"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Overview", href: "/admin/analytics" },
  { label: "Engagement", href: "/admin/analytics/engagement" },
  { label: "Retention", href: "/admin/analytics/retention" },
  { label: "Funnels", href: "/admin/analytics/funnels" },
  { label: "Monetization", href: "/admin/analytics/monetization" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <nav className="flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-[#d4af37] text-[#d4af37]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
