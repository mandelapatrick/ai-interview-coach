"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
const pmTypes = Object.keys(PM_QUESTION_TYPE_LABELS) as PMQuestionType[];

export default function QuestionBankPage() {
  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState<InterviewTrack | "all">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Filter companies based on selected track
  const filteredCompanies = useMemo(() => {
    if (trackFilter === "all") return allCompanies;
    return allCompanies.filter((c) => c.track === trackFilter);
  }, [trackFilter]);

  // Get question types based on selected track
  const availableTypes = useMemo(() => {
    if (trackFilter === "consulting") {
      return consultingTypes.map((t) => ({ value: t, label: QUESTION_TYPE_LABELS[t] }));
    } else if (trackFilter === "product-management") {
      return pmTypes.map((t) => ({ value: t, label: PM_QUESTION_TYPE_LABELS[t] }));
    }
    // All tracks - combine both
    return [
      ...consultingTypes.map((t) => ({ value: t, label: QUESTION_TYPE_LABELS[t] })),
      ...pmTypes.filter((t) => t !== "execution").map((t) => ({ value: t, label: PM_QUESTION_TYPE_LABELS[t] })),
    ];
  }, [trackFilter]);

  // Reset company and type filter when track changes
  const handleTrackChange = (newTrack: InterviewTrack | "all") => {
    setTrackFilter(newTrack);
    setCompanyFilter("all");
    setTypeFilter("all");
  };

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

      // Track filter
      if (trackFilter !== "all" && q.track !== trackFilter) {
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
  }, [search, trackFilter, companyFilter, typeFilter]);

  const getTypeColor = (question: Question) => {
    if (question.track === "consulting") {
      return TYPE_COLORS_DARK[question.type as QuestionType] || "text-gray-400 bg-gray-400/10";
    }
    return PM_TYPE_COLORS_DARK[question.type as PMQuestionType] || "text-gray-400 bg-gray-400/10";
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
        <h1 className="text-3xl font-bold text-white mb-2 font-display">
          Question Bank
        </h1>
        <p className="text-white/60">
          Browse and practice interview questions from top companies.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#152238] border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d4af37]/50 focus:ring-1 focus:ring-[#d4af37]/50"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
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

          {/* Track Filter */}
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Track</label>
            <select
              value={trackFilter}
              onChange={(e) => handleTrackChange(e.target.value as InterviewTrack | "all")}
              className="w-full bg-[#152238] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 appearance-none cursor-pointer"
            >
              <option value="all">All Tracks</option>
              <option value="consulting">Consulting</option>
              <option value="product-management">Product Management</option>
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-sm text-white/50 mb-1.5">Company</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-[#152238] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 appearance-none cursor-pointer"
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
            <label className="block text-sm text-white/50 mb-1.5">Question Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#152238] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#d4af37]/50 appearance-none cursor-pointer"
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
            <span className="text-sm text-white/50">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-[#1a2d47] rounded-xl border border-white/10 p-12 text-center">
          <svg
            className="w-12 h-12 text-white/30 mx-auto mb-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No questions found</h3>
          <p className="text-white/50">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((question) => {
            const companyLogo = getCompanyLogo(question.companySlug);
            return (
              <div
                key={question.id}
                className="bg-[#1a2d47] rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Company Logo */}
                    <div className="w-10 h-10 rounded-lg bg-[#152238] flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      <h3 className="font-medium text-white mb-1 truncate">
                        {question.title}
                      </h3>
                      <p className="text-sm text-white/50 line-clamp-2 mb-2">
                        {question.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-white/40">
                          {getCompanyName(question.companySlug)}
                        </span>
                        <span className="text-white/20">•</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(question)}`}
                        >
                          {getTypeLabel(question)}
                        </span>
                        <span className="text-white/20">•</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            question.track === "consulting"
                              ? "text-blue-400 bg-blue-400/10"
                              : "text-violet-400 bg-violet-400/10"
                          }`}
                        >
                          {question.track === "consulting" ? "Consulting" : "PM"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Practice & Learn Buttons */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link
                      href={`/practice/${question.id}`}
                      className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-lg font-medium text-sm hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all text-center"
                    >
                      Practice
                    </Link>
                    <Link
                      href={`/learn/${question.id}`}
                      className="px-4 py-2 border border-[#d4af37] text-[#d4af37] rounded-lg font-medium text-sm hover:bg-[#d4af37]/10 transition-all text-center"
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
