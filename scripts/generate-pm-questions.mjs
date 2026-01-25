import fs from 'fs';
import path from 'path';

const csvPath = '/Users/mandelapatrick/Downloads/Product Management Training Data/interview_questions_aggregated.csv';
const outputPath = path.join(process.cwd(), 'data', 'pm-questions.ts');

// Read CSV file
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

// Skip header
const dataLines = lines.slice(1).filter(line => line.trim());

// Parse CSV properly (handle quoted fields with commas)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Type mapping
const typeMapping = {
  'Analytical Thinking': 'analytical-thinking',
  'Product Sense': 'product-sense',
  'Behavioral': 'behavioral',
  'Technical': 'technical',
  'Strategy': 'strategy',
  'Estimation': 'estimation',
};

// Company slug normalization with known mappings
const companySlugMap = {
  'doordash': 'doordash',
  'linkedin': 'linkedin',
  'meta': 'meta',
  'facebook': 'meta',
  'google': 'google',
  'amazon': 'amazon',
  'amazxon': 'amazon',
  'microsoft': 'microsoft',
  'apple': 'apple',
  'uber': 'uber',
  'lyft': 'lyft',
  'airbnb': 'airbnb',
  'tiktok': 'tiktok',
  'netflix': 'netflix',
  'dropbox': 'dropbox',
  'salesforce': 'salesforce',
  'coinbase': 'coinbase',
  'pinterest': 'pinterest',
  'twitter': 'twitter',
  'yelp': 'yelp',
  'adobe': 'adobe',
  'intuit': 'intuit',
  'intuit-mailchimp': 'intuit',
  'inuit': 'intuit',
  'capital-one': 'capital-one',
  'zoom': 'zoom',
  'etsy': 'etsy',
  'ebay': 'ebay',
  'affirm': 'affirm',
  'brex': 'brex',
  'roblox': 'roblox',
  'glassdoor': 'glassdoor',
  'quora': 'quora',
  'redfin': 'redfin',
  'stripe': 'stripe',
  'snap': 'snap',
  'snap-inc': 'snap',
  'spotify': 'spotify',
  'slack': 'slack',
  'shopify': 'shopify',
  'square': 'square',
  'robinhood': 'robinhood',
  'instacart': 'instacart',
  'asana': 'asana',
  'waymo': 'waymo',
  'youtube': 'youtube',
  'disney': 'disney',
  'walmart': 'walmart',
  'target': 'target',
  'fedex': 'fedex',
  'expedia': 'expedia',
  'wayfair': 'wayfair',
  'zillow': 'zillow',
  'oracle': 'oracle',
  'oracle-cloud-infrastructure': 'oracle',
  'paypal': 'paypal',
  'zendesk': 'zendesk',
  'databricks': 'databricks',
  'datadog': 'datadog',
  'openai': 'openai',
  'anthropic': 'anthropic',
  'grammarly': 'grammarly',
  'sofi': 'sofi',
  'tinder': 'tinder',
  'coursera': 'coursera',
  'indeed': 'indeed',
  'monzo': 'monzo',
  'revolut': 'revolut',
  'samsung-research': 'samsung',
  'mozilla': 'mozilla',
  'agoda': 'agoda',
  'nu-bank': 'nubank',
  'sumup': 'sumup',
};

function normalizeCompanySlug(company) {
  const rawSlug = company.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  // Check for known mapping
  if (companySlugMap[rawSlug]) {
    return companySlugMap[rawSlug];
  }

  // Skip obviously malformed entries (too long or contains gibberish)
  if (rawSlug.length > 30 || rawSlug.includes('---')) {
    return null;
  }

  return rawSlug;
}

// Frequency calculation
function getFrequency(firstRound, finalRound) {
  const total = firstRound + finalRound;
  if (total >= 5) return 'high';
  if (total >= 2) return 'medium';
  return 'low';
}

// Typo corrections mapping
const typoCorrections = {
  // Common typos
  'potery': 'pottery',
  'ahd': 'had',
  'fora': 'for a',
  'amazxon': 'Amazon',
  'Instragram': 'Instagram',
  'instragram': 'Instagram',
  'produ...': 'product',
  "YOur'e": "You're",
  "Your'e": "You're",
  "youre": "you're",
  'Fav product': 'Favorite product',
  'fav product': 'favorite product',
  'over come': 'overcome',
  // Grammar fixes
  'Build an calendar': 'Build a calendar',
  'an calendar': 'a calendar',
  'an OTA': 'an OTA', // correct
  'iphones': "iPhone's",
  'Iphones': "iPhone's",
  'iphone': 'iPhone',
  'ios': 'iOS',
  'Ios': 'iOS',
  'android': 'Android',
  'youtube': 'YouTube',
  'Youtube': 'YouTube',
  'linkedin': 'LinkedIn',
  'Linkedin': 'LinkedIn',
  'facebook': 'Facebook',
  'google': 'Google',
  'uber': 'Uber',
  'lyft': 'Lyft',
  'airbnb': 'Airbnb',
  'tiktok': 'TikTok',
  'Tiktok': 'TikTok',
  'netflix': 'Netflix',
  'spotify': 'Spotify',
  'whatsapp': 'WhatsApp',
  'Whatsapp': 'WhatsApp',
  'dropbox': 'Dropbox',
  'slack': 'Slack',
  'alexa': 'Alexa',
  'twitch': 'Twitch',
  'walmart': 'Walmart',
  'amazon': 'Amazon',
  'doordash': 'DoorDash',
  'Doordash': 'DoorDash',
  'instacart': 'Instacart',
  'grubhub': 'Grubhub',
  'postmates': 'Postmates',
};

// Abbreviation expansions (only at word boundaries)
const abbreviationExpansions = {
  'YT': 'YouTube',
  'FB': 'Facebook',
  'IG': 'Instagram',
  'NSM': 'North Star Metric',
  'KPI': 'KPI', // keep as-is
  'PM': 'PM', // keep as-is (Product Manager)
  'OTA': 'OTA', // keep as-is (Online Travel Agency)
  'API': 'API',
  'AI': 'AI',
  'ML': 'ML',
  'UX': 'UX',
  'UI': 'UI',
};

// Apply typo corrections
function fixTypos(text) {
  let result = text;

  // Apply direct replacements
  for (const [typo, correction] of Object.entries(typoCorrections)) {
    const regex = new RegExp(typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, (match) => {
      // Preserve case pattern where sensible
      if (match === match.toUpperCase() && correction !== correction.toUpperCase()) {
        return correction;
      }
      return correction;
    });
  }

  // Apply abbreviation expansions at word boundaries
  for (const [abbr, expansion] of Object.entries(abbreviationExpansions)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'g');
    result = result.replace(regex, expansion);
  }

  return result;
}

// Generic titles that need more context
const genericTitles = [
  /^how would you (improve|fix|change|modify|approach) (it|this|that)\??$/i,
  /^what (would|do) you (suggest|recommend|think|do)\??$/i,
  /^what is your (favorite|fav) product\??$/i,
  /^define (a |the )?goal(s)? for (this|the) product\??$/i,
  /^what do you suggest they should do\??$/i,
  /^how would you measure (success|it)\??$/i,
  /^what metrics would you (use|track)\??$/i,
  /^pick one\.?$/i,
];

function isGenericTitle(title) {
  return genericTitles.some(pattern => pattern.test(title.trim()));
}

// Extract key product/topic from context
function extractProductContext(fullQuestion) {
  // Match patterns like "You are PM at X" or "for X product"
  const patterns = [
    /(?:PM|product manager)\s+(?:at|for)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i,
    /(?:for|improve|build|design)\s+(?:a\s+)?(?:the\s+)?([A-Z][a-zA-Z]+(?:\s+[a-zA-Z]+)?(?:\s+(?:app|product|feature|platform|service))?)/i,
    /([A-Z][a-zA-Z]+(?:'s)?)\s+(?:app|product|feature|platform)/i,
  ];

  for (const pattern of patterns) {
    const match = fullQuestion.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      return match[1];
    }
  }
  return null;
}

// Extract a clean, concise title from the full question
function extractTitle(fullQuestion) {
  let text = fullQuestion;

  // Save original for fallback
  const originalText = fullQuestion;

  // Remove parenthetical content that's just examples
  text = text.replace(/\s*\([^)]*(?:think|e\.g\.|for example|such as|like)[^)]*\)\s*/gi, ' ');

  // Split into sentences
  const sentences = text.split(/(?<=[.?!])\s+/);

  // Find the most question-like sentence
  let bestSentence = null;
  let contextSentence = sentences[0]; // Keep first sentence as context

  for (const sentence of sentences) {
    // Skip pure context sentences for best sentence selection
    if (/^(you are|you're|imagine|assume|pretend|suppose|our client|the client)/i.test(sentence)) {
      contextSentence = sentence;
      continue;
    }

    // Prioritize How/What/Why questions
    if (/^(how|what|why|which|where|when|who)\s/i.test(sentence)) {
      bestSentence = sentence;
      break;
    }

    // Prioritize action verbs
    if (/^(design|build|create|improve|measure|define|set|evaluate|analyze|prioritize|optimize)/i.test(sentence)) {
      bestSentence = sentence;
      break;
    }

    // If we haven't found a good sentence yet, keep this one
    if (!bestSentence) {
      bestSentence = sentence;
    }
  }

  // If no good sentence found, use first non-context one or first sentence
  if (!bestSentence) {
    bestSentence = sentences.find(s => !/^(you are|you're|imagine|assume)/i.test(s)) || sentences[0];
  }

  // Clean up
  let title = bestSentence
    .replace(/\s+/g, ' ')
    .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove remaining parentheticals
    .replace(/\s+/g, ' ')
    .trim();

  // Remove trailing filler
  title = title.replace(/\s*(and why|what would you build|what would you do|how would you approach this|how would you approach it)\s*\??$/i, '');

  // Remove trailing punctuation except ?
  title = title.replace(/[.,;:]+$/, '');

  // Check if title is too generic
  if (isGenericTitle(title)) {
    // Try to extract product context and build a better title
    const product = extractProductContext(originalText);
    if (product) {
      // Build a more specific title
      if (/improve/i.test(title)) {
        title = `Improve ${product}`;
      } else if (/goal|metric/i.test(title)) {
        title = `Define goals for ${product}`;
      } else if (/favorite/i.test(title)) {
        title = `Analyze your favorite product and improve it`;
      } else {
        // Use truncated original
        title = originalText.replace(/\s+/g, ' ').trim();
      }
    } else {
      // No product found, use truncated original
      title = originalText.replace(/\s+/g, ' ').trim();
    }
  }

  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Smart truncation - find natural break point
  if (title.length > 70) {
    // Try to end at natural boundaries
    const breakPoints = [
      title.lastIndexOf('?', 70),
      title.lastIndexOf('.', 70),
      title.lastIndexOf(',', 70),
      title.lastIndexOf(' and ', 70),
      title.lastIndexOf(' or ', 70),
      title.lastIndexOf(' for ', 70),
      title.lastIndexOf(' to ', 70),
      title.lastIndexOf(' ', 67),
    ];

    let cutoff = Math.max(...breakPoints.filter(i => i > 30));
    if (cutoff < 30) cutoff = 67;

    title = title.substring(0, cutoff).trim();

    // Remove any trailing incomplete words or punctuation
    title = title.replace(/[\s,;:-]+$/, '');
  }

  return title;
}

// Clean up description text
function cleanDescription(desc) {
  let clean = fixTypos(desc);

  // Fix spacing issues
  clean = clean.replace(/\s+/g, ' ').trim();
  clean = clean.replace(/\s+([.,;:?!])/g, '$1');

  // Capitalize first letter
  if (clean.length > 0 && clean[0] === clean[0].toLowerCase()) {
    clean = clean[0].toUpperCase() + clean.slice(1);
  }

  // Ensure it ends with proper punctuation
  if (clean.length > 0 && !/[.?!]$/.test(clean)) {
    clean += '.';
  }

  // Truncate very long descriptions
  if (clean.length > 300) {
    let cutoff = clean.lastIndexOf('. ', 297);
    if (cutoff < 150) cutoff = clean.lastIndexOf(' ', 297);
    if (cutoff < 150) cutoff = 297;
    clean = clean.substring(0, cutoff).trim();
    if (!clean.endsWith('.') && !clean.endsWith('?')) {
      clean += '...';
    }
  }

  return clean;
}

// Parse all questions
const questions = [];
let idCounter = 1;

for (const line of dataLines) {
  const parts = parseCSVLine(line);
  if (parts.length < 5) continue;

  const [rawQuestion, typeRaw, companyRaw, firstRoundStr, finalRoundStr] = parts;

  if (!rawQuestion || !typeRaw || !companyRaw) continue;

  const type = typeMapping[typeRaw] || 'product-sense';
  const companySlug = normalizeCompanySlug(companyRaw);

  // Skip questions with invalid company slugs
  if (!companySlug) continue;

  const numFirstRound = parseInt(firstRoundStr) || 0;
  const numFinalRound = parseInt(finalRoundStr) || 0;
  const frequency = getFrequency(numFirstRound, numFinalRound);

  // Clean question text
  let fullQuestion = rawQuestion.replace(/\n/g, ' ').trim();

  // Skip if question is too short or looks malformed
  if (fullQuestion.length < 15) continue;

  // Apply typo fixes first
  fullQuestion = fixTypos(fullQuestion);

  // Extract clean title from full question
  let cleanTitle = extractTitle(fullQuestion);

  // If title extraction left us with something too short, use truncated full question
  if (cleanTitle.length < 15) {
    cleanTitle = fullQuestion.length > 70 ? fullQuestion.substring(0, 67) + '...' : fullQuestion;
  }

  // Clean up the description
  let cleanDesc = cleanDescription(fullQuestion);

  // Escape quotes for TypeScript output
  cleanTitle = cleanTitle.replace(/"/g, '\\"');
  cleanDesc = cleanDesc.replace(/"/g, '\\"');

  questions.push({
    id: `pm-${idCounter++}`,
    companySlug,
    title: cleanTitle,
    type,
    difficulty: 'medium',
    track: 'product-management',
    numFirstRound,
    numFinalRound,
    frequency,
    description: cleanDesc,
  });
}

// Group by company
const byCompany = {};
for (const q of questions) {
  if (!byCompany[q.companySlug]) {
    byCompany[q.companySlug] = [];
  }
  byCompany[q.companySlug].push(q);
}

console.log(`Parsed ${questions.length} questions from ${Object.keys(byCompany).length} companies`);

// Generate TypeScript file
let output = `import { Question } from "@/types";

export const pmQuestions: Question[] = [
`;

for (const q of questions) {
  output += `  {
    id: "${q.id}",
    companySlug: "${q.companySlug}",
    title: "${q.title}",
    type: "${q.type}",
    difficulty: "${q.difficulty}",
    track: "${q.track}",
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
console.log(`Written to ${outputPath}`);
