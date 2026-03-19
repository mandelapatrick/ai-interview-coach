import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import TrackedCTALink from "@/components/TrackedCTALink";
import NavBar from "@/components/landing/NavBar";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQAccordion from "@/components/landing/FAQAccordion";
import ScrollReveal from "@/components/landing/ScrollReveal";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen" style={{ background: "#fcfaf6" }}>
      <ScrollReveal />
      <NavBar />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden px-6 md:px-[60px]" style={{ background: "linear-gradient(to bottom, #fcfaf6, #ede6d4)", paddingTop: "16px", paddingBottom: "60px" }}>
        <div className="flex flex-col md:flex-row items-center justify-between max-w-[1350px] mx-auto md:min-h-[774px]">
          {/* Left: content */}
          <div className="flex flex-col justify-end gap-[33px] flex-shrink-0 h-auto md:h-[774px] pt-20 md:pt-0 w-full md:w-auto max-md:items-center">
            <h1 className="font-display font-normal text-[#1b1b1b] text-[36px] md:text-[60px] lg:text-[81px] leading-[1.3] w-full md:w-[619px]">
              Master your interview with AI
            </h1>
            <p className="font-sans font-normal text-[18px] leading-[29.7px] text-[#1b1b1b] max-w-[580px]">
              Practice with a real AI interviewer — that adapts, challenges, and gives instant feedback after every session.
            </p>
            <div className="flex flex-col sm:flex-row gap-[33px] items-center sm:items-center h-auto sm:h-[60px]">
              <TrackedCTALink
                href="/api/auth/signin"
                location="hero"
                className="inline-flex items-center gap-2 bg-[#c1f879] text-[#1b1b1b] font-display font-normal text-[20px] h-[60px] px-8 rounded-full no-underline transition-opacity hover:opacity-[0.88] active:scale-[0.97] whitespace-nowrap"
              >
                <Image src="/landing/sparkles.svg" alt="" width={24} height={24} />
                <em className="font-display italic font-medium">start</em> practicing free
              </TrackedCTALink>

            </div>
          </div>

          {/* Right: Image cards — hidden on mobile */}
          <div className="hidden md:block relative flex-1 h-[640px] min-w-0">
            {/* AI Interviewer card */}
            <div className="absolute top-0 rounded-2xl bg-[#ccf2fb] overflow-hidden z-[2]" style={{ left: "-91px", width: "520px", height: "360px" }}>
              <Image
                src="/landing/picture.png"
                alt="AI Interviewer"
                width={480}
                height={320}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 object-cover object-top"
                style={{ width: "480px", height: "320px" }}
                priority
              />
              <div className="absolute flex items-center gap-1.5 bg-[#fcfaf6] px-4 py-2 rounded-full z-[3]" style={{ top: "307px", left: "40px" }}>
                <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><path d="M4.5 0L5.2 3.2L8.1 1.5L6 4L9 5L6 6L8.1 8.5L5.2 6.8L4.5 10L3.8 6.8L0.9 8.5L3 6L0 5L3 4L0.9 1.5L3.8 3.2L4.5 0Z" fill="#1e4635"/></svg>
                <span className="font-display text-[18px] text-[#1e4635] leading-[1.3]"><em className="italic">AI</em> interviewer</span>
              </div>
            </div>

            {/* Expert Candidate card */}
            <div className="absolute rounded-2xl overflow-hidden" style={{ top: "279px", left: "181px", width: "520px", height: "360px" }}>
              <Image
                src="/landing/user-pic-1.png"
                alt="Expert Candidate"
                fill
                className="object-cover rounded-2xl"
                priority
              />
              <div className="absolute flex items-center gap-1.5 bg-[#fcfaf6] px-4 py-2 rounded-full z-[3]" style={{ top: "22px", right: "10px" }}>
                <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><path d="M4.5 0L5.2 3.2L8.1 1.5L6 4L9 5L6 6L8.1 8.5L5.2 6.8L4.5 10L3.8 6.8L0.9 8.5L3 6L0 5L3 4L0.9 1.5L3.8 3.2L4.5 0Z" fill="#1e4635"/></svg>
                <span className="font-display text-[18px] text-[#1e4635] leading-[1.3]"><em className="italic">Expert Candidate</em></span>
              </div>
              {/* Progress bar */}
              <div className="absolute left-[21px] right-[10px] h-[7px]" style={{ bottom: "17px" }}>
                <div className="absolute top-[3px] left-0 right-0 h-[7px] bg-white rounded-full" />
                <div className="absolute top-[3px] left-0 w-[9%] h-[7px] bg-[#10d7f6] rounded-full" />
                <div className="absolute w-[13px] h-[13px] bg-[#10d7f6] rounded-full border-2 border-white" style={{ left: "46px", top: "0px" }} />
              </div>
            </div>

            {/* Tooltip: Filler Words */}
            <div className="hero-tooltip" style={{ top: "69px", left: "389px" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#ef8660] flex-shrink-0" />
                <span className="font-display font-semibold text-[12px] leading-[1.3] text-[#ef8660]">Filler Words Detected</span>
              </div>
              <span className="font-sans font-normal text-[10px] leading-[1.3] text-black">&ldquo;Umm&rdquo; used 6 times —<br />pause instead to signal confidence</span>
            </div>

            {/* Tooltip: Candidate-Led */}
            <div className="hero-tooltip" style={{ top: "174px", left: "452px" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#1e4635] flex-shrink-0" />
                <span className="font-display font-semibold text-[12px] leading-[1.3] text-[#1e4635]">Candidate-Led</span>
              </div>
              <span className="font-sans font-normal text-[10px] leading-[1.3] text-black">You&apos;re driving the case proactively —<br />not waiting to be guided</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <div className="border-t border-b border-[rgba(27,27,27,0.1)] flex items-center">
        <div className="max-w-[1440px] mx-auto px-6 md:px-[100px] py-[25px] flex items-center gap-7 w-full flex-wrap">
          <div className="flex items-end gap-[9px] whitespace-nowrap flex-shrink-0 px-3 py-1.5">
            <span className="font-display italic font-normal text-[15px] text-[rgba(27,27,27,0.5)]">trusted by</span>
            <span className="font-sans font-normal text-[15px] text-[rgba(27,27,27,0.5)]">candidates at top companies</span>
          </div>
          <div className="flex items-center gap-14 flex-wrap">
            {["Google", "Amazon", "McKinsey", "Goldman Sachs", "Meta", "Microsoft"].map((c) => (
              <span key={c} className="font-sans font-semibold text-[16px] tracking-[0.5px] text-[#1b1b1b]">{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" className="bg-[#fcfaf6]">
        {/* Header */}
        <div className="text-center pt-[120px] px-6 md:px-[100px] flex flex-col items-center gap-5 fade-up">
          <p className="font-sans font-semibold text-[13px] tracking-[2px] uppercase text-[rgba(27,27,27,0.4)]">features</p>
          <h2 className="font-display font-normal text-[30px] md:text-[56px] leading-[1.1] tracking-[-1px] text-[#1b1b1b]">
            Everything you need<br />to <em className="italic">ace your interview</em>
          </h2>
        </div>

        {/* Row 1: Real cases */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 justify-center px-6 md:px-[100px] py-12 md:py-20 border-b border-[rgba(27,27,27,0.06)] fade-up">
          <FeatureText
            pill={{ bg: "#c1f879", color: "#1e4635", icon: "/landing/book-opened-page.svg", label: "Real cases" }}
            title={<>Practice on <em className="italic">real questions</em></>}
            desc="Actual questions from McKinsey, BCG, Bain, and 50+ top firms across industries. Not invented problems — the real ones."
          />
          <div className="bg-[#f7f2e8] border border-[rgba(64,64,64,0.08)] rounded-[20px] shadow-[0_8px_48px_0_rgba(27,27,27,0.05)] w-full md:w-[677px] flex-shrink-0 overflow-hidden">
            <div className="p-[41px] flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#ccf2fb] text-[#0c546e] flex items-center justify-center font-sans font-bold text-[13px] flex-shrink-0">M</div>
                <div>
                  <div className="font-sans font-semibold text-[15px] text-[#1b1b1b]">McKinsey &amp; Company</div>
                  <div className="font-sans font-normal text-[13px] text-[rgba(27,27,27,0.45)]">Strategy &bull; 2024 &bull; Senior</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[12px] font-sans font-medium bg-[#c1f879] text-[#1e4635]">Retail</span>
                <span className="px-3 py-1 rounded-full text-[12px] font-sans font-medium bg-[#e8d3f8] text-[#431269]">Profitability</span>
                <span className="px-3 py-1 rounded-full text-[12px] font-sans font-medium bg-[#f4b594] text-[#6f260b]">Advanced</span>
              </div>
              <p className="font-display italic font-normal text-[20px] leading-[1.55] text-[#1b1b1b]">
                &ldquo;Your client is a European grocery chain losing market share in urban centers. Revenue has dropped 12% over two years. Where do you start?&rdquo;
              </p>
              <div className="border-t border-[rgba(64,64,64,0.06)] pt-[17px] font-sans font-normal text-[13px] text-[rgba(27,27,27,0.4)]">
                Based on actual McKinsey case interview, 2023
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Live session (reversed) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-20 justify-center px-6 md:px-[100px] py-12 md:py-20 border-b border-[rgba(27,27,27,0.06)] fade-up">
          <FeatureText
            pill={{ bg: "#ccf2fb", color: "#0c546e", icon: "/landing/video-circle-dashed.svg", label: "Live session" }}
            title={<>Interview under <em className="italic">real pressure</em></>}
            desc="Speak naturally with an AI interviewer in real time — same pressure, same dynamic, same flow as an actual interview room."
          />
          <div className="bg-[#f7f2e8] border border-[rgba(64,64,64,0.08)] rounded-[20px] shadow-[0_8px_48px_0_rgba(27,27,27,0.05)] w-full md:w-[483px] flex-shrink-0 overflow-hidden relative h-[428px]">
            <div className="absolute top-10 left-10 right-10 flex justify-between items-center">
              <div className="flex items-center gap-[7px] bg-[#f4b594] px-3 py-[5px] rounded-full">
                <div className="w-[7px] h-[7px] bg-[#ef8660] rounded-full" />
                <span className="font-sans font-semibold text-[12px] text-[#6f260b]">Live</span>
              </div>
              <span className="font-sans font-medium text-[13px] text-[rgba(27,27,27,0.4)]">4:23 elapsed</span>
            </div>
            <div className="absolute top-[85px] left-10 right-10 flex flex-col gap-2.5">
              <div className="bg-[rgba(27,27,27,0.05)] text-[rgba(27,27,27,0.7)] self-start px-4 py-3 rounded-xl font-sans text-[14px] leading-[1.5] max-w-[85%]">
                &ldquo;Before you give me a structure, what&apos;s your initial hypothesis about where the problem might be?&rdquo;
              </div>
              <div className="bg-[#c1f879] text-[#1e4635] self-end px-4 py-3 rounded-xl font-sans text-[14px] leading-[1.5] max-w-[85%]">
                My hypothesis is that this is a revenue issue, likely driven by volume decline rather than pricing…
              </div>
              <div className="bg-[rgba(27,27,27,0.05)] text-[rgba(27,27,27,0.7)] self-start px-4 py-3 rounded-xl font-sans text-[14px] leading-[1.5] max-w-[85%]">
                &ldquo;Interesting. What signals are you seeing that point to volume?&rdquo;
              </div>
            </div>
            <div className="absolute top-[361px] left-10 bg-[rgba(27,27,27,0.04)] px-3.5 py-2.5 rounded-xl flex gap-[5px] items-center">
              <span className="w-[5px] h-[5px] bg-[rgba(27,27,27,0.3)] rounded-full" />
              <span className="w-[5px] h-[5px] bg-[rgba(27,27,27,0.3)] rounded-full" />
              <span className="w-[5px] h-[5px] bg-[rgba(27,27,27,0.3)] rounded-full" />
            </div>
          </div>
        </div>

        {/* Row 3: Feedback */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 justify-center px-6 md:px-[100px] py-12 md:py-20 border-b border-[rgba(27,27,27,0.06)] fade-up">
          <FeatureText
            pill={{ bg: "#e8d3f8", color: "#431269", icon: "/landing/thumb-up-02.svg", label: "Feedback" }}
            title={<>Scored across <em className="italic">6<br />dimensions</em></>}
            desc="Every session scored on structure, problem solving, communication, math, business intuition, and creativity — so you know exactly what to fix."
          />
          <div className="bg-[#f7f2e8] border border-[rgba(64,64,64,0.08)] rounded-[20px] shadow-[0_8px_48px_0_rgba(27,27,27,0.05)] w-full md:w-[677px] flex-shrink-0 overflow-hidden">
            <div className="p-[41px] flex flex-col gap-7">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-display font-normal text-[22px] text-[#1b1b1b]">Performance assessment</div>
                  <div className="font-sans font-normal text-[13px] text-[rgba(27,27,27,0.45)] mt-1.5">McKinsey &bull; Case interview &bull; 12 min</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-normal text-[48px] leading-none text-[#1b1b1b]">4.2</div>
                  <div className="font-sans font-normal text-[12px] text-[rgba(27,27,27,0.4)] mt-1">overall / 5</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: "Structure", score: "4.5", pct: 90, barColor: "#c1f879", tag: "strong", tagBg: "#c1f879", tagColor: "#1e4635" },
                  { name: "Problem solving", score: "3.8", pct: 76, barColor: "#ef8660", tag: "needs work", tagBg: "#f4b594", tagColor: "#6f260b" },
                  { name: "Communication", score: "4.7", pct: 94, barColor: "#ca9aee", tag: "excellent", tagBg: "#e8d3f8", tagColor: "#431269" },
                  { name: "Biz intuition", score: "3.5", pct: 70, barColor: "#ef8660", tag: "improve", tagBg: "#f4b594", tagColor: "#6f260b" },
                  { name: "Math & analytics", score: "4.0", pct: 80, barColor: "#c1f879", tag: "solid", tagBg: "#c1f879", tagColor: "#1e4635" },
                  { name: "Creativity", score: "4.8", pct: 96, barColor: "#0c546e", tag: "exceptional", tagBg: "#e8d3f8", tagColor: "#431269" },
                ].map((cat) => (
                  <div key={cat.name} className="bg-[rgba(64,64,64,0.02)] p-4 rounded-xl flex flex-col gap-2.5">
                    <div className="flex justify-between items-center">
                      <span className="font-sans font-semibold text-[13px] text-[#1b1b1b]">{cat.name}</span>
                      <span className="font-display font-normal text-[16px] text-[#1b1b1b]">{cat.score}</span>
                    </div>
                    <div className="bg-[rgba(64,64,64,0.06)] h-[5px] rounded-[3px] overflow-hidden">
                      <div className="h-[5px] rounded-[3px]" style={{ width: `${cat.pct}%`, background: cat.barColor }} />
                    </div>
                    <span className="inline-flex self-start px-2 py-[3px] rounded-full font-sans font-medium text-[11px]" style={{ background: cat.tagBg, color: cat.tagColor }}>{cat.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Adaptive (reversed) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-20 justify-center px-6 md:px-[100px] py-12 md:py-20 border-b border-[rgba(27,27,27,0.06)] fade-up">
          <FeatureText
            pill={{ bg: "#c1f879", color: "#1e4635", icon: "/landing/leaf.svg", label: "Adaptive" }}
            title={<>Questions that <em className="italic">adapt to you</em></>}
            desc="The AI adjusts complexity in real time based on how you're performing — just like a real interviewer would."
          />
          <div className="bg-[#f7f2e8] border border-[rgba(64,64,64,0.08)] rounded-[20px] shadow-[0_8px_48px_0_rgba(27,27,27,0.05)] w-full md:w-[483px] flex-shrink-0 overflow-hidden relative h-[385px]">
            <div className="absolute top-10 left-10 right-10 font-sans font-semibold text-[12px] tracking-[1px] uppercase text-[rgba(27,27,27,0.35)]">Session progression</div>
            {[
              { top: 71, badge: "R1", badgeBg: "#c1f879", badgeColor: "#1e4635", label: "Round 1 • Easy", q: "\"A client's revenue dropped 15% — what are the possible causes?\"" },
              { top: 162, badge: "R2", badgeBg: "#fde68a", badgeColor: "#92400e", label: "Round 2 • Medium — AI increased difficulty", q: "\"Now isolate the biggest driver. What data would you ask for?\"" },
              { top: 253, badge: "R3", badgeBg: "#f4b594", badgeColor: "#6f260b", label: "Round 3 • Hard — You're doing well", q: "\"The data shows volume dropped in Q3 only. Refine your hypothesis.\"" },
            ].map((r) => (
              <div key={r.badge} className="absolute left-10 right-10 flex gap-4 items-start py-4 border-b border-[rgba(64,64,64,0.06)]" style={{ top: `${r.top}px` }}>
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center font-sans font-bold text-[11px] flex-shrink-0" style={{ background: r.badgeBg, color: r.badgeColor }}>{r.badge}</div>
                <div>
                  <div className="font-sans font-semibold text-[12px] text-[rgba(27,27,27,0.4)]">{r.label}</div>
                  <div className="font-display italic font-normal text-[14px] leading-[1.4] text-[#1b1b1b] mt-[3px]">{r.q}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 5: Learn mode */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 justify-center px-6 md:px-[100px] py-12 md:py-20 border-b border-[rgba(27,27,27,0.06)] fade-up">
          <FeatureText
            pill={{ bg: "#f4b594", color: "#6f260b", icon: "/landing/eyeglasses.svg", label: "Learn mode" }}
            title={<>Study before you <em className="italic">practice</em></>}
            desc="Browse frameworks, techniques, and mental models — so you step into every session with structure and confidence."
          />
          <div className="bg-[#f7f2e8] border border-[rgba(64,64,64,0.08)] rounded-[20px] shadow-[0_8px_48px_0_rgba(27,27,27,0.05)] w-full md:w-[677px] flex-shrink-0 overflow-hidden">
            <div className="p-[41px] flex flex-col gap-5">
              <div className="flex gap-1.5 mb-5">
                <div className="px-3.5 py-1.5 rounded-full font-sans font-medium text-[13px] bg-[#f4b594] text-[#6f260b]">Frameworks</div>
                <div className="px-3.5 py-1.5 rounded-full font-sans font-medium text-[13px] text-[rgba(27,27,27,0.45)]">Concepts</div>
                <div className="px-3.5 py-1.5 rounded-full font-sans font-medium text-[13px] text-[rgba(27,27,27,0.45)]">Examples</div>
              </div>
              <div className="rounded-[14px] p-[25px] flex flex-col gap-1.5 border border-[rgba(239,134,96,0.15)] bg-[rgba(239,134,96,0.06)]">
                <div className="font-sans font-bold text-[11px] tracking-[1.5px] uppercase text-[#ef8660]">Framework</div>
                <div className="font-display font-normal text-[22px] text-[#1b1b1b]">Issue Tree</div>
                <div className="flex gap-2 flex-wrap mt-1">
                  {["Revenue", "Cost", "Market share", "Profitability"].map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full text-[12px] font-sans font-medium bg-[#e8d3f8] text-[#431269]">{t}</span>
                  ))}
                </div>
                <div className="font-sans font-normal text-[14px] leading-[1.5] text-[rgba(27,27,27,0.55)] mt-2">A structured breakdown to identify and isolate root causes in any business problem. Start with a hypothesis, then branch down.</div>
              </div>
              <div className="flex gap-2 mt-2">
                {["4Cs Framework", "Porter's 5 Forces", "Unit Economics"].map((f) => (
                  <div key={f} className="bg-[rgba(27,27,27,0.03)] p-3 rounded-[10px] flex-1 text-center font-sans font-medium text-[13px] text-[rgba(27,27,27,0.55)]">{f}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 6: History (reversed) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-20 justify-center px-6 md:px-[100px] py-12 md:py-20 border-b border-[rgba(27,27,27,0.06)] fade-up">
          <FeatureText
            pill={{ bg: "#ccf2fb", color: "#0c546e", icon: "/landing/clock-coundown.svg", label: "History" }}
            title={<>Track your <em className="italic">progress over time</em></>}
            desc="Every session is saved. Review your feedback, compare scores across attempts, and see exactly how far you've come."
          />
          <div className="bg-[#f7f2e8] border border-[rgba(64,64,64,0.08)] rounded-[20px] shadow-[0_8px_48px_0_rgba(27,27,27,0.05)] w-full md:w-[483px] flex-shrink-0 overflow-hidden relative h-[405px]">
            <div className="absolute top-10 left-10 right-10 flex justify-between items-center">
              <div className="font-display font-normal text-[20px] text-[#1b1b1b]">Recent sessions</div>
              <div className="font-sans font-medium text-[13px] text-[rgba(27,27,27,0.4)]">Last 30 days ↓</div>
            </div>
            {[
              { top: 84, logo: "M", logoBg: "#c1f879", logoColor: "#1e4635", company: "McKinsey & Company", meta: "Profitability • 12 min • Mar 10", score: "4.2" },
              { top: 154, logo: "BCG", logoBg: "#ccf2fb", logoColor: "#0c546e", company: "BCG", meta: "Market entry • 8 min • Mar 7", score: "3.9" },
              { top: 224, logo: "B", logoBg: "#f4b594", logoColor: "#6f260b", company: "Bain & Company", meta: "Growth strategy • 11 min • Mar 4", score: "4.5" },
              { top: 294, logo: "G", logoBg: "#e8d3f8", logoColor: "#431269", company: "Google", meta: "Product strategy • 9 min • Feb 28", score: "4.0", noBorder: true },
            ].map((s) => (
              <div key={s.company} className={`absolute left-10 right-10 flex items-center gap-4 py-3.5 ${s.noBorder ? "" : "border-b border-[rgba(64,64,64,0.06)]"}`} style={{ top: `${s.top}px` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-sans font-bold text-[11px] flex-shrink-0" style={{ background: s.logoBg, color: s.logoColor }}>{s.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans font-semibold text-[14px] text-[#1b1b1b]">{s.company}</div>
                  <div className="font-sans font-normal text-[12px] text-[rgba(27,27,27,0.45)]">{s.meta}</div>
                </div>
                <div className="font-display font-normal text-[22px] text-[#1b1b1b] text-right leading-none ml-auto flex-shrink-0">
                  {s.score}<span className="block font-sans font-normal text-[11px] text-[rgba(27,27,27,0.35)] text-center">/ 5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <HowItWorks />

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-[#fcfaf6] py-[120px] px-6 md:px-[100px]">
        <h2 className="font-display font-normal text-[32px] md:text-[56px] leading-[1.15] tracking-[-1px] text-[#1b1b1b] text-center mb-16 fade-up">
          What our users <em className="italic">say</em>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1240px] mx-auto fade-up">
          {[
            {
              bg: "bg-[#ccf2fb]",
              quote: "Practicing with ace felt more realistic than any mock interview I've done. The AI pushed me on weak spots I didn't even know I had.",
              name: "Sarah Chen",
              role: "Incoming analyst, Goldman Sachs",
              initial: "S",
              avatarBg: "#0c546e",
            },
            {
              bg: "bg-[#e8d3f8]",
              quote: "The scoring breakdown after each session was a game-changer. I could see exactly where to improve and track my progress over time.",
              name: "Marcus Okafor",
              role: "Associate, McKinsey & Company",
              initial: "M",
              avatarBg: "#431269",
            },
            {
              bg: "bg-[#f4b594]",
              quote: "I used ace for two weeks before my Google interview. The adaptive questions prepared me for the real thing better than anything else.",
              name: "Aisha Patel",
              role: "Product Manager, Google",
              initial: "A",
              avatarBg: "#6f260b",
            },
          ].map((t) => (
            <div key={t.name} className={`${t.bg} rounded-2xl p-[41px] flex flex-col gap-6`}>
              <div className="flex gap-[5px]">
                {[...Array(5)].map((_, i) => (
                  <Image key={i} src="/landing/star-asterisk.svg" alt="" width={22} height={24} />
                ))}
              </div>
              <p className="font-sans font-normal text-[16px] leading-[1.7] text-[#1b1b1b]">{t.quote}</p>
              <div className="flex items-center gap-3.5 pt-2">
                <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center font-sans font-semibold text-[16px] text-[#fcfaf6] flex-shrink-0" style={{ background: t.avatarBg }}>{t.initial}</div>
                <div>
                  <div className="font-sans font-semibold text-[15px] text-[#1b1b1b]">{t.name}</div>
                  <div className="font-sans font-normal text-[13px] text-[rgba(27,27,27,0.5)]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <FAQAccordion />

      {/* ─── FINAL CTA ─── */}
      <section className="bg-[#1E4635] px-10 py-[120px] text-center flex flex-col items-center">
        <div className="flex flex-col items-center gap-5 max-w-[720px] w-full">
          <h2 className="font-display font-normal text-[32px] md:text-[56px] leading-[1.12] tracking-[-1px] text-[#fcfaf6]">
            Stop preparing alone.<br />Start practicing <em className="italic">for real.</em>
          </h2>
          <p className="font-sans text-[18px] leading-[1.6] text-[rgba(252,250,246,0.65)] max-w-[480px] pb-5">
            Join thousands of candidates who landed their dream job after practicing with ace.
          </p>
          <TrackedCTALink
            href="/api/auth/signin"
            location="bottom-cta"
            className="inline-flex items-center gap-2 bg-[#c1f879] text-[#1b1b1b] font-display font-normal text-[20px] h-[60px] px-8 rounded-full no-underline transition-opacity hover:opacity-[0.88]"
          >
            <Image src="/landing/sparkles.svg" alt="" width={24} height={24} />
            <em className="font-display italic font-medium">start</em> practicing free
          </TrackedCTALink>
          <span className="font-sans text-[13px] text-[rgba(252,250,246,0.4)]">No credit card required</span>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#1B1B1B] relative overflow-hidden">
        {/* Background SVG watermark */}
        <Image
          src="/landing/logo_footer.svg"
          alt=""
          width={700}
          height={300}
          className="absolute bottom-[-30px] left-[-10px] w-[700px] mix-blend-overlay pointer-events-none select-none"
          aria-hidden="true"
        />

        <div className="max-w-[1440px] mx-auto px-6 md:px-[100px] pt-20 flex gap-[60px] relative z-[1] flex-wrap">
          {/* Brand */}
          <div className="flex-1">
            <p className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.45)] leading-[1.65] max-w-[280px]">
              AI-powered interview practice that adapts to you. Get real feedback, track your progress, and land the job you deserve.
            </p>
          </div>
          {/* Product */}
          <div className="w-[236px] flex-shrink-0">
            <p className="font-sans font-semibold text-[13px] tracking-[1px] uppercase text-[rgba(252,250,246,0.35)] mb-6">product</p>
            <div className="flex flex-col gap-3.5">
              <a href="#features" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">features</a>
              <Link href="/pricing" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">pricing</Link>
              <a href="#features" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">case library</a>
              <a href="#features" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">companies</a>
            </div>
          </div>
          {/* Resources */}
          <div className="w-[236px] flex-shrink-0">
            <p className="font-sans font-semibold text-[13px] tracking-[1px] uppercase text-[rgba(252,250,246,0.35)] mb-6">resources</p>
            <div className="flex flex-col gap-3.5">
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">blog</a>
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">interview guides</a>
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">help center</a>
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">community</a>
            </div>
          </div>
          {/* Company */}
          <div className="w-[236px] flex-shrink-0">
            <p className="font-sans font-semibold text-[13px] tracking-[1px] uppercase text-[rgba(252,250,246,0.35)] mb-6">company</p>
            <div className="flex flex-col gap-3.5">
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">about</a>
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">careers</a>
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">contact</a>
              <a href="#" className="font-sans font-normal text-[14px] text-[rgba(252,250,246,0.65)] no-underline transition-colors hover:text-[rgba(252,250,246,0.9)]">press</a>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto mt-16 px-6 md:px-[100px] py-[25px] pb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-t border-[rgba(252,250,246,0.08)] relative z-[1] gap-4">
          <p className="font-sans font-normal text-[13px] text-[rgba(252,250,246,0.3)]">© {new Date().getFullYear()} ace interview. all rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="font-sans font-normal text-[13px] text-[rgba(252,250,246,0.3)] no-underline transition-colors hover:text-[rgba(252,250,246,0.7)]">privacy policy</a>
            <a href="#" className="font-sans font-normal text-[13px] text-[rgba(252,250,246,0.3)] no-underline transition-colors hover:text-[rgba(252,250,246,0.7)]">terms of service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Helper Components ── */

function FeatureText({
  pill,
  title,
  desc,
}: {
  pill: { bg: string; color: string; icon: string; label: string };
  title: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="w-full md:w-[483px] flex-shrink-0 flex flex-col gap-5">
      <span
        className="inline-flex items-center self-start gap-3 px-3.5 py-1.5 rounded-full font-sans font-semibold text-[13px] tracking-[1px] uppercase whitespace-nowrap"
        style={{ background: pill.bg, color: pill.color }}
      >
        <Image src={pill.icon} alt="" width={24} height={24} />
        {pill.label}
      </span>
      <h3 className="font-display font-normal text-[28px] md:text-[44px] leading-[1.1] tracking-[-1px] text-[#1b1b1b]">{title}</h3>
      <p className="font-sans font-normal text-[17px] leading-[1.7] text-[rgba(27,27,27,0.6)] max-w-[400px]">{desc}</p>
    </div>
  );
}
