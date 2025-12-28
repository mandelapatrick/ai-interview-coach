import { Company } from "@/types";

export const companies: Company[] = [
  {
    slug: "mckinsey",
    name: "McKinsey & Company",
    logo: "🔷",
    description: "Global management consulting leader",
    questionCount: 12,
  },
  {
    slug: "bcg",
    name: "Boston Consulting Group",
    logo: "🟢",
    description: "Strategy consulting powerhouse",
    questionCount: 10,
  },
  {
    slug: "bain",
    name: "Bain & Company",
    logo: "🔴",
    description: "Results-driven consulting firm",
    questionCount: 10,
  },
  {
    slug: "deloitte",
    name: "Deloitte Consulting",
    logo: "🟩",
    description: "Big Four consulting practice",
    questionCount: 8,
  },
  {
    slug: "accenture",
    name: "Accenture",
    logo: "🟣",
    description: "Technology and strategy consulting",
    questionCount: 8,
  },
  {
    slug: "kearney",
    name: "Kearney",
    logo: "🔶",
    description: "Operations-focused consulting",
    questionCount: 6,
  },
  {
    slug: "oliver-wyman",
    name: "Oliver Wyman",
    logo: "🔵",
    description: "Financial services expertise",
    questionCount: 6,
  },
  {
    slug: "roland-berger",
    name: "Roland Berger",
    logo: "⬛",
    description: "European strategy consultancy",
    questionCount: 5,
  },
  {
    slug: "lek",
    name: "L.E.K. Consulting",
    logo: "🟡",
    description: "Sharp strategic insights",
    questionCount: 5,
  },
  {
    slug: "strategy-and",
    name: "Strategy&",
    logo: "🟠",
    description: "PwC's strategy consulting arm",
    questionCount: 5,
  },
];

export function getCompanyBySlug(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}
