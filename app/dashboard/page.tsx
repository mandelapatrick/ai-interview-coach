import Navbar from "@/components/Navbar";
import CompanyCard from "@/components/CompanyCard";
import { companies } from "@/data/companies";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose a Company
          </h1>
          <p className="text-gray-600">
            Select a consulting firm to practice their interview questions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </main>
    </div>
  );
}
