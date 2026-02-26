import Link from "next/link";
import { pmCompanies } from "@/data/companies";
import { PM_QUESTION_TYPE_LABELS, PM_TYPE_COLORS, PMQuestionType } from "@/types";

export default function PMDashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] transition-colors mb-4"
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
          Product Management Interview Prep
        </h1>
        <p className="text-gray-500">
          Practice PM interviews from Meta, Google, Amazon, and other top tech
          companies.
        </p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pmCompanies
            .filter((company) => company.questionCount >= 6)
            .sort((a, b) => b.questionCount - a.questionCount)
            .map((company) => (
            <Link
              key={company.slug}
              href={`/company/${company.slug}`}
              className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:border-violet-500/50 transition-all duration-300"
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
                    <span className="text-2xl font-bold text-slate-400">
                      {company.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {company.questionCount} questions
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-violet-400 transition-colors">
                {company.name}
              </h2>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {company.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {company.categories.slice(0, 3).map((category) => {
                  const colorClass =
                    PM_TYPE_COLORS[category as PMQuestionType] ||
                    "text-gray-600 bg-gray-50";
                  return (
                    <span
                      key={category}
                      className={`px-2 py-1 rounded-md text-xs font-medium ${colorClass}`}
                    >
                      {PM_QUESTION_TYPE_LABELS[category as PMQuestionType] ||
                        category}
                    </span>
                  );
                })}
                {company.categories.length > 3 && (
                  <span className="px-2 py-1 rounded-md text-xs font-medium text-gray-400 bg-gray-100">
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
