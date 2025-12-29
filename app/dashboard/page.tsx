import Navbar from "@/components/Navbar";
import CompanyCard from "@/components/CompanyCard";
import { companies } from "@/data/companies";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Companies
          </h1>
          <p className="text-gray-400">
            Explore interview questions from top consulting firms
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </main>
    </div>
  );
}
