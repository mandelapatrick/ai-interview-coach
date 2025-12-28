import Link from "next/link";
import { getQuestionById } from "@/data/questions";
import { getCompanyBySlug } from "@/data/companies";
import { QUESTION_TYPE_LABELS, DIFFICULTY_COLORS } from "@/types";
import VoiceSession from "@/components/VoiceSession";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const question = getQuestionById(questionId);

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Question not found</p>
      </div>
    );
  }

  const company = getCompanyBySlug(question.companySlug);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/company/${question.companySlug}`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to {company?.name}
            </Link>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${DIFFICULTY_COLORS[question.difficulty]}`}>
                {question.difficulty}
              </span>
              <span className="text-sm text-gray-500">
                {QUESTION_TYPE_LABELS[question.type]}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Question Info */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
          <p className="text-gray-400">{question.description}</p>
        </div>
      </div>

      {/* Voice Session */}
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <VoiceSession question={question} />
      </div>
    </div>
  );
}
