import Link from "next/link";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, PM_QUESTION_TYPE_LABELS, PMQuestionType } from "@/types";
import LearnFlow from "@/components/LearnFlow";

const DIFFICULTY_COLORS_DARK: Record<string, string> = {
  easy: "text-green-600 bg-green-400/10",
  medium: "text-[#4d7c0f] bg-[#c1f879]/10",
  hard: "text-red-600 bg-red-400/10",
};

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ company?: string; type?: string; style?: string }>;
}) {
  const { questionId } = await params;
  const { company, type, style } = await searchParams;
  const question = getQuestionById(questionId);

  if (!question) {
    return (
      <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
        <p className="text-gray-500">Question not found</p>
      </div>
    );
  }

  const companyData = getCompanyBySlug(question.companySlug);
  const isPM = question.track === "product-management";
  const typeLabel = isPM
    ? PM_QUESTION_TYPE_LABELS[question.type as PMQuestionType]
    : QUESTION_TYPE_LABELS[question.type as keyof typeof QUESTION_TYPE_LABELS];

  // Build back URL preserving filter params
  const backParams = new URLSearchParams();
  backParams.set("track", question.track);
  if (company) backParams.set("company", company);
  if (type) backParams.set("type", type);
  if (style) backParams.set("style", style);
  const backUrl = `/dashboard/questions?${backParams.toString()}`;

  return (
    <div className="h-screen bg-[#faf6f0] text-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-[#e8dfd4] bg-[#fdf9f4]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 py-2 md:px-4 md:py-3">
          <div className="flex items-center justify-between">
            <Link
              href={backUrl}
              className="text-sm text-[#4d7c0f] hover:text-[#3d6b0a] transition-colors"
            >
              <span className="hidden sm:inline">&larr; Back to Question Bank</span>
              <span className="sm:hidden">&larr; Back</span>
            </Link>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#c1f879]/10 text-[#1b1b1b]">
                Learn Mode
              </span>
              <span className="text-xs md:text-sm text-gray-600 hidden sm:inline">
                {typeLabel}
              </span>
              {/* Round navigation pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#6366f1] text-white">
                  Round 1 (Live)
                </span>
                <span className="px-3 py-1 text-xs font-medium rounded-full border border-[#e8dfd4] text-gray-500">
                  Round 2
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Question Info */}
      <div className="border-b border-[#e8dfd4] bg-[#f5efe6]">
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
