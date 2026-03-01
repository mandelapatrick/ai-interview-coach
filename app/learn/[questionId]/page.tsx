import Link from "next/link";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, PM_QUESTION_TYPE_LABELS, PMQuestionType } from "@/types";
import LearnFlow from "@/components/LearnFlow";

const DIFFICULTY_COLORS_DARK: Record<string, string> = {
  easy: "text-green-600 bg-green-400/10",
  medium: "text-[#d4af37] bg-[#d4af37]/10",
  hard: "text-red-600 bg-red-400/10",
};

export default async function LearnPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const question = getQuestionById(questionId);

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Question not found</p>
      </div>
    );
  }

  const company = getCompanyBySlug(question.companySlug);
  const isPM = question.track === "product-management";
  const typeLabel = isPM
    ? PM_QUESTION_TYPE_LABELS[question.type as PMQuestionType]
    : QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS];

  return (
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 py-2 md:px-4 md:py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/questions?track=${question.track}`}
              className="text-sm text-[#d4af37] hover:text-[#f4d03f] transition-colors"
            >
              <span className="hidden sm:inline">← Back to Question Bank</span>
              <span className="sm:hidden">← Back</span>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#d4af37]/10 text-[#d4af37]">
                Learn Mode
              </span>
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                {typeLabel}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Question Info */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-3 py-3 md:px-4 md:py-6">
          <h1 className="text-lg md:text-2xl font-bold mb-1 md:mb-2 font-display">{question.title}</h1>
          <p className="text-gray-500 text-sm md:text-base line-clamp-2 md:line-clamp-none">{question.description}</p>
        </div>
      </div>

      {/* Learn Flow (Intro → Watching → Paused → Summary) */}
      <div className="flex-1 w-full min-h-0 overflow-y-auto">
        <LearnFlow question={question} />
      </div>
    </div>
  );
}
