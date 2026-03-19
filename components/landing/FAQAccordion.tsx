"use client";

import { useState } from "react";

const faqs = [
  {
    question: <>How realistic is the <em>AI interviewer?</em></>,
    answer: <>Our AI is trained on real interviews from top companies. It adapts to your responses, asks follow-up questions, and pushes back just like a real interviewer would. Many users say it feels <strong>indistinguishable from practicing with a real person.</strong></>,
  },
  {
    question: <>What equipment <em>do I need?</em></>,
    answer: <>Just a browser and a microphone. Ace Interview works entirely in-browser — no downloads, no installs. You can also type your answers if you prefer.</>,
  },
  {
    question: <>How is this better than <em>practicing with a partner?</em></>,
    answer: <>A practice partner can only give feedback based on their own experience. Ace Interview gives structured, consistent feedback across 6 dimensions every single time — and it&apos;s available at 2am the night before your interview.</>,
  },
  {
    question: <>What types of <em>cases are available?</em></>,
    answer: <>We cover profitability, market entry, growth strategy, M&amp;A, and operations cases from McKinsey, BCG, Bain, and 50+ other top firms. New cases are added weekly.</>,
  },
  {
    question: <>Is there <em>a free plan?</em></>,
    answer: <>Yes — you can start practicing for free today, no credit card required. The free plan includes access to a selection of real cases and full AI feedback on every session.</>,
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section">
      <span className="faq-section-label">FAQ</span>
      <div className="faq-list">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className={`faq-item${isOpen ? " open" : ""} fade-up-target`}>
              <div
                className="faq-question"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span className="faq-question-text">{faq.question}</span>
                <span className="faq-icon">{isOpen ? "-" : "+"}</span>
              </div>
              <div className="faq-answer">
                <p className="faq-answer-inner">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
