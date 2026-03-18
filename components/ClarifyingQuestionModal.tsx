"use client";

import { useState } from "react";

interface ClarifyingQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (question: string) => Promise<void>;
}

export default function ClarifyingQuestionModal({
  isOpen,
  onClose,
  onSubmit,
}: ClarifyingQuestionModalProps) {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(question.trim());
      setQuestion("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const exampleQuestions = [
    "Why did you choose that particular framework?",
    "Can you elaborate on your prioritization logic?",
    "What other approaches did you consider?",
    "How would you handle pushback from stakeholders?",
  ];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-[#fdf9f4] rounded-xl p-6 max-w-lg w-full mx-4 border border-[#e8dfd4]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Ask a Clarifying Question
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          The interview will pause while you ask a question. The expert candidate
          will respond to help you understand their approach.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none"
            rows={3}
            autoFocus
          />

          {/* Example questions */}
          <div className="mt-4">
            <p className="text-xs text-gray-600 mb-2">Example questions:</p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((example, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuestion(example)}
                  className="px-3 py-1.5 text-xs bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-full hover:bg-[#8b5cf6]/20 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#fdf9f4] text-gray-900 rounded-full hover:bg-[#f5efe6] transition-all border border-[#e8dfd4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!question.trim() || isSubmitting}
              className="px-4 py-2 bg-[#6366f1] text-white rounded-full hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  Ask Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
