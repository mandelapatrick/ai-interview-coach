"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getCompanyBySlug } from "@/data/companies";
import { getQuestionsByCompany } from "@/data/questions";
import {
  QuestionType,
  Difficulty,
  QUESTION_TYPE_LABELS,
} from "@/types";

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

const DIFFICULTY_COLORS_DARK: Record<Difficulty, string> = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  hard: "text-red-400 bg-red-400/10",
};

const TYPE_COLORS_DARK: Record<QuestionType, string> = {
  profitability: "text-blue-400 bg-blue-400/10",
  "market-entry": "text-purple-400 bg-purple-400/10",
  "market-sizing": "text-cyan-400 bg-cyan-400/10",
  "m&a": "text-orange-400 bg-orange-400/10",
  operations: "text-gray-400 bg-gray-400/10",
  "growth-strategy": "text-emerald-400 bg-emerald-400/10",
  pricing: "text-pink-400 bg-pink-400/10",
  "competitive-response": "text-indigo-400 bg-indigo-400/10",
};

export default function CompanyQuestionsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const company = getCompanyBySlug(slug);
  const allQuestions = getQuestionsByCompany(slug);

  const [typeFilter, setTypeFilter] = useState<QuestionType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const matchesType = typeFilter === "all" || q.type === typeFilter;
      const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter;
      const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesDifficulty && matchesSearch;
    });
  }, [allQuestions, typeFilter, difficultyFilter, searchQuery]);

  if (!company) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <p className="text-gray-400">Company not found</p>
      </div>
    );
  }

  const colors = companyColors[slug] || { bg: "bg-gray-600", text: "text-white" };
  const initials = companyInitials[slug] || company.name.charAt(0);
  const logoUrl = company.logoUrl;

  const questionTypes: (QuestionType | "all")[] = [
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

  const difficulties: (Difficulty | "all")[] = ["all", "easy", "medium", "hard"];

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Companies
          </Link>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="w-16 h-16 flex items-center justify-center">
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
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <p className="text-gray-400">{company.questionCount} practice questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as QuestionType | "all")}
              className="px-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {questionTypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : QUESTION_TYPE_LABELS[type]}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | "all")}
              className="px-4 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === "all" ? "All Difficulties" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>

            <span className="text-sm text-gray-400">
              {filteredQuestions.length} questions
            </span>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-[#2a2a2a] rounded-xl border border-[#3a3a3a] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#232323] border-b border-[#3a3a3a]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3a3a3a]">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-[#323232]">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{question.title}</div>
                    <div className="text-sm text-gray-400 mt-1">{question.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS_DARK[question.type]}`}>
                      {QUESTION_TYPE_LABELS[question.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${DIFFICULTY_COLORS_DARK[question.difficulty]}`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/practice/${question.id}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Practice
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredQuestions.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-400">
              No questions match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
