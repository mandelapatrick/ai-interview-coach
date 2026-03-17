import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import TrackedCTALink from "@/components/TrackedCTALink";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Pill Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/90 backdrop-blur-lg rounded-full shadow-lg shadow-black/5 border border-gray-200/60 px-6 py-3 flex justify-between items-center">
          <Image src="/ace_logo.png" alt="Ace" width={65} height={40} className="object-contain" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          </div>
          <TrackedCTALink
            href="/api/auth/signin"
            location="nav"
            className="bg-[#2d6a4f] text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-[#245a42] transition-colors"
          >
            Get Started Free
          </TrackedCTALink>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#fcfaf6] pt-24 md:pt-32 pb-10 md:pb-14">
        <div className="max-w-[1320px] mx-auto px-6 md:px-[61px]">
          <div className="grid md:grid-cols-[50%_50%] lg:grid-cols-[43%_57%] items-start">
            {/* Left: Text + Trust Bar */}
            <div className="flex flex-col z-10 pt-8 md:pt-12" style={{ gap: '33px' }}>
              <h1 className="font-normal text-[#1b1b1b] font-display text-4xl md:text-[48px] lg:text-[64px] xl:text-[81px]" style={{ lineHeight: 1.3 }}>
                Master your interview with AI
              </h1>
              <p className="text-[18px] text-[#1b1b1b] font-sans max-w-[480px]" style={{ lineHeight: '29.7px' }}>
                Practice with a real AI interviewer — that adapts, challenges, and gives instant feedback after every session.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center" style={{ gap: '33px' }}>
                <TrackedCTALink
                  href="/api/auth/signin"
                  location="hero"
                  className="inline-flex items-center justify-center bg-[#c1f879] text-[#1b1b1b] rounded-full font-normal text-[15px] font-display hover:bg-[#b3ed66] transition-colors px-8 py-4"
                >
                  <span className="mr-2 text-[10px]">▶</span>
                  <span className="italic">start</span>&nbsp;practicing free
                </TrackedCTALink>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center border border-[#1b1b1b] bg-[#fcfaf6] text-[#1b1b1b] rounded-full font-normal text-[15px] font-display hover:bg-white transition-colors px-8 py-4"
                >
                  <span className="mr-2 text-[10px]">▶</span>
                  <span className="italic">watch</span>&nbsp;demo
                </a>
              </div>

              {/* Trust Bar */}
              <div className="flex flex-col mt-8" style={{ gap: '16px' }}>
                <p className="text-[16px] text-[rgba(22,22,22,0.44)]">
                  <span className="italic">trusted by</span> candidates at
                </p>
                <div className="flex items-center flex-wrap" style={{ gap: '19px' }}>
                  {["Google", "McKinsey", "Amazon", "Goldman Sachs", "Meta", "Microsoft"].map((firm) => (
                    <span key={firm} className="text-[rgba(22,22,22,0.44)] font-bold text-[18px] whitespace-nowrap">{firm}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Two Avatar Cards — hidden on mobile */}
            <div className="hidden md:block relative" style={{ minHeight: '480px' }}>
              {/* Avatar 1 — cyan card, top-left of right column */}
              <div className="absolute overflow-hidden rounded-2xl bg-[#ccf2fb] z-10" style={{ width: '52%', aspectRatio: '364/243', left: '0', top: '0' }}>
                <Image
                  src="/avatar_1.png"
                  alt="AI interviewer"
                  fill
                  className="object-cover object-top"
                  priority
                />
                {/* AI Interviewer label */}
                <div className="absolute bottom-3 right-4 bg-[#fcfaf6] rounded-full px-4 py-2 flex items-center gap-1.5 z-20">
                  <span className="text-[10px]">✦</span>
                  <span className="font-display italic text-[#1e4635] text-base lg:text-[18px]" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1", lineHeight: 1.3 }}>AI interviewer</span>
                </div>
              </div>

              {/* Avatar 2 — larger card, offset right and lower */}
              <div className="absolute overflow-hidden rounded-2xl z-0" style={{ width: '70%', aspectRatio: '516/306', right: '-5%', top: '35%' }}>
                <Image
                  src="/avatar_2.png"
                  alt="Interview candidate"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Candidate-Led tooltip — overlapping bottom of avatar 2 */}
              <div className="absolute rounded-[10px] px-3 py-3 z-20" style={{ backgroundImage: 'linear-gradient(268deg, rgba(242,238,230,0.9) 14%, rgba(255,255,255,0.9) 93%)', right: '5%', top: '78%' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ca9aee]" />
                  <span className="font-display text-[#ca9aee] text-[15px]" style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1", lineHeight: 1.3 }}>Candidate-Led</span>
                </div>
                <p className="text-[12px] text-[#6c6c6c]" style={{ lineHeight: 1.3, maxWidth: '229px' }}>
                  You&apos;re driving the case proactively — not waiting to be guided
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-[#2d6a4f] font-semibold uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 font-display">
            Everything you need to ace your interview
          </h2>
          <p className="text-center text-gray-600 mb-20 max-w-xl mx-auto">
            From real case questions to detailed feedback — practice smarter, not harder
          </p>

          <div className="space-y-24 md:space-y-32">
            {/* Row 1 — Real Case Questions (text left, proof right) */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 mb-4">Real cases</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-4">Practice on real questions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access real case interview questions from top consulting firms and Fortune 500 companies. Each question is sourced from actual interviews with full context and expected frameworks.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">McK</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">McKinsey & Company</p>
                    <p className="text-xs text-gray-500">Case Interview Question</p>
                  </div>
                </div>
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">Retail</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">Profitability</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">Advanced</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  &ldquo;Your client is a large national retailer experiencing a 15% decline in profitability over the past two years despite stable revenues. What would you investigate?&rdquo;
                </p>
                <p className="text-xs text-gray-400">Source: McKinsey first-round interview, 2024</p>
              </div>
            </div>

            {/* Row 2 — Live Session (proof left, text right) */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 md:order-1 bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-red-600">Live</span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">14:32</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-gray-800">Walk me through how you&apos;d structure your approach to this problem.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#2d6a4f] rounded-2xl rounded-tr-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-white">I&apos;d start by breaking the profitability decline into revenue and cost components...</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-gray-800">Good start. Can you be more specific about which cost drivers you&apos;d examine first?</p>
                    </div>
                  </div>
                  <div className="flex justify-start items-center gap-1.5 pl-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-4">Live session</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-4">Interview under real pressure</h3>
                <p className="text-gray-600 leading-relaxed">
                  Practice in a live, timed session that simulates the real interview experience. Our AI asks follow-up questions, pushes back on weak answers, and keeps you on your toes.
                </p>
              </div>
            </div>

            {/* Row 3 — Detailed Feedback (text left, proof right) */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-4">Feedback</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-4">Scored across 6 dimensions</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get a detailed assessment across structure, problem-solving, communication, math, creativity, and business acumen. Know exactly where you stand and what to improve.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold text-gray-900">Assessment</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">4.2</span>
                    <span className="text-sm text-gray-500">/ 5</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Structure", score: 90, tag: "Strong", tagColor: "bg-emerald-100 text-emerald-700" },
                    { name: "Problem Solving", score: 70, tag: "Needs work", tagColor: "bg-amber-100 text-amber-700" },
                    { name: "Communication", score: 95, tag: "Excellent", tagColor: "bg-emerald-100 text-emerald-700" },
                    { name: "Math & Analytics", score: 65, tag: "Improve", tagColor: "bg-red-100 text-red-700" },
                    { name: "Creativity", score: 80, tag: "Solid", tagColor: "bg-blue-100 text-blue-700" },
                    { name: "Business Acumen", score: 92, tag: "Exceptional", tagColor: "bg-emerald-100 text-emerald-700" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28 flex-shrink-0">{item.name}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2d6a4f] rounded-full" style={{ width: `${item.score}%` }}></div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${item.tagColor}`}>{item.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4 — Adaptive Difficulty (proof left, text right) */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 md:order-1 bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Session Progression</p>
                <div className="space-y-4">
                  {[
                    { round: "R1", difficulty: "Easy", color: "bg-emerald-500", note: null },
                    { round: "R2", difficulty: "Medium", color: "bg-amber-500", note: "AI increased difficulty" },
                    { round: "R3", difficulty: "Hard", color: "bg-red-500", note: "You're doing well!" },
                  ].map((r) => (
                    <div key={r.round} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-sm text-gray-700">{r.round}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${r.color}`}></div>
                          <span className="font-medium text-sm text-gray-900">{r.difficulty}</span>
                        </div>
                        {r.note && <p className="text-xs text-gray-500 mt-0.5">{r.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-4">Adaptive</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-4">Questions that adapt to you</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI dynamically adjusts question difficulty based on your performance. Struggling? It dials back. Crushing it? Expect harder follow-ups to push your limits.
                </p>
              </div>
            </div>

            {/* Row 5 — Learn Mode (text left, proof right) */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 mb-4">Learn mode</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-4">Study before you practice</h3>
                <p className="text-gray-600 leading-relaxed">
                  Learn key frameworks, concepts, and strategies before jumping into practice. Build a solid foundation so you can focus on execution during your sessions.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="flex gap-4 border-b border-gray-200 mb-4">
                  <button className="pb-2 border-b-2 border-[#2d6a4f] text-sm font-semibold text-[#2d6a4f]">Frameworks</button>
                  <button className="pb-2 border-b-2 border-transparent text-sm font-medium text-gray-400">Concepts</button>
                  <button className="pb-2 border-b-2 border-transparent text-sm font-medium text-gray-400">Examples</button>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">Issue Tree</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium">Essential</span>
                    </div>
                    <p className="text-xs text-gray-500">Break complex problems into mutually exclusive, collectively exhaustive components</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">Profit Tree</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium">Essential</span>
                    </div>
                    <p className="text-xs text-gray-500">Revenue and cost decomposition for profitability cases</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-900">Market Entry</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium">Advanced</span>
                    </div>
                    <p className="text-xs text-gray-500">Evaluate market attractiveness, competitive landscape, and entry strategy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 6 — Session History (proof left, text right) */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="order-2 md:order-1 bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Recent Sessions</p>
                <div className="space-y-3">
                  {[
                    { company: "McK", bg: "bg-blue-600", name: "McKinsey", type: "Profitability", duration: "28 min", date: "Mar 14", score: "4.5" },
                    { company: "BCG", bg: "bg-green-600", name: "BCG", type: "Market Entry", duration: "32 min", date: "Mar 12", score: "3.8" },
                    { company: "Bain", bg: "bg-red-600", name: "Bain", type: "M&A", duration: "25 min", date: "Mar 10", score: "4.2" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center text-white font-bold text-xs`}>{s.company}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-900">{s.name} — {s.type}</span>
                          <span className="font-semibold text-sm text-gray-900">{s.score}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{s.duration}</span>
                          <span>·</span>
                          <span>{s.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 mb-4">History</span>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-display mb-4">Track your progress over time</h3>
                <p className="text-gray-600 leading-relaxed">
                  Review all your past sessions in one place. See your scores, track improvement trends, and identify the areas that need the most attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-sm text-[#2d6a4f] font-semibold uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16 font-display">
            Three simple steps
          </h2>
          <div className="space-y-12">
            {[
              {
                number: "01",
                title: "Choose a Company",
                description: "Select from top consulting firms and Fortune 500 companies. Browse their real interview questions filtered by type, difficulty, and industry.",
              },
              {
                number: "02",
                title: "Practice with AI",
                description: "Start a live session with our AI interviewer. It guides you through the case in real time, asking follow-ups and challenging your thinking — just like the real thing.",
              },
              {
                number: "03",
                title: "Get Your Score",
                description: "Receive a detailed scorecard across 6 dimensions with actionable feedback. Track your improvement over time and know exactly when you're ready.",
              },
            ].map((step) => (
              <div key={step.number} className="flex gap-8 md:gap-12 items-start">
                <span className="text-5xl md:text-7xl font-bold text-gray-200 font-display leading-none flex-shrink-0">{step.number}</span>
                <div className="pt-2 md:pt-4">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-[#2d6a4f] font-semibold uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-14 font-display">
            What our users say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="AceInterview completely changed how I prepared. The AI felt like a real interviewer — challenging but fair. I landed my dream offer within three weeks."
              name="Sarah Chen"
              role="Incoming Analyst, Goldman Sachs"
              initial="S"
              color="bg-blue-500"
            />
            <TestimonialCard
              quote="I went from struggling with market sizing to confidently solving cases in two weeks. The instant feedback loop is what sets this apart from everything else."
              name="Marcus Okafor"
              role="Associate, McKinsey & Company"
              initial="M"
              color="bg-emerald-500"
            />
            <TestimonialCard
              quote="Way better than practicing with friends. The AI adapts to my level and I can practice anytime, anywhere. This is the future of interview prep."
              name="Aisha Patel"
              role="Product Manager, Google"
              initial="A"
              color="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 font-display">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            <FAQItem
              question="How realistic is the AI interviewer?"
              answer="Our AI is trained on real interviews from top companies. It adapts to your responses, asks follow-up questions, and pushes back just like a real interviewer would. Many users say it feels indistinguishable from practicing with a real person."
              defaultOpen
            />
            <FAQItem
              question="What equipment do I need?"
              answer="Just a computer or phone with a camera and microphone. Our video-based practice works in your browser — no downloads or special equipment required. A quiet environment is recommended for the best experience."
            />
            <FAQItem
              question="How is this better than practicing with a partner?"
              answer="AceInterview is available 24/7, provides consistent and objective feedback, adapts difficulty to your level, and lets you practice unlimited cases. It complements partner practice by giving you a way to build fundamentals before live practice sessions."
            />
            <FAQItem
              question="What types of cases are available?"
              answer="We cover all major case types: profitability, market entry, M&A, pricing, growth strategy, and more. Cases are modeled after real interviews from McKinsey, BCG, Bain, Deloitte, and other top firms."
            />
            <FAQItem
              question="Is there a free plan?"
              answer="Yes! You can start practicing for free with a limited number of sessions per month. Upgrade anytime to unlock unlimited practice, advanced analytics, and all case types."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative bg-[#2d6a4f] rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] font-display font-bold text-white/[0.03] select-none pointer-events-none">ace</div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                Stop preparing alone.<br />Start practicing for real.
              </h2>
              <p className="text-white/70 mb-8 max-w-lg mx-auto">
                Join thousands of candidates who improved their interview skills with AceInterview.
              </p>
              <TrackedCTALink
                href="/api/auth/signin"
                location="bottom-cta"
                className="inline-flex items-center justify-center bg-white text-[#2d6a4f] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Start Now, Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </TrackedCTALink>
              <p className="mt-4 text-sm text-white/50">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-16 bg-white relative overflow-hidden">
        {/* Decorative watermark */}
        <div className="absolute bottom-0 right-0 text-[180px] font-display font-bold text-gray-50 select-none pointer-events-none leading-none translate-x-8 translate-y-12">ace</div>

        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3">
                <Image src="/ace_logo.png" alt="Ace" width={55} height={34} className="object-contain" />
              </div>
              <p className="text-sm text-gray-500 max-w-[200px]">AI-powered interview practice for ambitious candidates.</p>
            </div>
            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a></li>
                <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Case Library</a></li>
                <li><a href="#features" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Companies</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Interview Guides</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Community</a></li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Press</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} AceInterview.ai. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Inline Components ── */

function TestimonialCard({
  quote,
  name,
  role,
  initial,
  color,
}: {
  quote: string;
  name: string;
  role: string;
  initial: string;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-[#4d7c0f]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 ${color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
          {initial}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen?: boolean }) {
  return (
    <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden" open={defaultOpen}>
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none">
        <span className="font-display font-semibold text-gray-900 pr-4 text-lg">{question}</span>
        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 text-xl font-light group-open:hidden">+</span>
        <span className="flex-shrink-0 w-6 h-6 items-center justify-center text-gray-400 text-xl font-light hidden group-open:flex">&minus;</span>
      </summary>
      <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
