import { AssessmentRubric, CalibratedExample } from "../types";

export const analyticalThinkingRubric: AssessmentRubric = {
  questionType: "analytical-thinking",
  passingScore: 3,
  maxScore: 5,
  dimensions: [
    {
      id: "productRationale",
      name: "Product Rationale",
      weight: 15,
      description:
        "Evaluates understanding of product context, business model, competitive landscape, and mission statement definition.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in product understanding",
          indicators: [
            "No clear mission statement for product",
            "Missing business model consideration",
            "No connection to company strategy",
            "Confused product understanding",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak foundation",
          indicators: [
            "Superficial product overview",
            "Weak or missing mission statements",
            "Limited understanding of why company cares about this product",
            "Missing competitive context",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate foundation",
          indicators: [
            "Basic product description with some mission thinking",
            "Limited competitive context",
            "Shows reasonable grasp without deep strategic insight",
            "Basic understanding of product maturity stage",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong foundation",
          indicators: [
            "Covers most product context elements with clear mission statements",
            "Good strategic positioning",
            "Minor gaps in competitive analysis or business model understanding",
            "Clear articulation of product maturity stage",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive product rationale",
          indicators: [
            "States product description, use cases, maturity level, and business model",
            "Explains why users and company care",
            "Reviews competitors and limitations",
            "Articulates company mission and creates product mission statement",
            "Makes interviewer 'feel something' about why world needs this product",
          ],
        },
      ],
      commonIssues: [
        "Generic mission statements",
        "No business model consideration",
        "Relies on insider knowledge rather than first-principles reasoning",
        "Missing competitive landscape",
      ],
    },
    {
      id: "measuringImpact",
      name: "Measuring Impact",
      weight: 35,
      description:
        "Evaluates ecosystem player identification, metric definition with timeframes, North Star Metric selection, critique, and guardrail metrics.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in metric definition",
          indicators: [
            "Confused ecosystem analysis",
            "Undefined metrics like 'engagement'",
            "Inappropriate NSM choice (percentages/averages)",
            "No guardrail consideration",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak metrics",
          indicators: [
            "Unclear ecosystem players or value propositions",
            "Uses vanity metrics or averages inappropriately",
            "Weak NSM selection or missing guardrails",
            "Missing timeframe rationale",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate metrics",
          indicators: [
            "Identifies key ecosystem players with basic metrics",
            "Acceptable NSM selection",
            "Some vague metric definitions or missing timeframe rationale",
            "Basic understanding of guardrails concept",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong metrics",
          indicators: [
            "Good ecosystem analysis with mostly specific metrics and reasonable timeframes",
            "Solid NSM choice with adequate guardrails",
            "Minor issues in metric definitions or timeframe justification",
            "Critiques NSM with some strengths and drawbacks",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive impact measurement",
          indicators: [
            "Identifies 3+ ecosystem players with clear value propositions",
            "Defines specific metrics with DWM timeframes and mathematical precision",
            "Selects NSM that captures multi-player value and can grow infinitely",
            "Creates guardrails using percentages that directly address NSM weaknesses",
            "Critiques NSM with 2 strengths and 2 drawbacks",
          ],
        },
      ],
      commonIssues: [
        "Using percentages/averages as North Star (should use raw counts)",
        "Missing ecosystem players",
        "Vague metrics without timeframes",
        "No guardrail metrics defined",
        "Not defining what 'active' means in metrics",
      ],
    },
    {
      id: "settingGoals",
      name: "Setting Goals",
      weight: 25,
      description:
        "Evaluates ability to make altitude shift from product-level to team-level goals with prioritization.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in goal setting",
          indicators: [
            "No altitude shift",
            "Goals too high-level or disconnected from metrics",
            "Indecisive about prioritization",
            "No connection to North Star Metric",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak goals",
          indicators: [
            "Unclear transition from product to team level",
            "Goals require too much cross-team collaboration",
            "Unrealistic timeframes",
            "Weak prioritization rationale",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate goals",
          indicators: [
            "Shows some altitude shift thinking with basic goal identification",
            "Limited prioritization rationale or timeline consideration",
            "Basic connection to NSM",
            "Goals reasonably actionable by team",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong goals",
          indicators: [
            "Good team-level transition with reasonable player focus and timeline",
            "Solid goal prioritization with clear rationale",
            "Minor issues in feasibility assessment",
            "Clear connection to NSM improvement",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive goal setting",
          indicators: [
            "Makes clear altitude shift from 50,000-foot metrics to team level",
            "Justifies ecosystem player focus",
            "Proposes 3 goals for 3-6 months with impact/feasibility scoring",
            "Selects one goal decisively with clear NSM connection",
            "Explains specifically how goal will move North Star Metric",
          ],
        },
      ],
      commonIssues: [
        "Goals too broad for single team",
        "Missing prioritization framework",
        "No clear NSM connection",
        "Setting averages as goals (should use conversion rates)",
        "Setting specific percentage targets without data",
      ],
    },
    {
      id: "evaluatingTradeoffs",
      name: "Evaluating Tradeoffs",
      weight: 25,
      description:
        "Evaluates ability to make principled decisions between competing options with clear rationale.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in tradeoff evaluation",
          indicators: [
            "No clear tradeoff framework",
            "Indecisive or contradictory",
            "Doesn't connect back to mission or metrics",
            "Unable to articulate pros/cons",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak tradeoff handling",
          indicators: [
            "Unclear tradeoff framing",
            "Weak decision rationale",
            "Hedges or avoids clear recommendation",
            "Missing connection to mission",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate tradeoff handling",
          indicators: [
            "Basic tradeoff evaluation with some structured thinking",
            "Makes recommendation with limited rationale",
            "Some connection to earlier analysis",
            "Basic pros/cons identified",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong tradeoff handling",
          indicators: [
            "Good tradeoff structure with clear decision framework",
            "Solid recommendation with mission alignment",
            "Minor gaps in systematic analysis",
            "Considers what might change decision",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive tradeoff evaluation",
          indicators: [
            "Identifies tradeoff type (breadth vs depth, real estate, required vs optional)",
            "Clarifies common goal shared by both options",
            "Frames 2 pros/2 cons systematically",
            "Makes decisive recommendation tied to product mission",
            "Specifies what would change their mind",
          ],
        },
      ],
      commonIssues: [
        "Hedging without making a decision",
        "Not tying back to mission",
        "Missing 'what would change my mind' statement",
        "Purely data-driven without principle consideration",
        "Failing to identify the fundamental tradeoff type",
      ],
    },
  ],
};

// Condensed calibrated examples for few-shot prompting
export const analyticalThinkingExamples: CalibratedExample[] = [
  {
    id: "instagram-reels-success",
    questionTitle: "How would you measure success for Instagram Reels?",
    company: "Meta",
    transcriptSummary: `Candidate structured interview with clear assumptions (US market, mobile, within Instagram).

PRODUCT RATIONALE: Described Reels as Meta's short-form vertical video product responding to TikTok. Connected to Meta's mission of building community. Created mission: "Empower creators to share engaging short-form videos that entertain and connect the Instagram community." Identified growth stage maturity.

MEASURING IMPACT: Identified 4 ecosystem players:
- Viewers/Consumers: Value = entertainment/discovery. Health metric = Daily active reels viewers, average watch time per user per day
- Creators: Value = audience reach, expression. Health metric = Daily active creators posting, reels uploaded per creator per week
- Advertisers: Value = reach engaged audiences. Health metric = Ad impressions, CPM rates
- Meta: Value = engagement, revenue. Health metric = Time spent on platform

NSM Selection: "Total reels watch time per week" - captures content engagement, gives ad inventory, signals creator success.
NSM Critique: Strengths: (1) Indicates engaging content, (2) Gives ad inventory. Drawbacks: (1) Could increase with degraded quality, (2) Doesn't capture creator sustainability.
Guardrails: (1) Average completion rate per reel > baseline, (2) Creator retention rate - % posting in consecutive months.

SETTING GOALS: Focused on creators (supply drives demand). Mapped creator journey: create/edit → post → reach viewers → engagement → analytics → monetization.
Goals scored on impact/influence:
1. Increase reel creation completion rate (High/High) - CHOSEN
2. Increase creator posting frequency (High/Medium)
3. Improve new creator retention (Medium/High)
Selected goal 1 - directly feeds content supply which drives watch time.

EVALUATING TRADEOFFS: Asked "Should Reels or Stories be at top of Instagram?"
Identified as real estate tradeoff. Common goal: Both drive engagement within Instagram.
Reels pros: Accelerates TikTok competition, higher monetization potential. Cons: Shifts identity from social, risks Stories engagement.
Stories pros: Maintains social core, preserves familiar UX. Cons: Slower Reels growth, less aggressive vs TikTok.
Decision: Keep Stories - it's Instagram's core social differentiator. Would revisit if Stories engagement plateaus while Reels grows rapidly.`,
    scores: {
      productRationale: 4,
      measuringImpact: 4.5,
      settingGoals: 4,
      evaluatingTradeoffs: 4,
    },
    overallScore: 4.2,
    scoreJustifications: {
      productRationale:
        "Strong mission alignment with Meta's purpose, clear maturity stage identification, good competitive context. Could have detailed business model more explicitly.",
      measuringImpact:
        "Excellent 4-player ecosystem analysis with specific metrics and timeframes. Strong NSM selection with raw count (watch time), comprehensive critique with 2+2, and targeted guardrails.",
      settingGoals:
        "Good altitude shift focusing on creators. Clear 3-goal framework with impact/influence scoring. Strong rationale for selected goal connecting to NSM.",
      evaluatingTradeoffs:
        "Identified tradeoff type correctly, articulated common goal, structured pros/cons, made decisive recommendation tied to mission with 'what would change mind' statement.",
    },
    strengths: [
      "Strong ecosystem analysis with 4 distinct players",
      "NSM selection follows best practices (raw count, can grow infinitely)",
      "Clear guardrails that directly address NSM weaknesses",
      "Decisive tradeoff recommendation with reversibility criteria",
    ],
    improvements: [
      "Could define 'active' more precisely in metrics",
      "Could include more quantitative timeframe justification",
      "Business model section could be expanded",
    ],
  },
  {
    id: "facebook-events-goals",
    questionTitle: "What goals would you set for Facebook Events?",
    company: "Meta",
    transcriptSummary: `Candidate set up assumptions (US market, focus on consumer events not business).

PRODUCT RATIONALE: Facebook Events helps people discover and coordinate attendance at events. Connects to Meta's mission of bringing world closer together. Mission: "Help people discover meaningful events and connect with others who share their interests." Identified as mature product.

MEASURING IMPACT: Identified 3 ecosystem players:
- Event Attendees: Value = discover relevant events, coordinate with friends. Metrics = Daily event RSVPs, events attended per user monthly
- Event Organizers: Value = reach audience, drive attendance. Metrics = Events created per organizer, attendees per event
- Meta: Value = engagement, keeping users on platform. Metrics = Time in events surface, ad revenue from events

NSM Selection: "Weekly events RSVPs" - captures both discovery (finding events) and intent (deciding to attend).
NSM Critique: Strengths: (1) Shows product driving real-world action, (2) Reflects both sides of marketplace. Drawbacks: (1) RSVP doesn't mean attendance, (2) Doesn't capture event quality.
Guardrails: (1) RSVP-to-attendance rate, (2) Event organizer retention.

SETTING GOALS: Focused on attendees (demand drives organizer participation). Journey: Browse/discover → View event → RSVP → Get reminded → Attend → Share experience.
Goals:
1. Increase browse-to-RSVP conversion rate (High/High) - CHOSEN
2. Improve event recommendation relevance (High/Medium)
3. Increase post-event sharing (Medium/Medium)
Selected goal 1 as most directly tied to NSM with high ability to influence through UX improvements.

EVALUATING TRADEOFFS: Asked "Should we prioritize local community events or large public events?"
Identified as breadth vs depth tradeoff. Common goal: Drive RSVPs and meaningful connections.
Local events pros: Higher attendance rates, stronger community. Cons: Lower scale, harder to grow.
Public events pros: Higher reach, more viral. Cons: Lower personal connection, competes with ticketing platforms.
Decision: Prioritize local - aligns with Meta's community mission and Facebook's differentiation from pure ticketing sites. Would shift if local event supply becomes limiting factor.`,
    scores: {
      productRationale: 3,
      measuringImpact: 3.5,
      settingGoals: 3.5,
      evaluatingTradeoffs: 3.5,
    },
    overallScore: 3.4,
    scoreJustifications: {
      productRationale:
        "Basic mission statement present and connected to Meta. Missing competitive landscape analysis and business model consideration. Product maturity stated but not justified.",
      measuringImpact:
        "Identified 3 ecosystem players with reasonable metrics. NSM is acceptable (raw count) with basic critique. Guardrails identified but could be more precisely defined with timeframes.",
      settingGoals:
        "Adequate altitude shift to team level. Goals identified with some scoring. Connection to NSM present but could be more explicitly quantified.",
      evaluatingTradeoffs:
        "Correctly identified tradeoff type. Basic pros/cons structure. Made recommendation with mission alignment. Missing specific 'what would change mind' criteria.",
    },
    strengths: [
      "Clear structure followed throughout",
      "NSM uses raw count (good practice)",
      "Goal selection has clear rationale",
      "Tradeoff tied back to company mission",
    ],
    improvements: [
      "Add competitive landscape in product rationale",
      "Include DWM timeframes for all metrics",
      "Define guardrail thresholds more precisely",
      "Add specific criteria for changing tradeoff decision",
      "Could score goals more systematically (Low/Medium/High grid)",
    ],
  },
];
