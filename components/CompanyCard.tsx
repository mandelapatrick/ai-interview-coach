import Link from "next/link";
import { Company } from "@/types";

export default function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/company/${company.slug}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
        <div className="text-4xl mb-4">{company.logo}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {company.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3">{company.description}</p>
        <div className="text-sm text-blue-600 font-medium">
          {company.questionCount} questions
        </div>
      </div>
    </Link>
  );
}
