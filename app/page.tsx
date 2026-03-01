import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Ace<span className="text-[#d4af37]">Interview</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">How It Works</a>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-[#d4af37] transition-colors">Pricing</Link>
          </div>
          <Link
            href="/api/auth/signin"
            className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-[#d4af37]/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-[400px] h-[400px] bg-[#f4d03f]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-gray-100/80 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[#d4af37]/10 text-[#b8972e] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
                </span>
                Trusted by 5,000+ candidates
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-display leading-tight">
                Land Your Dream{" "}
                <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] bg-clip-text text-transparent">
                  Consulting Offer
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg">
                Practice case interviews with an AI interviewer that adapts to your skill level. Get instant feedback and walk into every interview with confidence.
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/api/auth/signin"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
                >
                  Start Practicing Free
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-[#d4af37] hover:text-[#d4af37] transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </a>
              </div>

              {/* Avatar stack social proof */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-orange-500"].map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                      {["A", "S", "M", "J"][i]}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">2,400+</span> practicing this month
                </p>
              </div>
            </div>

            {/* Right: Product Mockup */}
            <div className="hidden md:block">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden">
                {/* Mockup Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-400 font-medium">AceInterview — Practice Session</span>
                  </div>
                </div>
                {/* Mockup Body */}
                <div className="p-6 space-y-4">
                  {/* AI Interviewer message */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <div className="bg-gray-50 rounded-xl rounded-tl-sm px-4 py-3 max-w-[280px]">
                      <p className="text-sm text-gray-700">Your client is a national grocery chain experiencing a 15% decline in profit margins. Walk me through your approach.</p>
                    </div>
                  </div>
                  {/* User message */}
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#d4af37]/10 rounded-xl rounded-tr-sm px-4 py-3 max-w-[260px]">
                      <p className="text-sm text-gray-700">I&apos;d like to start by clarifying a few things about the client&apos;s situation...</p>
                    </div>
                    <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">Y</span>
                    </div>
                  </div>
                  {/* Score indicator */}
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">Strong Clarification</p>
                      <p className="text-xs text-emerald-600">Great framework — structured and concise</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos */}
      <section className="border-y border-gray-200 py-10 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-xs text-gray-500 uppercase tracking-[0.2em] font-medium mb-8">
            Prepare for top consulting firms
          </p>
          <div className="flex justify-center items-center gap-8 md:gap-14 flex-wrap">
            {["McKinsey", "BCG", "Bain", "Deloitte", "Accenture", "Oliver Wyman", "Kearney"].map((firm) => (
              <span key={firm} className="text-gray-400 font-semibold text-lg tracking-wide">{firm}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            <StatItem number="5,000+" label="Candidates Trained" />
            <StatItem number="92%" label="Improved Confidence" />
            <StatItem number="15,000+" label="Sessions Completed" />
            <StatItem number="4.8/5" label="Average Rating" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-[#d4af37] font-semibold uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 font-display">
            Why AceInterview?
          </h2>
          <p className="text-center text-gray-600 mb-14 max-w-xl mx-auto">
            Everything you need to ace your consulting case interview, powered by AI
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Real Case Questions"
              description="Practice with actual cases from McKinsey, BCG, Bain, and other top consulting firms."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              }
              title="Voice-Based Practice"
              description="Speak naturally with our AI interviewer, just like a real interview setting."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Detailed Feedback"
              description="Get scored on structure, problem-solving, communication, and more."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Adaptive Difficulty"
              description="The AI adjusts question complexity based on your performance in real time."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Learn Mode"
              description="Study frameworks, techniques, and strategies before jumping into practice."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Session History"
              description="Review past sessions, track your progress, and identify areas to improve."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-[#d4af37] font-semibold uppercase tracking-wider mb-3">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 font-display">
            Three Simple Steps
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-xl mx-auto">
            Get started in minutes and begin improving your case interview skills today
          </p>
          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/40 to-[#d4af37]/20"></div>
            <div className="grid md:grid-cols-3 gap-12">
              <StepCard
                number="1"
                title="Choose a Company"
                description="Select from top consulting firms and browse their real case interview questions."
              />
              <StepCard
                number="2"
                title="Practice with AI"
                description="Start a voice session with our AI interviewer who guides you through the case in real time."
              />
              <StepCard
                number="3"
                title="Get Your Score"
                description="Receive detailed feedback on your performance with actionable improvements you can apply."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-[#d4af37] font-semibold uppercase tracking-wider mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 font-display">
            What Our Users Say
          </h2>
          <p className="text-center text-gray-600 mb-14 max-w-xl mx-auto">
            Join thousands of candidates who landed their dream consulting offers
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="AceInterview completely changed how I prepared. The AI felt like a real McKinsey interviewer — challenging but fair."
              name="Sarah K."
              role="McKinsey Associate"
              initial="S"
              color="bg-blue-500"
            />
            <TestimonialCard
              quote="I went from struggling with market sizing to confidently solving cases in two weeks. The instant feedback loop is incredible."
              name="Michael T."
              role="BCG Consultant"
              initial="M"
              color="bg-emerald-500"
            />
            <TestimonialCard
              quote="Way better than practicing with friends. The AI adapts to my level and I can practice anytime, anywhere. Highly recommend."
              name="Priya R."
              role="Bain Associate"
              initial="P"
              color="bg-purple-500"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-center text-sm text-[#d4af37] font-semibold uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4 font-display">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            Everything you need to know about AceInterview
          </p>
          <div className="space-y-3">
            <FAQItem
              question="How realistic is the AI interviewer?"
              answer="Our AI is trained on real case interviews from top consulting firms. It adapts to your responses, asks follow-up questions, and pushes back just like a real interviewer would. Many users say it feels indistinguishable from practicing with an actual consultant."
            />
            <FAQItem
              question="What equipment do I need?"
              answer="Just a computer or phone with a microphone. Our voice-based practice works in your browser — no downloads or special equipment required. A quiet environment is recommended for the best experience."
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
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative bg-gradient-to-br from-[#1e3a5f] to-[#0f1f33] rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center overflow-hidden">
            {/* Gold decorative blurs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#f4d03f]/10 rounded-full blur-3xl"></div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                Ready to Land Your Dream Consulting Job?
              </h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                Join thousands of candidates who improved their case skills with AceInterview. Start practicing today.
              </p>
              <Link
                href="/api/auth/signin"
                className="inline-flex items-center justify-center bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
              >
                Get Started Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="mt-4 text-sm text-gray-400">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Ace<span className="text-[#d4af37]">Interview</span>
                </span>
              </div>
              <p className="text-sm text-gray-500">AI-powered case interview practice for aspiring consultants.</p>
            </div>
            {/* Product links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-[#d4af37] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-gray-500 hover:text-[#d4af37] transition-colors">How It Works</a></li>
                <li><Link href="/pricing" className="text-sm text-gray-500 hover:text-[#d4af37] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            {/* Company links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/api/auth/signin" className="text-sm text-gray-500 hover:text-[#d4af37] transition-colors">Sign In</Link></li>
                <li><Link href="/api/auth/signin" className="text-sm text-gray-500 hover:text-[#d4af37] transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} AceInterview.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Inline Components ── */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-[#d4af37]/50 hover:shadow-lg hover:shadow-[#d4af37]/5 transition-all duration-200">
      <div className="w-12 h-12 bg-[#d4af37]/10 group-hover:bg-gradient-to-br group-hover:from-[#d4af37] group-hover:to-[#f4d03f] rounded-lg flex items-center justify-center text-[#d4af37] group-hover:text-white mb-4 transition-all duration-200">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center relative">
      <div className="w-12 h-12 bg-white border-2 border-[#d4af37] text-[#d4af37] rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 relative z-10">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatItem({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{number}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

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
          <svg key={i} className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none">
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <svg
          className="w-5 h-5 text-gray-400 transition-transform duration-200 group-open:rotate-180 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
