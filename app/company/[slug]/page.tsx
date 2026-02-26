"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCompanyBySlug } from "@/data/companies";
import { getQuestionsByCompany } from "@/data/questions";
import {
  QuestionType,
  PMQuestionType,
  AllQuestionTypes,
  Difficulty,
  Frequency,
  QUESTION_TYPE_LABELS,
  PM_QUESTION_TYPE_LABELS,
  FREQUENCY_LABELS,
} from "@/types";

const companyColors: Record<string, { bg: string; text: string }> = {
  // Consulting companies
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
  // PM companies
  meta: { bg: "bg-blue-500", text: "text-white" },
  google: { bg: "bg-red-500", text: "text-white" },
  amazon: { bg: "bg-orange-500", text: "text-white" },
  microsoft: { bg: "bg-sky-500", text: "text-white" },
  apple: { bg: "bg-gray-800", text: "text-white" },
  uber: { bg: "bg-black", text: "text-white" },
  lyft: { bg: "bg-pink-500", text: "text-white" },
  airbnb: { bg: "bg-rose-500", text: "text-white" },
  tiktok: { bg: "bg-gray-900", text: "text-white" },
  netflix: { bg: "bg-red-600", text: "text-white" },
  dropbox: { bg: "bg-blue-600", text: "text-white" },
  linkedin: { bg: "bg-blue-700", text: "text-white" },
  doordash: { bg: "bg-red-500", text: "text-white" },
  salesforce: { bg: "bg-blue-400", text: "text-white" },
  coinbase: { bg: "bg-blue-600", text: "text-white" },
  pinterest: { bg: "bg-red-600", text: "text-white" },
  twitter: { bg: "bg-sky-400", text: "text-white" },
  yelp: { bg: "bg-red-600", text: "text-white" },
  adobe: { bg: "bg-red-600", text: "text-white" },
  intuit: { bg: "bg-blue-500", text: "text-white" },
  "capital-one": { bg: "bg-red-700", text: "text-white" },
  zoom: { bg: "bg-blue-500", text: "text-white" },
  etsy: { bg: "bg-orange-500", text: "text-white" },
  ebay: { bg: "bg-yellow-500", text: "text-black" },
  affirm: { bg: "bg-blue-600", text: "text-white" },
  brex: { bg: "bg-orange-500", text: "text-white" },
  roblox: { bg: "bg-red-500", text: "text-white" },
  glassdoor: { bg: "bg-green-600", text: "text-white" },
  quora: { bg: "bg-red-700", text: "text-white" },
  redfin: { bg: "bg-red-600", text: "text-white" },
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

const DIFFICULTY_COLORS_DARK: Record<Difficulty, string> = {
  easy: "text-green-600 bg-green-400/10",
  medium: "text-[#d4af37] bg-[#d4af37]/10",
  hard: "text-red-600 bg-red-400/10",
};

const FREQUENCY_COLORS_DARK: Record<Frequency, string> = {
  high: "text-red-600 bg-red-400/10",
  medium: "text-orange-600 bg-orange-400/10",
  low: "text-green-600 bg-green-400/10",
};

const CONSULTING_TYPE_COLORS_DARK: Record<QuestionType, string> = {
  profitability: "text-blue-600 bg-blue-400/10",
  "market-entry": "text-purple-600 bg-purple-400/10",
  "market-sizing": "text-cyan-600 bg-cyan-400/10",
  "m&a": "text-orange-600 bg-orange-400/10",
  operations: "text-gray-600 bg-gray-400/10",
  "growth-strategy": "text-emerald-600 bg-emerald-400/10",
  pricing: "text-pink-600 bg-pink-400/10",
  "competitive-response": "text-indigo-600 bg-indigo-400/10",
  brainteasers: "text-yellow-600 bg-yellow-400/10",
  turnarounds: "text-red-600 bg-red-400/10",
  "strategic-decision": "text-teal-600 bg-teal-400/10",
  "industry-analysis": "text-slate-600 bg-slate-400/10",
};

const PM_TYPE_COLORS_DARK: Record<PMQuestionType, string> = {
  "product-sense": "text-violet-600 bg-violet-400/10",
  "analytical-thinking": "text-emerald-600 bg-emerald-400/10",
  behavioral: "text-amber-600 bg-amber-400/10",
  technical: "text-blue-600 bg-blue-400/10",
  execution: "text-emerald-600 bg-emerald-400/10",
  strategy: "text-rose-600 bg-rose-400/10",
  estimation: "text-indigo-600 bg-indigo-400/10",
};

const ALL_TYPE_COLORS_DARK: Record<AllQuestionTypes, string> = {
  ...CONSULTING_TYPE_COLORS_DARK,
  ...PM_TYPE_COLORS_DARK,
};

export default function CompanyQuestionsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const company = getCompanyBySlug(slug);
  const allQuestions = getQuestionsByCompany(slug);
  const isPM = company?.track === "product-management";

  const [typeFilter, setTypeFilter] = useState<AllQuestionTypes | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [frequencyFilter, setFrequencyFilter] = useState<Frequency | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesType = typeFilter === "all" || q.type === typeFilter;
      const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      const matchesFrequency = frequencyFilter === "all" || q.frequency === frequencyFilter;
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesDifficulty && matchesFrequency && matchesSearch;
    });
  }, [allQuestions, typeFilter, difficultyFilter, frequencyFilter, searchQuery]);

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Company not found</p>
      </div>
    );
  }

  const colors = companyColors[slug] || { bg: "bg-gray-600", text: "text-white" };
  const initials = companyInitials[slug] || company.name.charAt(0);
  const logoUrl = company.logoUrl;

  const consultingTypes: (QuestionType | "all")[] = [
    "all",
    "profitability",
    "market-entry",
    "market-sizing",
    "m&a",
    "operations",
    "growth-strategy",
    "pricing",
    "competitive-response",
  ];

  const pmTypes: (PMQuestionType | "all")[] = [
    "all",
    "product-sense",
    "analytical-thinking",
    "behavioral",
    "technical",
    "strategy",
    "estimation",
  ];

  const questionTypes = isPM ? pmTypes : consultingTypes;
  const typeLabels = isPM ? PM_QUESTION_TYPE_LABELS : QUESTION_TYPE_LABELS;
  const backLink = isPM ? "/dashboard/pm" : "/dashboard/consulting";
  const backText = isPM ? "Back to PM Companies" : "Back to Consulting Companies";

  const difficulties: (Difficulty | "all")[] = ["all", "easy", "medium", "hard"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={backLink} className="text-sm text-[#d4af37] hover:text-[#f4d03f] mb-4 inline-block">
            ← {backText}
          </Link>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt={company.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center`}>
                <span className={`text-lg font-bold ${colors.text}`}>{initials}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-display">{company.name}</h1>
              <p className="text-gray-500">{company.questionCount} practice questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent w-64"
            />

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AllQuestionTypes | "all")}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : typeLabels[type as keyof typeof typeLabels]}
                </option>
              ))}
            </select>

            {/* Frequency Filter */}
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value as Frequency | "all")}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
            >
              <option value="all">All Frequencies</option>
              <option value="high">High Frequency</option>
              <option value="medium">Medium Frequency</option>
              <option value="low">Low Frequency</option>
            </select>

            <span className="text-sm text-gray-600">
              {filteredQuestions.length} questions
            </span>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-28">
                  Frequency
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-40">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider w-44">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-100">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{question.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{question.description}</div>
                  </td>
                  <td className="px-6 py-4 w-28">
                    {question.frequency ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${FREQUENCY_COLORS_DARK[question.frequency]}`}>
                        {FREQUENCY_LABELS[question.frequency]}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 w-40">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${ALL_TYPE_COLORS_DARK[question.type]}`}>
                      {typeLabels[question.type as keyof typeof typeLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 w-44">
                    <div className="flex gap-2">
                      <Link
                        href={`/learn/${question.id}`}
                        className="inline-flex items-center px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 transition-all border border-gray-200"
                      >
                        Learn
                      </Link>
                      <Link
                        href={`/practice/${question.id}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
                      >
                        Practice
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQuestions.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-600">
              No questions match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
