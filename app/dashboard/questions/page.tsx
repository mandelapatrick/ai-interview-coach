"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { questions as consultingQuestions } from "@/data/questions";
import { pmQuestions } from "@/data/pm-questions";
import { companies, pmCompanies } from "@/data/companies";
import {
  Question,
  InterviewTrack,
  QUESTION_TYPE_LABELS,
  PM_QUESTION_TYPE_LABELS,
  TYPE_COLORS_DARK,
  PM_TYPE_COLORS_DARK,
  QuestionType,
  PMQuestionType,
} from "@/types";

// Combine all questions
const allQuestions = [...consultingQuestions, ...pmQuestions];
const allCompanies = [...companies, ...pmCompanies];

// Get unique question types for each track
const consultingTypes = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];
// Filter out 'execution' as it's a legacy type that maps to 'analytical-thinking'
const pmTypes = (Object.keys(PM_QUESTION_TYPE_LABELS) as PMQuestionType[]).filter(
  (t) => t !== "execution"
);

export default function QuestionBankPage() {
  const searchParams = useSearchParams();
  const trackFromUrl = searchParams.get("track") as InterviewTrack | null;

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Track is determined by URL param
  const trackFilter = trackFromUrl || "product-management";

  // Get page title based on track
  const pageTitle = trackFilter === "consulting"
    ? "Consulting Question Bank"
    : "Product Management Question Bank";

  // Filter companies based on selected track
  const filteredCompanies = useMemo(() => {
    return allCompanies.filter((c) => c.track === trackFilter && c.questionCount >= 6);
  }, [trackFilter]);

  // Get question types based on selected track
  const availableTypes = useMemo(() => {
    if (trackFilter === "consulting") {
      return consultingTypes.map((t) => ({ value: t, label: QUESTION_TYPE_LABELS[t] }));
    }
    return pmTypes.map((t) => ({ value: t, label: PM_QUESTION_TYPE_LABELS[t] }));
  }, [trackFilter]);

  // Set of valid company slugs (companies with 6+ questions)
  const validCompanySlugs = useMemo(() => {
    return new Set(filteredCompanies.map((c) => c.slug));
  }, [filteredCompanies]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        if (
          !q.title.toLowerCase().includes(searchLower) &&
          !q.description.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Track filter - always filter by selected track
      if (q.track !== trackFilter) {
        return false;
      }

      // Hide questions from companies with fewer than 6 questions
      if (!validCompanySlugs.has(q.companySlug)) {
        return false;
      }

      // Company filter
      if (companyFilter !== "all" && q.companySlug !== companyFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && q.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [search, trackFilter, companyFilter, typeFilter, validCompanySlugs]);

  const getTypeColor = (question: Question) => {
    if (question.track === "consulting") {
      return TYPE_COLORS_DARK[question.type as QuestionType] || "text-gray-600 bg-gray-400/10";
    }
    return PM_TYPE_COLORS_DARK[question.type as PMQuestionType] || "text-gray-600 bg-gray-400/10";
  };

  const getTypeLabel = (question: Question) => {
    if (question.track === "consulting") {
      return QUESTION_TYPE_LABELS[question.type as QuestionType] || question.type;
    }
    return PM_QUESTION_TYPE_LABELS[question.type as PMQuestionType] || question.type;
  };

  const getCompanyName = (companySlug: string) => {
    const company = allCompanies.find((c) => c.slug === companySlug);
    return company?.name || companySlug;
  };

  const getCompanyLogo = (companySlug: string) => {
    const company = allCompanies.find((c) => c.slug === companySlug);
    return company?.logoUrl || null;
  };

  const getPracticeLink = (question: Question) => {
    if (question.track === "product-management") {
      return `/learn/${question.id}`;
    }
    return `/practice/${question.id}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">
          {pageTitle}
        </h1>
        <p className="text-gray-500">
          Browse and practice {trackFilter === "consulting" ? "consulting" : "product management"} interview questions from top companies.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pl-10 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#d4af37]/50 appearance-none cursor-pointer"
            >
              <option value="all">All Companies</option>
              {filteredCompanies.map((company) => (
                <option key={company.slug} value={company.slug}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm text-gray-600 mb-1.5">Question Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-[#d4af37]/50 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              {availableTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          <div className="flex items-end">
            <span className="text-sm text-gray-600">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-12 h-12 text-gray-500 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No questions found</h3>
          <p className="text-gray-600">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => {
            const companyLogo = getCompanyLogo(question.companySlug);
            return (
              <div
                key={question.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Company Logo */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {companyLogo ? (
                        <img
                          src={companyLogo}
                          alt=""
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <span className="text-lg">
                          {allCompanies.find((c) => c.slug === question.companySlug)?.logo || "?"}
                        </span>
                      )}
                    </div>

                    {/* Question Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">
                        {question.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {question.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-600">
                          {getCompanyName(question.companySlug)}
                        </span>
                        <span className="text-gray-400">&bull;</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(question)}`}
                        >
                          {getTypeLabel(question)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Practice & Learn Buttons */}
                  <div className="flex flex-row gap-2 sm:flex-col sm:flex-shrink-0">
                    <Link
                      href={`/practice/${question.id}`}
                      className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all text-center"
                    >
                      Practice
                    </Link>
                    <Link
                      href={`/learn/${question.id}`}
                      className="flex-1 sm:flex-none px-4 py-2 border border-[#d4af37] text-[#d4af37] rounded-lg font-medium text-sm hover:bg-[#d4af37]/10 transition-all text-center"
                    >
                      Learn
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
