import { Company, QUESTION_TYPE_LABELS } from "@/types";
import { questions } from "./questions";

// Derive categories from actual questions for each company
function getCategoriesForCompany(companySlug: string): string[] {
  const companyQuestions = questions.filter((q) => q.companySlug === companySlug);
  const types = [...new Set(companyQuestions.map((q) => q.type))];
  return types.map((type) => QUESTION_TYPE_LABELS[type]);
}

// Get actual question count for each company
function getQuestionCount(companySlug: string): number {
  return questions.filter((q) => q.companySlug === companySlug).length;
}

export const companies: Company[] = [
  {
    slug: "mckinsey",
    name: "McKinsey & Company",
    logo: "🔷",
    description: "Global management consulting leader",
    questionCount: getQuestionCount("mckinsey"),
    categories: getCategoriesForCompany("mckinsey"),
  },
  {
    slug: "bcg",
    name: "Boston Consulting Group",
    logo: "🟢",
    description: "Strategy consulting powerhouse",
    questionCount: getQuestionCount("bcg"),
    categories: getCategoriesForCompany("bcg"),
  },
  {
    slug: "bain",
    name: "Bain & Company",
    logo: "🔴",
    description: "Results-driven consulting firm",
    questionCount: getQuestionCount("bain"),
    categories: getCategoriesForCompany("bain"),
  },
  {
    slug: "deloitte",
    name: "Deloitte Consulting",
    logo: "🟩",
    description: "Big Four consulting practice",
    questionCount: getQuestionCount("deloitte"),
    categories: getCategoriesForCompany("deloitte"),
  },
  {
    slug: "accenture",
    name: "Accenture",
    logo: "🟣",
    description: "Technology and strategy consulting",
    questionCount: getQuestionCount("accenture"),
    categories: getCategoriesForCompany("accenture"),
  },
  {
    slug: "kearney",
    name: "Kearney",
    logo: "🔶",
    description: "Operations-focused consulting",
    questionCount: getQuestionCount("kearney"),
    categories: getCategoriesForCompany("kearney"),
  },
  {
    slug: "oliver-wyman",
    name: "Oliver Wyman",
    logo: "🔵",
    description: "Financial services expertise",
    questionCount: getQuestionCount("oliver-wyman"),
    categories: getCategoriesForCompany("oliver-wyman"),
  },
  {
    slug: "roland-berger",
    name: "Roland Berger",
    logo: "⬛",
    description: "European strategy consultancy",
    questionCount: getQuestionCount("roland-berger"),
    categories: getCategoriesForCompany("roland-berger"),
  },
  {
    slug: "lek",
    name: "L.E.K. Consulting",
    logo: "🟡",
    description: "Sharp strategic insights",
    questionCount: getQuestionCount("lek"),
    categories: getCategoriesForCompany("lek"),
  },
  {
    slug: "strategy-and",
    name: "Strategy&",
    logo: "🟠",
    description: "PwC's strategy consulting arm",
    questionCount: getQuestionCount("strategy-and"),
    categories: getCategoriesForCompany("strategy-and"),
  },
];

export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}
