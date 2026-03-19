"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  { num: "01", title: "Choose a company", desc: "Select from top companies and browse their real interview questions." },
  { num: "02", title: "Practice with AI", desc: "Start a video session with our AI interviewer who guides you through the case in real time." },
  { num: "03", title: "Get your score", desc: "Receive detailed feedback on your performance with actionable improvements you can apply." },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [changing, setChanging] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (window.innerWidth <= 1080) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.step) - 1;
            setChanging(true);
            setTimeout(() => {
              setActive(idx);
              setChanging(false);
            }, 200);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-10% 0px -40% 0px" }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-section" id="how-it-works">
      <div className="how-scroll-wrapper">
        <div className="how-sticky-left">
          <span className="how-label">How it works</span>
          <span className={`how-big-number${changing ? " changing" : ""}`}>
            {steps[active].num}
          </span>
        </div>
        <div className="how-scroll-right">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => { stepRefs.current[i] = el; }}
              className={`how-step-item${i === active ? " active" : ""}`}
              data-step={i + 1}
            >
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
