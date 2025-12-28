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
  DIFFICULTY_COLORS,
  TYPE_COLORS,
} from "@/types";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Company not found</p>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Companies
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{company.logo}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600">{company.questionCount} practice questions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as QuestionType | "all")}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff === "all" ? "All Difficulties" : diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>

            <span className="text-sm text-gray-500">
              {filteredQuestions.length} questions
            </span>
          </div>
        </div>
      </div>

      {/* Questions Table */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{question.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{question.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[question.type]}`}>
                      {QUESTION_TYPE_LABELS[question.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${DIFFICULTY_COLORS[question.difficulty]}`}>
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
            <div className="px-6 py-12 text-center text-gray-500">
              No questions match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
