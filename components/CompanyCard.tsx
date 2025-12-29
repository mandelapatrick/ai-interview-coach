"use client";

import Link from "next/link";
import { Company } from "@/types";

export default function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/company/${company.slug}`} className="block h-full">
      <div className="bg-[#1a2d47] border border-white/10 rounded-xl overflow-hidden hover:border-[#d4af37]/40 hover:bg-[#213754] transition-all cursor-pointer h-full flex flex-col group">
        {/* Logo Area */}
        <div className="h-32 bg-white flex items-center justify-center flex-shrink-0">
          {company.logoUrl ? (
            <div className="w-28 h-20 flex items-center justify-center">
              <img
                src={company.logoUrl}
                alt={company.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <span className="text-5xl">{company.logo}</span>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Name and Question Count */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-base font-semibold text-white group-hover:text-[#d4af37] transition-colors line-clamp-1">
              {company.name}
            </h3>
            <span className="text-sm text-white/50 whitespace-nowrap ml-2">
              {company.questionCount} questions
            </span>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {company.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="text-xs px-2 py-1 bg-[#0f172a] text-white/60 rounded border border-white/10"
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
