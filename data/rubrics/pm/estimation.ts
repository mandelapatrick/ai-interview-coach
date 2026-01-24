import { AssessmentRubric, CalibratedExample } from "../types";

export const estimationRubric: AssessmentRubric = {
  questionType: "estimation",
  passingScore: 3,
  maxScore: 5,
  dimensions: [
    {
      id: "problemDecomposition",
      name: "Problem Decomposition",
      weight: 30,
      description:
        "Evaluates ability to break down complex problems into manageable components with clear structure.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in decomposition",
          indicators: [
            "No clear breakdown attempted",
            "Jumped to final number",
            "Missing key components",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak decomposition",
          indicators: [
            "Incomplete breakdown",
            "Missing important factors",
            "Unclear structure",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate decomposition",
          indicators: [
            "Basic breakdown with key components",
            "Structure present but not optimal",
            "Most factors considered",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong decomposition",
          indicators: [
            "Clear, logical breakdown",
            "Components well-organized",
            "MECE structure largely achieved",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive decomposition",
          indicators: [
            "Elegant breakdown into components",
            "MECE structure achieved",
            "Multiple valid approaches considered",
            "Clear formula expressed before calculating",
            "Top-down and bottom-up approaches compared",
          ],
        },
      ],
      commonIssues: [
        "Not stating approach before calculating",
        "Missing key factors",
        "Overlapping components (not MECE)",
        "No clear formula structure",
      ],
    },
    {
      id: "assumptionQuality",
      name: "Assumption Quality",
      weight: 25,
      description:
        "Evaluates reasonableness, explicitness, and justification of assumptions made.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major issues with assumptions",
          indicators: [
            "Unreasonable assumptions",
            "Assumptions not stated",
            "No justification provided",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak assumptions",
          indicators: [
            "Some unreasonable assumptions",
            "Limited justification",
            "Missing key assumptions",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate assumptions",
          indicators: [
            "Reasonable assumptions stated",
            "Some justification provided",
            "Most assumptions explicit",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong assumptions",
          indicators: [
            "Well-justified assumptions",
            "Tied to real-world knowledge",
            "Range of uncertainty acknowledged",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive assumptions",
          indicators: [
            "All assumptions explicitly stated",
            "Each assumption justified with reasoning",
            "Tied to verifiable benchmarks when possible",
            "Uncertainty ranges provided",
            "Sensitivity to key assumptions noted",
          ],
        },
      ],
      commonIssues: [
        "Assumptions not stated explicitly",
        "Unrealistic numbers without justification",
        "Not using available benchmarks",
        "Ignoring uncertainty in assumptions",
      ],
    },
    {
      id: "calculationAccuracy",
      name: "Calculation Accuracy",
      weight: 25,
      description:
        "Evaluates mathematical correctness, order of magnitude reasoning, and arithmetic clarity.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major calculation errors",
          indicators: [
            "Significant math errors",
            "Wrong order of magnitude",
            "Cannot follow arithmetic",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak calculations",
          indicators: [
            "Some arithmetic errors",
            "Order of magnitude questionable",
            "Hard to follow steps",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate calculations",
          indicators: [
            "Basic math correct",
            "Order of magnitude reasonable",
            "Steps mostly clear",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong calculations",
          indicators: [
            "Accurate arithmetic",
            "Clear step-by-step process",
            "Good use of rounding for simplification",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive calculations",
          indicators: [
            "Accurate arithmetic throughout",
            "Clear step-by-step with intermediate results",
            "Smart simplifications that maintain accuracy",
            "Units tracked correctly",
            "Order of magnitude checks along the way",
          ],
        },
      ],
      commonIssues: [
        "Arithmetic errors in multiplication/division",
        "Losing track of zeros (millions vs billions)",
        "Not tracking units",
        "Over-precise calculations (false precision)",
      ],
    },
    {
      id: "sanityCheck",
      name: "Sanity Check & Validation",
      weight: 20,
      description:
        "Evaluates ability to validate results against known benchmarks and alternative approaches.",
      scoringCriteria: [
        {
          score: 1,
          description: "No validation attempted",
          indicators: [
            "No sanity check performed",
            "Accepted clearly unreasonable result",
            "No comparison to benchmarks",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak validation",
          indicators: [
            "Minimal sanity check",
            "No benchmark comparison",
            "Didn't catch obvious issues",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate validation",
          indicators: [
            "Basic sanity check performed",
            "Result seems reasonable",
            "Some benchmark awareness",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong validation",
          indicators: [
            "Clear sanity check with rationale",
            "Compared to known benchmarks",
            "Caught and corrected errors",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive validation",
          indicators: [
            "Multiple validation approaches used",
            "Compared against public benchmarks",
            "Alternative calculation method used to verify",
            "Confidence interval provided",
            "Clear statement of what could affect accuracy",
          ],
        },
      ],
      commonIssues: [
        "Accepting clearly wrong results",
        "No comparison to known numbers",
        "Not questioning surprising results",
        "No confidence interval or range",
      ],
    },
  ],
};

export const estimationExamples: CalibratedExample[] = [
  {
    id: "google-searches",
    questionTitle: "How many Google searches happen per day globally?",
    company: "Google",
    transcriptSummary: `Candidate structured the estimation with clear top-down approach.

PROBLEM DECOMPOSITION: Broke down as: Global internet users × % who use Google × Searches per Google user per day.
Formula: Internet users × Google market share × Searches/user/day
Alternative approach mentioned: Could also calculate from device-hours perspective.

ASSUMPTION QUALITY:
- Global internet users: 5 billion (stated ~60% of 8B population have internet access)
- Google search market share: 90% (justified by search market dominance)
- Searches per user per day: 4 (reasoning: some users search 10+/day, many search 0-1, average ~4)
Each assumption stated with brief justification and acknowledged uncertainty.

CALCULATION ACCURACY:
5B × 0.9 = 4.5B Google users
4.5B × 4 searches/day = 18 billion searches/day
Rounded to ~15-20 billion searches per day as range.
Tracked units throughout, used clean rounding.

SANITY CHECK: Compared to known data point that Google processes "trillions" of searches per year. 15B/day × 365 = ~5.5 trillion/year - aligns with reported range. Also checked: 18B/5B users = 3.6 per capita globally seems reasonable when including non-users.`,
    scores: {
      problemDecomposition: 4,
      assumptionQuality: 4,
      calculationAccuracy: 4.5,
      sanityCheck: 4.5,
    },
    overallScore: 4.2,
    scoreJustifications: {
      problemDecomposition:
        "Clear formula stated upfront. MECE breakdown. Mentioned alternative approach. Could have explored bottom-up more fully.",
      assumptionQuality:
        "Each assumption stated with justification. Reasonable numbers tied to real knowledge. Good acknowledgment of uncertainty.",
      calculationAccuracy:
        "Correct arithmetic throughout. Clean rounding used appropriately. Units tracked. Provided range rather than false precision.",
      sanityCheck:
        "Strong validation against Google's public statement. Per-capita check shows depth. Could have tried alternative calculation approach.",
    },
    strengths: [
      "Clear formula before calculating",
      "Each assumption explicitly justified",
      "Range provided rather than single number",
      "Strong benchmark validation",
    ],
    improvements: [
      "Could have calculated from device-hours as alternative",
      "Could segment by region (developed vs developing)",
      "Could discuss what would most affect the estimate",
    ],
  },
  {
    id: "uber-drivers-sf",
    questionTitle: "How many Uber drivers are there in San Francisco?",
    company: "Uber",
    transcriptSummary: `Candidate used demand-based estimation approach.

PROBLEM DECOMPOSITION: Approached from demand side: How many rides needed per day → Rides per driver per day → Number of drivers needed.
Formula: Daily rides ÷ Rides per driver per shift
Could also approach from supply: Population × driver participation rate.

ASSUMPTION QUALITY:
- SF population: 900,000 (stated as Bay Area proper)
- Daily riders: 10% of population = 90,000 daily unique riders
- Rides per person per day: 1.5 (some take multiple rides)
- Total daily rides: 90,000 × 1.5 = 135,000
- Rides per driver per shift: 15 (8-hour shift, ~2 rides/hour)
- Drivers needed per shift: 135,000 ÷ 15 = 9,000
- But drivers don't work every day, assume 50% utilization
Assumptions were reasonable but some lacking detailed justification.

CALCULATION ACCURACY:
Daily rides: 135,000
Drivers per shift: 135,000 ÷ 15 = 9,000
Accounting for part-time/utilization: 9,000 × 2 = 18,000 total drivers
Range: 15,000 - 20,000 drivers
Some arithmetic verified verbally.

SANITY CHECK: Per capita check: 18,000 drivers for 900K population = 2% of population. Seems high. Adjusted to consider broader Bay Area pool. Mentioned that Uber has reported driver numbers could be verified.`,
    scores: {
      problemDecomposition: 3.5,
      assumptionQuality: 3,
      calculationAccuracy: 3.5,
      sanityCheck: 3,
    },
    overallScore: 3.3,
    scoreJustifications: {
      problemDecomposition:
        "Good demand-side approach. Alternative mentioned. Formula clear but could be more explicit about part-time factor.",
      assumptionQuality:
        "Assumptions stated but some lacking strong justification. 10% daily rider rate needs more backing. Part-time factor reasonable but arbitrary.",
      calculationAccuracy:
        "Math correct but 2x multiplier for part-time feels imprecise. Range provided which is good. Could be cleaner.",
      sanityCheck:
        "Good that per-capita check raised flag. But didn't fully resolve the concern. Could have looked at known gig economy benchmarks.",
    },
    strengths: [
      "Demand-driven approach is logical",
      "Considered part-time driver factor",
      "Provided range not single number",
      "Per-capita check caught potential issue",
    ],
    improvements: [
      "Justify 10% daily ridership more rigorously",
      "Could segment by time of day (peak vs off-peak)",
      "Resolve the per-capita concern with better data",
      "Compare to other gig economy participation rates",
    ],
  },
];
