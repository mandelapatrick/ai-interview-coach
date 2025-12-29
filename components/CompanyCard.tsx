"use client";

import Link from "next/link";
import { Company } from "@/types";

const companyColors: Record<string, { bg: string; text: string }> = {
  mckinsey: { bg: "bg-blue-600", text: "text-white" },
  bcg: { bg: "bg-green-600", text: "text-white" },
  bain: { bg: "bg-red-600", text: "text-white" },
  deloitte: { bg: "bg-emerald-500", text: "text-white" },
  accenture: { bg: "bg-purple-600", text: "text-white" },
  kearney: { bg: "bg-orange-500", text: "text-white" },
  "oliver-wyman": { bg: "bg-sky-600", text: "text-white" },
  "roland-berger": { bg: "bg-gray-800", text: "text-white" },
  lek: { bg: "bg-yellow-500", text: "text-black" },
  "strategy-and": { bg: "bg-orange-600", text: "text-white" },
};

const companyInitials: Record<string, string> = {
  mckinsey: "McK",
  bcg: "BCG",
  bain: "BAIN",
  deloitte: "D",
  accenture: "A",
  kearney: "K",
  "oliver-wyman": "OW",
  "roland-berger": "RB",
  lek: "LEK",
  "strategy-and": "S&",
};

export default function CompanyCard({ company }: { company: Company }) {
  const colors = companyColors[company.slug] || { bg: "bg-gray-600", text: "text-white" };
  const initials = companyInitials[company.slug] || company.name.charAt(0);

  return (
    <Link href={`/company/${company.slug}`} className="block h-full">
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl overflow-hidden hover:border-[#4a4a4a] hover:bg-[#323232] transition-all cursor-pointer h-full flex flex-col">
        {/* Logo Area */}
        <div className="h-32 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
          <div className={`w-20 h-20 ${colors.bg} rounded-xl flex items-center justify-center`}>
            <span className={`text-xl font-bold ${colors.text}`}>
              {initials}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name and Question Count */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-base font-semibold text-white line-clamp-1">
              {company.name}
            </h3>
            <span className="text-sm text-gray-400 whitespace-nowrap ml-2">
              {company.questionCount} questions
            </span>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {company.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="text-xs px-2 py-1 bg-[#3a3a3a] text-gray-300 rounded"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
