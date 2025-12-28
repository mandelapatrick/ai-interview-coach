import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900">
            CaseCoach<span className="text-blue-600">AI</span>
          </div>
          <Link
            href="/api/auth/signin"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">
          Ace Your Consulting Interview
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Practice case interviews with an AI interviewer that adapts to your skill level.
          Get instant feedback and improve faster.
        </p>
        <Link
          href="/api/auth/signin"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Start Practicing Free
        </Link>
        <p className="mt-4 text-sm text-gray-500">
          No credit card required • 3 free sessions
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why CaseCoach AI?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎯"
              title="Real Case Questions"
              description="Practice with actual cases from McKinsey, BCG, Bain, and other top firms."
            />
            <FeatureCard
              icon="🎙️"
              title="Voice-Based Practice"
              description="Speak naturally with our AI interviewer, just like a real interview."
            />
            <FeatureCard
              icon="📊"
              title="Detailed Feedback"
              description="Get scored on structure, problem-solving, communication, and more."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
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
      <section className="bg-blue-600 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Land Your Dream Consulting Job?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of candidates who improved their case skills with CaseCoach AI.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          © 2024 CaseCoach AI. All rights reserved.
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
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
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
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
