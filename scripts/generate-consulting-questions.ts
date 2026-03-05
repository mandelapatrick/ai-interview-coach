/**
 * Merge casebook JSON files + existing hand-crafted questions into
 * data/consulting-questions.ts
 *
 * Run: npx tsx scripts/generate-consulting-questions.ts
 */

import * as fs from "fs";
import * as path from "path";

interface RawCase {
  title: string;
  description: string;
  additional_info: string[];
  additional_questions: string[];
  exhibit_images: string[];
  solution: string;
  evaluation: string;
  companySlug: string;
  type: string;
  difficulty: string;
  industry: string;
  interviewFormat: string;
  source: string;
}

// Seeded pseudo-random for determinism
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const rand = seededRandom(42);

// Map non-standard company slugs to existing ones
function mapCompanySlug(slug: string, interviewFormat: string): string {
  switch (slug) {
    case "unknown":
      return interviewFormat === "interviewer-led"
        ? "mckinsey"
        : rand() < 0.5
          ? "bain"
          : "bcg";
    case "a-t-kearney":
      return "kearney";
    case "pwc":
      return "strategy-and";
    case "booz":
    case "booz-co":
      return "mckinsey";
    case "parthenon":
    case "parthenon-ey":
      return "bain";
    case "capgemini":
      return "accenture";
    case "clearview":
    case "healthscape":
    case "simon-kucher":
      return rand() < 0.5 ? "bain" : "bcg";
    default:
      return slug;
  }
}

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data", "consulting_interviews");

// Read JSON files
const v0: RawCase[] = JSON.parse(
  fs.readFileSync(path.join(DATA, "all_cases_v0.json"), "utf-8")
);
const v1: RawCase[] = JSON.parse(
  fs.readFileSync(path.join(DATA, "all_cases_v1.json"), "utf-8")
);

// Build v1 title set for overlap detection
const v1TitleSet = new Set(v1.map((c) => c.title));

// For the 22 overlapping cases, prefer whichever has exhibits
const v1ByTitle = new Map<string, RawCase>();
for (const c of v1) {
  v1ByTitle.set(c.title, c);
}

// Start with v1 as base
const merged: RawCase[] = [...v1];

// Add v0-only cases + handle overlaps
for (const c of v0) {
  if (!v1TitleSet.has(c.title)) {
    // v0-only case
    merged.push(c);
  } else {
    // Overlap: prefer the one with exhibits
    const v1Case = v1ByTitle.get(c.title)!;
    if (c.exhibit_images.length > 0 && v1Case.exhibit_images.length === 0) {
      // Replace v1 version with v0 version (has exhibits)
      const idx = merged.findIndex((m) => m.title === c.title);
      if (idx !== -1) merged[idx] = c;
    }
  }
}

// Sort deterministically by source + title
merged.sort((a, b) => {
  const cmp = a.source.localeCompare(b.source);
  return cmp !== 0 ? cmp : a.title.localeCompare(b.title);
});

console.log(`Merged: ${merged.length} casebook cases`);

// Read existing hand-crafted questions from questions.ts to extract their data
// We'll include them inline so the generated file is self-contained
const questionsFile = fs.readFileSync(
  path.join(ROOT, "data", "questions.ts"),
  "utf-8"
);

// Extract existing question objects - parse the array between the first [ and last ]
// before the allQuestions line
const arrayStart = questionsFile.indexOf("export const questions: Question[] = [");
const arrayEnd = questionsFile.indexOf("];", arrayStart);
const existingBlock = questionsFile.substring(arrayStart, arrayEnd + 2);

// Escape helper
function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$");
}

function escSingle(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

// Build the output file
let output = `import { Question, calculateFrequency } from "@/types";

// ============================================================
// Existing hand-crafted consulting questions (preserved IDs)
// ============================================================
const handCraftedQuestions: Question[] = [
`;

// We need to re-read and copy the hand-crafted questions verbatim.
// Find the opening [ of the array literal (skip the [] in "Question[]")
const firstBracket = questionsFile.indexOf("[", arrayStart);
// The first [ is in "Question[]", so find the second one (the array start)
const secondBracket = questionsFile.indexOf("[", firstBracket + 1);
const innerStart = secondBracket + 1;
const innerEnd = arrayEnd;
const innerContent = questionsFile.substring(innerStart, innerEnd).trim();

output += `${innerContent}
];

// ============================================================
// Casebook questions (merged from v0 + v1 JSON files)
// ============================================================
const casebookQuestions: Question[] = [
`;

for (let i = 0; i < merged.length; i++) {
  const c = merged[i];
  const id = `cb-${i + 1}`;
  const companySlug = mapCompanySlug(c.companySlug, c.interviewFormat);
  const additionalInfo =
    c.additional_info.length > 0
      ? c.additional_info.join("\\n\\n")
      : "";
  const images = c.exhibit_images.map((p) => {
    // Normalize: v1 paths start with "exhibits/", v0 paths don't
    const normalized = p.startsWith("exhibits/") ? p.slice("exhibits/".length) : p;
    return `/exhibits/${normalized}`;
  });

  output += `  {
    id: '${id}',
    companySlug: '${companySlug}',
    title: '${escSingle(c.title)}',
    type: '${c.type}' as Question['type'],
    difficulty: '${c.difficulty}' as Question['difficulty'],
    track: 'consulting',
    industry: '${escSingle(c.industry)}',
    interviewFormat: '${c.interviewFormat}' as Question['interviewFormat'],
    description: \`${esc(c.description)}\`,`;

  if (additionalInfo) {
    output += `
    additionalInfo: \`${esc(c.additional_info.join("\n\n"))}\`,`;
  }

  if (images.length > 0) {
    output += `
    additionalInfoImages: ${JSON.stringify(images)},`;
  }

  if (c.additional_questions.length > 0) {
    output += `
    additionalQuestions: ${JSON.stringify(c.additional_questions)},`;
  }

  if (c.solution && c.solution !== "Not explicitly provided in the text.") {
    output += `
    solution: \`${esc(c.solution)}\`,`;
  }

  if (
    c.evaluation &&
    c.evaluation !== "Not explicitly provided in the text."
  ) {
    output += `
    evaluation: \`${esc(c.evaluation)}\`,`;
  }

  if (c.source) {
    output += `
    source: '${escSingle(c.source)}',`;
  }

  output += `
  },
`;
}

output += `];

export const consultingQuestions: Question[] = [
  ...handCraftedQuestions,
  ...casebookQuestions,
];
`;

const outPath = path.join(ROOT, "data", "consulting-questions.ts");
fs.writeFileSync(outPath, output, "utf-8");
console.log(`Written ${outPath}`);
console.log(
  `Total: ${innerContent.split(/\bid:\s*"/).length - 1} hand-crafted + ${merged.length} casebook = ${innerContent.split(/\bid:\s*"/).length - 1 + merged.length} questions`
);
