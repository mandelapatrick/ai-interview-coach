import { AssessmentRubric, CalibratedExample } from "../types";

export const strategyRubric: AssessmentRubric = {
  questionType: "strategy",
  passingScore: 3,
  maxScore: 5,
  dimensions: [
    {
      id: "marketUnderstanding",
      name: "Market Understanding",
      weight: 25,
      description:
        "Evaluates understanding of market size, dynamics, trends, and growth drivers.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in market understanding",
          indicators: [
            "No market sizing attempted",
            "Missing key market dynamics",
            "No trend awareness",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak market analysis",
          indicators: [
            "Vague market size estimates",
            "Limited understanding of dynamics",
            "Missing growth drivers",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate market analysis",
          indicators: [
            "Basic market sizing with TAM/SAM",
            "Key trends identified",
            "Some growth drivers mentioned",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong market analysis",
          indicators: [
            "Clear TAM/SAM/SOM breakdown",
            "Good trend analysis",
            "Growth drivers well-articulated",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive market analysis",
          indicators: [
            "Rigorous TAM/SAM/SOM with methodology",
            "Clear understanding of market dynamics",
            "Key trends with implications identified",
            "Growth drivers with quantification",
            "Market timing considerations",
          ],
        },
      ],
      commonIssues: [
        "No TAM/SAM/SOM distinction",
        "Missing market trends",
        "Not quantifying market opportunity",
        "Ignoring market timing",
      ],
    },
    {
      id: "competitiveAnalysis",
      name: "Competitive Analysis",
      weight: 25,
      description:
        "Evaluates competitive landscape understanding, differentiation identification, and positioning.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in competitive understanding",
          indicators: [
            "No competitors identified",
            "No differentiation strategy",
            "Missing competitive dynamics",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak competitive analysis",
          indicators: [
            "Few competitors mentioned",
            "Vague differentiation",
            "Surface-level comparison",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate competitive analysis",
          indicators: [
            "Key competitors identified",
            "Basic strengths/weaknesses",
            "Some differentiation articulated",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong competitive analysis",
          indicators: [
            "Comprehensive competitor mapping",
            "Clear differentiation strategy",
            "Competitive dynamics understood",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive competitive analysis",
          indicators: [
            "Direct and indirect competitors mapped",
            "Clear strengths/weaknesses analysis",
            "Differentiation with sustainability",
            "Competitive moats identified",
            "Anticipated competitive responses",
          ],
        },
      ],
      commonIssues: [
        "Missing indirect competitors",
        "No sustainable differentiation",
        "Not considering competitive response",
        "Overestimating own advantages",
      ],
    },
    {
      id: "strategicOptions",
      name: "Strategic Options & Go-to-Market",
      weight: 25,
      description:
        "Evaluates ability to generate strategic alternatives, go-to-market thinking, and pricing strategy.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in strategic thinking",
          indicators: [
            "No clear strategy proposed",
            "Missing go-to-market plan",
            "No pricing consideration",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak strategy",
          indicators: [
            "Limited strategic options",
            "Vague go-to-market approach",
            "Weak pricing rationale",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate strategy",
          indicators: [
            "Multiple options considered",
            "Basic go-to-market plan",
            "Reasonable pricing approach",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong strategy",
          indicators: [
            "Well-developed strategic options",
            "Clear go-to-market with channels",
            "Pricing strategy justified",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive strategy",
          indicators: [
            "Multiple strategic options with tradeoffs",
            "Clear go-to-market with channel strategy",
            "Pricing with value-based rationale",
            "Customer acquisition approach",
            "Partnership and ecosystem strategy",
          ],
        },
      ],
      commonIssues: [
        "Only one option considered",
        "No channel strategy",
        "Pricing without value justification",
        "Missing customer acquisition plan",
      ],
    },
    {
      id: "decisionFramework",
      name: "Decision Framework & Risk Assessment",
      weight: 25,
      description:
        "Evaluates ability to make clear recommendations with rationale and risk assessment.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in decision-making",
          indicators: [
            "No clear recommendation",
            "Missing rationale",
            "No risk consideration",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak decision-making",
          indicators: [
            "Unclear recommendation",
            "Weak rationale",
            "Limited risk awareness",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate decision-making",
          indicators: [
            "Clear recommendation made",
            "Basic rationale provided",
            "Some risks identified",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong decision-making",
          indicators: [
            "Well-justified recommendation",
            "Decision criteria explicit",
            "Key risks with mitigations",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive decision framework",
          indicators: [
            "Clear recommendation with explicit criteria",
            "Pros/cons of alternatives weighed",
            "Risks identified with mitigations",
            "Success metrics defined",
            "'What would change my mind' articulated",
          ],
        },
      ],
      commonIssues: [
        "Hedging without clear recommendation",
        "No decision criteria stated",
        "Ignoring risks",
        "No success metrics",
        "Not stating what would change decision",
      ],
    },
  ],
};

export const strategyExamples: CalibratedExample[] = [
  {
    id: "spotify-podcasts",
    questionTitle: "Should Spotify invest heavily in exclusive podcasts?",
    company: "Spotify",
    transcriptSummary: `Candidate structured the analysis with clear market and competitive framing.

MARKET UNDERSTANDING: Podcast market ~$20B globally, growing 25% annually. Spotify has 31% of listening market but <5% of advertising revenue. Key trends: audio content growing, advertisers shifting to podcasts, exclusive content driving subscriber retention in streaming.

COMPETITIVE ANALYSIS: Direct competitors (Apple Podcasts, Amazon Music) investing heavily. Apple has distribution advantage, Amazon has advertising infrastructure. Spotify's differentiation: personalization algorithms, cross-platform presence, creator tools. Risk: content costs escalating like Netflix's.

STRATEGIC OPTIONS:
1. Go all-in on exclusives (high cost, high differentiation) - $500M+ annual investment
2. Platform play (creator tools, monetization) - $100M investment, slower differentiation
3. Hybrid (selective exclusives + platform) - $250M, balanced approach
Evaluated on: differentiation, cost efficiency, creator ecosystem health.

DECISION FRAMEWORK:
Recommendation: Hybrid approach. Selective exclusives for brand-building (Joe Rogan-type deals) while building platform tools for long-tail creators.
Rationale: Pure exclusive strategy has unsustainable economics (Netflix warning). Platform strategy too slow given Apple/Amazon moves.
Risks: Content costs still significant, may not win exclusive bidding wars.
Success metrics: Creator growth rate, exclusive show completion rates, subscriber churn reduction.
Would change if: Creator monetization proves sufficient alone or exclusive costs rise 2x.`,
    scores: {
      marketUnderstanding: 4,
      competitiveAnalysis: 4,
      strategicOptions: 4.5,
      decisionFramework: 4,
    },
    overallScore: 4.1,
    scoreJustifications: {
      marketUnderstanding:
        "Strong market sizing with growth rate. Good understanding of Spotify's position. Could have detailed TAM/SAM/SOM more rigorously.",
      competitiveAnalysis:
        "Good competitor mapping with clear differentiation. Netflix analogy shows depth. Could have explored more indirect competitors.",
      strategicOptions:
        "Three clear options with cost estimates and evaluation criteria. Good go-to-market thinking implicit. Strong tradeoff articulation.",
      decisionFramework:
        "Clear recommendation with rationale tied to analysis. Risks identified. Success metrics defined. Good 'what would change mind' statement.",
    },
    strengths: [
      "Clear framework from market to recommendation",
      "Concrete cost estimates for each option",
      "Netflix analogy shows strategic depth",
      "Balanced recommendation with clear rationale",
    ],
    improvements: [
      "More rigorous TAM/SAM/SOM breakdown",
      "Could quantify risk scenarios",
      "Could discuss international market differences",
      "Could detail creator acquisition strategy",
    ],
  },
  {
    id: "uber-grocery",
    questionTitle: "Should Uber expand into grocery delivery?",
    company: "Uber",
    transcriptSummary: `Candidate analyzed the strategic opportunity with market and competitive lens.

MARKET UNDERSTANDING: US grocery delivery market ~$30B, growing 15% annually. COVID accelerated adoption from 3% to 10% penetration. Key drivers: convenience, time scarcity, habit formation. Uber's existing logistics network is key asset.

COMPETITIVE ANALYSIS: Instacart dominates (45% share), Amazon Fresh growing fast, DoorDash entering aggressively. Uber's position: Uber Eats has delivery network, but grocery is different (multi-item orders, cold chain, substitutions). Competitors have retailer relationships Uber lacks.

STRATEGIC OPTIONS:
1. Build grocery from scratch - high cost, full control, long timeline
2. Partner with existing grocers (Carrefour model) - faster launch, shared economics
3. Acquire regional player - immediate capability, integration risk
Considered channels: Uber Eats integration, standalone app, in-store pickup.

DECISION FRAMEWORK:
Recommendation: Partnership model with Uber Eats integration.
Rationale: Leverages existing user base and driver network. Lower capital requirement. Allows learning before deeper investment.
Key risks: Partner dependence, lower margins than owned inventory.
Success metrics: Order frequency from existing Uber Eats users, basket size, delivery efficiency.
Would change if: Partnership economics prove unsustainable or acquisition opportunity arises.`,
    scores: {
      marketUnderstanding: 3.5,
      competitiveAnalysis: 3.5,
      strategicOptions: 3.5,
      decisionFramework: 3.5,
    },
    overallScore: 3.5,
    scoreJustifications: {
      marketUnderstanding:
        "Good market sizing with COVID context. Understood key drivers. Could have detailed Uber's specific addressable market better.",
      competitiveAnalysis:
        "Key competitors identified with market share. Understood grocery differences. Could have explored Uber's specific competitive advantages more.",
      strategicOptions:
        "Three clear options presented. Good consideration of channels. Could have detailed go-to-market and pricing more.",
      decisionFramework:
        "Clear recommendation with rationale. Risks mentioned. Success metrics basic. Could be more specific on what would change decision.",
    },
    strengths: [
      "Clear strategic framework applied",
      "Good understanding of grocery vs food delivery differences",
      "Practical recommendation leveraging existing assets",
      "Considered multiple entry modes",
    ],
    improvements: [
      "More specific TAM/SAM for Uber specifically",
      "Could quantify economics of each option",
      "Could detail partnership structure more",
      "Could discuss international learnings (Carrefour)",
    ],
  },
];
