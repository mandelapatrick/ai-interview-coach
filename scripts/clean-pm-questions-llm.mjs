import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const csvPath = '/Users/mandelapatrick/Downloads/Product Management Training Data/interview_questions_aggregated.csv';
const outputPath = path.join(process.cwd(), 'data', 'pm-questions.ts');

// Initialize Anthropic client
const client = new Anthropic();

// Company slug normalization
const companySlugMap = {
  'doordash': 'doordash', 'linkedin': 'linkedin', 'meta': 'meta', 'facebook': 'meta',
  'google': 'google', 'amazon': 'amazon', 'amazxon': 'amazon', 'microsoft': 'microsoft',
  'apple': 'apple', 'uber': 'uber', 'lyft': 'lyft', 'airbnb': 'airbnb', 'tiktok': 'tiktok',
  'netflix': 'netflix', 'dropbox': 'dropbox', 'salesforce': 'salesforce', 'coinbase': 'coinbase',
  'pinterest': 'pinterest', 'twitter': 'twitter', 'yelp': 'yelp', 'adobe': 'adobe',
  'intuit': 'intuit', 'intuit-mailchimp': 'intuit', 'inuit': 'intuit', 'capital-one': 'capital-one',
  'zoom': 'zoom', 'etsy': 'etsy', 'ebay': 'ebay', 'affirm': 'affirm', 'brex': 'brex',
  'roblox': 'roblox', 'glassdoor': 'glassdoor', 'quora': 'quora', 'redfin': 'redfin',
  'stripe': 'stripe', 'snap': 'snap', 'snap-inc': 'snap', 'spotify': 'spotify', 'slack': 'slack',
  'shopify': 'shopify', 'square': 'square', 'robinhood': 'robinhood', 'instacart': 'instacart',
  'asana': 'asana', 'waymo': 'waymo', 'youtube': 'youtube', 'disney': 'disney',
  'walmart': 'walmart', 'target': 'target', 'fedex': 'fedex', 'expedia': 'expedia',
  'wayfair': 'wayfair', 'zillow': 'zillow', 'oracle': 'oracle', 'oracle-cloud-infrastructure': 'oracle',
  'paypal': 'paypal', 'zendesk': 'zendesk', 'databricks': 'databricks', 'datadog': 'datadog',
  'openai': 'openai', 'anthropic': 'anthropic', 'grammarly': 'grammarly', 'sofi': 'sofi',
  'tinder': 'tinder', 'coursera': 'coursera', 'indeed': 'indeed', 'monzo': 'monzo',
  'revolut': 'revolut', 'samsung-research': 'samsung', 'mozilla': 'mozilla', 'agoda': 'agoda',
  'nu-bank': 'nubank', 'sumup': 'sumup',
};

const typeMapping = {
  'Analytical Thinking': 'analytical-thinking',
  'Product Sense': 'product-sense',
  'Behavioral': 'behavioral',
  'Technical': 'technical',
  'Strategy': 'strategy',
  'Estimation': 'estimation',
};

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else current += char;
  }
  result.push(current.trim());
  return result;
}

function normalizeCompanySlug(company) {
  const rawSlug = company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (companySlugMap[rawSlug]) return companySlugMap[rawSlug];
  if (rawSlug.length > 30 || rawSlug.includes('---')) return null;
  return rawSlug;
}

function getFrequency(firstRound, finalRound) {
  const total = firstRound + finalRound;
  if (total >= 5) return 'high';
  if (total >= 2) return 'medium';
  return 'low';
}

// Use Claude to clean up a batch of questions
async function cleanBatchWithLLM(questions) {
  const prompt = `You are cleaning up PM interview questions for a professional UI. For each question below, provide:
1. A clean, concise TITLE (max 70 chars) - the essence of what's being asked
2. A clean DESCRIPTION - the full question, grammatically correct, professional

Rules for titles:
- Remove "You are a PM at X" context - just the core question
- Remove parenthetical examples like "(think pottery or welding)"
- Fix typos (potery → pottery, fb → Facebook)
- Keep it action-oriented: "Design...", "Build...", "Measure success for..."
- No trailing punctuation unless it's a question mark

Rules for descriptions:
- Keep the full context but fix grammar/typos
- Professional tone
- Max 250 characters

Input questions (JSON array):
${JSON.stringify(questions.map(q => ({ id: q.id, raw: q.raw })), null, 2)}

Respond with a JSON array in this exact format:
[{"id": "...", "title": "...", "description": "..."}]

Only output the JSON array, nothing else.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  const responseText = message.content[0].text;
  try {
    return JSON.parse(responseText);
  } catch (e) {
    // Try to extract JSON from response
    const match = responseText.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    console.error('Failed to parse response:', responseText.substring(0, 200));
    return questions.map(q => ({ id: q.id, title: q.raw.substring(0, 70), description: q.raw }));
  }
}

async function main() {
  console.log('Reading CSV...');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1).filter(line => line.trim());

  // Parse all questions
  const rawQuestions = [];
  let idCounter = 1;

  for (const line of lines) {
    const parts = parseCSVLine(line);
    if (parts.length < 5) continue;
    const [rawQuestion, typeRaw, companyRaw, firstRoundStr, finalRoundStr] = parts;
    if (!rawQuestion || !typeRaw || !companyRaw) continue;
    const companySlug = normalizeCompanySlug(companyRaw);
    if (!companySlug) continue;
    if (rawQuestion.length < 15) continue;

    rawQuestions.push({
      id: `pm-${idCounter++}`,
      companySlug,
      raw: rawQuestion.replace(/"/g, '\\"').replace(/\n/g, ' ').trim(),
      type: typeMapping[typeRaw] || 'product-sense',
      numFirstRound: parseInt(firstRoundStr) || 0,
      numFinalRound: parseInt(finalRoundStr) || 0,
    });
  }

  console.log(`Parsed ${rawQuestions.length} questions. Processing with LLM in batches...`);

  // Process in batches of 20
  const BATCH_SIZE = 20;
  const cleanedQuestions = [];

  for (let i = 0; i < rawQuestions.length; i += BATCH_SIZE) {
    const batch = rawQuestions.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(rawQuestions.length/BATCH_SIZE)}...`);

    try {
      const cleaned = await cleanBatchWithLLM(batch);
      const cleanedMap = new Map(cleaned.map(c => [c.id, c]));

      for (const q of batch) {
        const clean = cleanedMap.get(q.id) || { title: q.raw.substring(0, 70), description: q.raw };
        cleanedQuestions.push({
          ...q,
          title: clean.title.replace(/"/g, '\\"'),
          description: clean.description.replace(/"/g, '\\"'),
          frequency: getFrequency(q.numFirstRound, q.numFinalRound),
        });
      }

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`Error processing batch: ${e.message}`);
      // Fallback: use raw questions
      for (const q of batch) {
        cleanedQuestions.push({
          ...q,
          title: q.raw.substring(0, 70),
          description: q.raw,
          frequency: getFrequency(q.numFirstRound, q.numFinalRound),
        });
      }
    }
  }

  // Generate output file
  console.log('Generating pm-questions.ts...');
  let output = `import { Question } from "@/types";

export const pmQuestions: Question[] = [
`;

  for (const q of cleanedQuestions) {
    output += `  {
    id: "${q.id}",
    companySlug: "${q.companySlug}",
    title: "${q.title}",
    type: "${q.type}",
    difficulty: "medium",
    track: "product-management",
    numFirstRound: ${q.numFirstRound},
    numFinalRound: ${q.numFinalRound},
    frequency: "${q.frequency}",
    description: "${q.description}",
  },
`;
  }

  output += `];
`;

  fs.writeFileSync(outputPath, output);
  console.log(`Done! Written ${cleanedQuestions.length} questions to ${outputPath}`);
}

main().catch(console.error);
