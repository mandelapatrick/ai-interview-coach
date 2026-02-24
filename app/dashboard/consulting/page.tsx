import Link from "next/link";
import { companies } from "@/data/companies";
import { QUESTION_TYPE_LABELS, TYPE_COLORS } from "@/types";

export default function ConsultingDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#d4af37] transition-colors mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2 font-display">
          Consulting Interview Prep
        </h1>
        <p className="text-white/60">
          Practice case interviews from McKinsey, BCG, Bain, and other top
          consulting firms.
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company.slug}
              href={`/company/${company.slug}`}
              className="group relative bg-gradient-to-br from-[#1a2d47] to-[#0f172a] border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  {company.logoUrl ? (
                    <img
                      src={company.logoUrl}
                      alt={company.name}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white/30">
                      {company.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/40">
                  {company.questionCount} questions
                </div>
              </div>

              <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {company.name}
              </h2>

              <p className="text-white/50 text-sm mb-4 line-clamp-2">
                {company.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {company.categories.slice(0, 3).map((category) => {
                  const colorClass =
                    TYPE_COLORS[category as keyof typeof TYPE_COLORS] ||
                    "text-gray-600 bg-gray-50";
                  return (
                    <span
                      key={category}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}
                    >
                      {QUESTION_TYPE_LABELS[
                        category as keyof typeof QUESTION_TYPE_LABELS
                      ] || category}
                    </span>
                  );
                })}
                {company.categories.length > 3 && (
                  <span className="px-2 py-1 rounded-md text-xs font-medium text-white/40 bg-white/5">
                    +{company.categories.length - 3} more
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
  );
}
