import Link from "next/link";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, PM_QUESTION_TYPE_LABELS, PMQuestionType } from "@/types";
import PracticeFlow from "@/components/PracticeFlow";

const DIFFICULTY_COLORS_DARK: Record<string, string> = {
  easy: "text-green-600 bg-green-400/10",
  medium: "text-[#4d7c0f] bg-[#c1f879]/10",
  hard: "text-red-600 bg-red-400/10",
};

export default async function PracticePage({
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="h-screen bg-gray-50 text-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={backUrl}
              className="text-sm text-[#4d7c0f] hover:text-[#3d6b0a] transition-colors"
            >
              ← Back to Question Bank
            </Link>
            <span className="text-sm text-gray-600">
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
      <div className="flex-1 w-full min-h-0 overflow-y-auto">
        <PracticeFlow question={question} />
      </div>
    </div>
  );
}
