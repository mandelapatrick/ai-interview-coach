import Link from "next/link";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, PM_QUESTION_TYPE_LABELS, PMQuestionType } from "@/types";
import PracticeFlow from "@/components/PracticeFlow";

const DIFFICULTY_COLORS_DARK: Record<string, string> = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-[#d4af37] bg-[#d4af37]/10",
  hard: "text-red-400 bg-red-400/10",
};

export default async function PracticePage({
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
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/questions?track=${question.track}`}
              className="text-sm text-[#d4af37] hover:text-[#f4d03f] transition-colors"
            >
              ← Back to Question Bank
            </Link>
            <span className="text-sm text-gray-400">
              {typeLabel}
            </span>
          </div>
        </div>
      </header>

      {/* Question Info */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2 font-display">{question.title}</h1>
          <p className="text-gray-500">{question.description}</p>
        </div>
      </div>

      {/* Practice Flow (Mode Selection → Lobby → Session) */}
      <div className="flex-1 w-full min-h-0 overflow-hidden">
        <PracticeFlow question={question} />
      </div>
    </div>
  );
}
