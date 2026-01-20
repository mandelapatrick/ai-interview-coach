import { AssessmentRubric, CalibratedExample } from "./types";

export const productSenseRubric: AssessmentRubric = {
  questionType: "product-sense",
  passingScore: 3,
  maxScore: 5,
  dimensions: [
    {
      id: "productMotivation",
      name: "Product Motivation & Mission",
      weight: 20,
      description:
        "Evaluates the candidate's ability to articulate why the product exists, its connection to company mission, and market context.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in understanding product fundamentals",
          indicators: [
            "No clear mission statement",
            "No connection to company strategy",
            "Missing market context entirely",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak foundation",
          indicators: [
            "Vague mission statement",
            "Weak company mission alignment",
            "Limited market understanding",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate foundation",
          indicators: [
            "Clear mission aligned to company",
            "Basic market context provided",
            "Reasonable value proposition",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong foundation",
          indicators: [
            "Specific mission with strategic relevance",
            "Good market insight and competitive awareness",
            "Clear articulation of why this matters now",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive and compelling",
          indicators: [
            "Clear description of product/experience fundamentals",
            "Strong connection to company mission",
            "Compelling articulation of market gaps/needs",
            "Deep insight into why this matters now",
            "Specific, actionable mission statement",
          ],
        },
      ],
      commonIssues: [
        "Generic mission statements",
        "Missing status quo analysis",
        "Weak connection to company strategy",
        "Insufficient market context",
      ],
    },
    {
      id: "targetAudience",
      name: "Target Audience",
      weight: 25,
      description:
        "Evaluates segmentation quality, ecosystem understanding, prioritization rationale, and persona development.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in audience understanding",
          indicators: [
            "No clear segments identified",
            "Missing key stakeholders",
            "No prioritization rationale",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak segmentation",
          indicators: [
            "Overlapping or vague segments",
            "Limited ecosystem view",
            "Weak selection rationale",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate segmentation",
          indicators: [
            "Identified segments with basic rationale",
            "Some ecosystem awareness",
            "Basic persona created",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong segmentation",
          indicators: [
            "Comprehensive ecosystem analysis",
            "Clear segmentation with strong prioritization logic",
            "Well-developed persona with specific details",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive audience analysis",
          indicators: [
            "Comprehensive ecosystem player identification",
            "Clear rationale for selected group",
            "Well-defined, mutually exclusive segments",
            "Strong prioritization framework (2 dimensions)",
            "Vivid, specific persona development",
          ],
        },
      ],
      commonIssues: [
        "Overlapping segments",
        "Missing key stakeholders",
        "Weak segment prioritization rationale",
        "Overly broad/generic segments",
      ],
    },
    {
      id: "problemIdentification",
      name: "Problem Identification",
      weight: 25,
      description:
        "Evaluates user journey mapping, problem definition (not needs), severity/frequency analysis, and prioritization.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in problem identification",
          indicators: [
            "No user journey mapping",
            "Listing needs instead of problems",
            "No prioritization",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak problem definition",
          indicators: [
            "Generic pre/during/post journey",
            "Similar or overlapping problems",
            "Weak prioritization logic",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate problem work",
          indicators: [
            "Basic user journey with 3 distinct problems",
            "Some severity/frequency consideration",
            "Reasonable prioritization",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong problem analysis",
          indicators: [
            "Specific journey tied to persona",
            "Clear severity/frequency scoring",
            "Strong prioritization with clear rationale",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive problem identification",
          indicators: [
            "Complete user journey mapping (specific day-in-the-life)",
            "Distinct problems tied to journey steps",
            "Clear severity/frequency scoring",
            "Problems align with target segment",
            "Strong prioritization rationale",
          ],
        },
      ],
      commonIssues: [
        "Listing needs instead of problems",
        "Similar/overlapping problems",
        "Missing journey steps",
        "Weak problem prioritization",
      ],
    },
    {
      id: "solutionDevelopment",
      name: "Solution Development",
      weight: 20,
      description:
        "Evaluates solution creativity, feasibility evaluation, MVP definition, and risk analysis.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in solution development",
          indicators: [
            "Solutions don't address the problem",
            "No evaluation criteria",
            "No MVP or risk consideration",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak solutions",
          indicators: [
            "Similar solutions with minor variations",
            "Missing feasibility consideration",
            "Vague MVP definition",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate solutions",
          indicators: [
            "Three distinct solutions presented",
            "Basic impact/effort evaluation",
            "Reasonable MVP scope",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong solutions",
          indicators: [
            "Creative, feasible solutions",
            "Detailed MVP with clear scope",
            "Risk identification with mitigations",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive solution development",
          indicators: [
            "Three truly distinct solution approaches",
            "Clear impact/effort evaluation",
            "Solutions directly address chosen problem",
            "Detailed MVP description",
            "Thoughtful risk analysis with mitigations",
          ],
        },
      ],
      commonIssues: [
        "Solutions don't solve core problem",
        "Similar solutions with minor variations",
        "Missing technical feasibility consideration",
        "Weak MVP definition",
      ],
    },
    {
      id: "communicationStructure",
      name: "Communication Structure",
      weight: 10,
      description:
        "Evaluates interview execution, framework usage, time management, and interviewer interaction.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major communication issues",
          indicators: [
            "No clear structure",
            "Rambling responses",
            "No interviewer engagement",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak communication",
          indicators: [
            "Unclear transitions",
            "Poor time management",
            "Limited check-ins",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate communication",
          indicators: [
            "Basic structure followed",
            "Some check-ins with interviewer",
            "Reasonable time management",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong communication",
          indicators: [
            "Clear section transitions",
            "Regular interviewer check-ins",
            "Good time management",
          ],
        },
        {
          score: 5,
          description: "Exceptional - excellent communication",
          indicators: [
            "Clear section transitions",
            "Regular interviewer check-ins",
            "Efficient time management",
            "Structured thinking demonstration",
            "Clear prioritization frameworks throughout",
          ],
        },
      ],
      commonIssues: [
        "Poor time management",
        "Missing check-ins with interviewer",
        "Unclear structure",
        "Rambling/unfocused responses",
      ],
    },
  ],
};

// Condensed calibrated examples for few-shot prompting
export const productSenseExamples: CalibratedExample[] = [
  {
    id: "google-maps-parking",
    questionTitle: "Design a parking solution for Google Maps",
    company: "Google",
    transcriptSummary: `Candidate structured the interview with clear assumptions (US market, within Google Maps, focus on cars).

PRODUCT MOTIVATION: Connected to Google's mission of organizing information. Mission: "Help users navigate confidently to any destination by providing comprehensive guidance including parking."

TARGET AUDIENCE: Identified 6 ecosystem players (drivers, parking operators, cities, businesses, property managers, tech providers). Created 3 segments: (1) Urban professionals in unfamiliar areas (chosen), (2) Suburban errand-runners, (3) Event parking seekers. Developed persona: Sarah, 32-year-old management consultant.

PROBLEM IDENTIFICATION: Mapped 7-step journey (pre-trip → en-route → approaching → finding parking → walking → returning → exiting). Identified 3 problems: (1) Uncertainty about parking availability (chosen), (2) Incomplete cost/restriction info, (3) Navigation ends at destination not parking. Successfully defended choice when interviewer challenged.

SOLUTION DEVELOPMENT: Proposed 3 solutions: (1) Smart Parking Predictions (chosen), (2) Crowdsourced Parking Finder, (3) Parking Reservation Integration. MVP: Focus on garages in 2-3 cities with availability indicators and historical patterns.

COMMUNICATION: Regular check-ins, handled interviewer pushback professionally, maintained structure throughout.`,
    scores: {
      productMotivation: 3,
      targetAudience: 4,
      problemIdentification: 4,
      solutionDevelopment: 3,
      communicationStructure: 4,
    },
    overallScore: 3.6,
    scoreJustifications: {
      productMotivation:
        "Clear mission aligned to Google but could have detailed current pain points and competitive landscape more.",
      targetAudience:
        "Strong ecosystem analysis with 6 players, clear segments, good persona. Used reach/mission alignment for prioritization.",
      problemIdentification:
        "Comprehensive 7-step journey, distinct problems, successfully defended choice under pressure.",
      solutionDevelopment:
        "Three solutions presented but could have been more innovative and leveraged Google's technical capabilities more.",
      communicationStructure:
        "Good structure, regular check-ins, handled challenge well. Could be more concise in some sections.",
    },
    strengths: [
      "Structured approach maintained throughout",
      "Strong segmentation framework with clear prioritization",
      "Good handling of interviewer challenge on problem selection",
      "Comprehensive MVP with risks identified",
    ],
    improvements: [
      "Could have explored competitive landscape in motivation",
      "Solutions could leverage Google's technical capabilities more",
      "Could provide more specific data points",
    ],
  },
  {
    id: "meta-theme-park",
    questionTitle: "Build a product to help people enjoy theme parks at Meta",
    company: "Meta",
    transcriptSummary: `Candidate connected product to Meta's mission of bringing people together from the start.

PRODUCT MOTIVATION: Clear mission statement: "Make theme park visits more social, coordinated, and memorable." Strong tie to Meta's core mission with clear societal impact framing.

TARGET AUDIENCE: Identified ecosystem (visitors, operators, content creators, local businesses). Segmented visitors: (1) Family Organizers (chosen), (2) Friend Group Coordinators, (3) Solo Enthusiasts. Used reach/mission alignment framework. Created specific persona: Sarah, 35, mother of two.

PROBLEM IDENTIFICATION: Mapped journey (pre-visit → arrival → in-park → memory capture → post-visit). Identified 3 problems: (1) Group Coordination Chaos (chosen), (2) Memory Fragmentation, (3) Social Planning Friction. Used frequency/severity framework for prioritization.

SOLUTION DEVELOPMENT: Proposed 3 distinct solutions: (1) Theme Park Companion (chosen), (2) Park Lens, (3) ParkPal Groups. Used impact/effort framework. Detailed MVP scope with comprehensive derisking strategy addressing technical risks, privacy, and adoption challenges.

COMMUNICATION: Clear transitions, deliberate pauses between sections, consistent framework usage, tied everything back to mission.`,
    scores: {
      productMotivation: 4,
      targetAudience: 4.5,
      problemIdentification: 4,
      solutionDevelopment: 4.5,
      communicationStructure: 4,
    },
    overallScore: 4.2,
    scoreJustifications: {
      productMotivation:
        "Strong mission alignment with Meta's core purpose. Clear statement with societal impact. Could include more market analysis.",
      targetAudience:
        "Excellent ecosystem understanding, clear mutually exclusive segments, strong prioritization with 2 dimensions, specific persona.",
      problemIdentification:
        "Good journey mapping with 5 steps, distinct problems, clear frequency/severity scoring, strong alignment to segment.",
      solutionDevelopment:
        "Three truly distinct solutions, clear impact/effort evaluation, detailed MVP, comprehensive derisking strategy.",
      communicationStructure:
        "Clear structure and transitions, consistent frameworks, good time management. Could be more concise.",
    },
    strengths: [
      "Strong connection to company mission throughout",
      "Excellent use of prioritization frameworks (Rule of 3s, Rule of 2s)",
      "Comprehensive risk management and derisking strategy",
      "Clear persona with specific details",
    ],
    improvements: [
      "More quantitative analysis in segmentation",
      "More specific examples throughout",
      "Could include success metrics definition",
      "Deeper technical considerations",
    ],
  },
];
