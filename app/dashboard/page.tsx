import Link from "next/link";
import Navbar from "@/components/Navbar";
import { companies, pmCompanies } from "@/data/companies";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-display">
            Choose Your Interview Track
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Select the type of interview you want to prepare for. Each track has tailored questions, prompts, and evaluation criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Consulting Track */}
          <Link
            href="/dashboard/consulting"
            className="group relative bg-gradient-to-br from-[#1a2d47] to-[#0f172a] border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                Consulting
              </h2>
              <p className="text-white/60 mb-6">
                Case interviews from McKinsey, BCG, Bain, and other top consulting firms. Practice profitability, market entry, M&A, and more.
              </p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-white/40">
                  <span className="text-blue-400 font-semibold">{companies.length}</span> companies
                </div>
                <div className="flex items-center gap-2 text-blue-400 group-hover:translate-x-2 transition-transform">
                  <span className="text-sm font-medium">Start practicing</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Product Management Track */}
          <Link
            href="/dashboard/pm"
            className="group relative bg-gradient-to-br from-[#1a2d47] to-[#0f172a] border border-white/10 rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl group-hover:bg-violet-500/20 transition-all" />

            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                Product Management
              </h2>
              <p className="text-white/60 mb-6">
                PM interviews from Meta, Google, Amazon, and other tech giants. Practice product sense, analytical thinking, strategy, and behavioral questions.
              </p>

              <div className="flex items-center justify-between">
                <div className="text-sm text-white/40">
                  <span className="text-violet-400 font-semibold">{pmCompanies.filter(c => c.questionCount >= 5).length}</span> companies
                </div>
                <div className="flex items-center gap-2 text-violet-400 group-hover:translate-x-2 transition-transform">
                  <span className="text-sm font-medium">Start practicing</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
