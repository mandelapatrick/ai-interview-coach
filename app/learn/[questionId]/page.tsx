import Link from "next/link";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, PM_QUESTION_TYPE_LABELS, PMQuestionType } from "@/types";
import LearnFlow from "@/components/LearnFlow";

const DIFFICULTY_COLORS_DARK: Record<string, string> = {
  easy: "text-green-400 bg-green-400/10",
  medium: "text-[#d4af37] bg-[#d4af37]/10",
  hard: "text-red-400 bg-red-400/10",
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-white/60">Question not found</p>
      </div>
    );
  }

  const company = getCompanyBySlug(question.companySlug);
  const isPM = question.track === "product-management";
  const typeLabel = isPM
    ? PM_QUESTION_TYPE_LABELS[question.type as PMQuestionType]
    : QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS];

  return (
    <div className="h-screen bg-[#0f172a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f172a]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/company/${question.companySlug}`}
              className="text-sm text-[#d4af37] hover:text-[#f4d03f] transition-colors"
            >
              ← Back to {company?.name}
            </Link>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-400/10 text-violet-400">
                Learn Mode
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${DIFFICULTY_COLORS_DARK[question.difficulty]}`}>
                {question.difficulty}
              </span>
              <span className="text-sm text-white/50">
                {typeLabel}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Question Info */}
      <div className="border-b border-white/10 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2 font-display">{question.title}</h1>
          <p className="text-white/60">{question.description}</p>
        </div>
      </div>

      {/* Learn Flow (Intro → Watching → Paused → Summary) */}
      <div className="flex-1 w-full min-h-0 overflow-hidden">
        <LearnFlow question={question} />
      </div>
    </div>
  );
}
