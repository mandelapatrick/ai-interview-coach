import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">
              Ace<span className="text-[#d4af37]">Interview</span>
            </span>
          </div>
          <Link
            href="/api/auth/signin"
            className="text-sm text-white/70 hover:text-[#d4af37] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#1e3a5f]/50 rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance font-display">
            Master Your <span className="text-[#d4af37]">Case Interview</span>
          </h1>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Practice case interviews with an AI interviewer that adapts to your skill level.
            Get instant feedback and improve faster.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-block bg-gradient-to-r from-[#d4af37] to-[#f4d03f] text-[#0f172a] px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-[#d4af37]/25 transition-all"
          >
            Start Practicing Free
          </Link>
          <p className="mt-4 text-sm text-white/50">
            No credit card required
          </p>
        </div>
      </section>

      {/* Company logos */}
      <section className="border-y border-white/10 py-8 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-white/40 text-sm uppercase tracking-wider mb-6">Prepare for top consulting firms</p>
          <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap">
            {['McKinsey', 'BCG', 'Bain', 'Deloitte', 'Accenture'].map((firm) => (
              <span key={firm} className="text-white/50 font-semibold text-lg">{firm}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#152238] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-4 font-display">
            Why AceInterview?
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-xl mx-auto">
            Everything you need to ace your consulting case interview
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Real Case Questions"
              description="Practice with actual cases from McKinsey, BCG, Bain, and other top firms."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              }
              title="Voice-Based Practice"
              description="Speak naturally with our AI interviewer, just like a real interview."
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
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12 font-display">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Choose a Company"
              description="Select from top consulting firms and browse their case questions."
            />
            <StepCard
              number="2"
              title="Practice with AI"
              description="Start a voice session with our AI interviewer who guides you through the case."
            />
            <StepCard
              number="3"
              title="Get Your Score"
              description="Receive detailed feedback on your performance with actionable improvements."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#0f172a] mb-4 font-display">
            Ready to Land Your Dream Consulting Job?
          </h2>
          <p className="text-[#0f172a]/70 mb-8">
            Join thousands of candidates who improved their case skills with AceInterview.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-block bg-[#0f172a] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#1e3a5f] transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4 text-center text-white/50 text-sm">
          © 2025 AceInterview.ai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

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
    <div className="bg-[#1a2d47] p-6 rounded-xl border border-white/10 hover:border-[#d4af37]/30 transition-colors">
      <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] rounded-lg flex items-center justify-center text-[#0f172a] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
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
    <div className="text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] to-[#f4d03f] text-[#0f172a] rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60">{description}</p>
    </div>
  );
}
