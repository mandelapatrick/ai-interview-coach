import { AssessmentRubric, CalibratedExample } from "../types";

export const behavioralRubric: AssessmentRubric = {
  questionType: "behavioral",
  passingScore: 3,
  maxScore: 5,
  dimensions: [
    {
      id: "situationContext",
      name: "Situation & Context",
      weight: 20,
      description:
        "Evaluates clarity of context setting, stakes identification, and constraint articulation.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in context setting",
          indicators: [
            "No clear situation described",
            "Missing business context",
            "Stakes unclear or absent",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak context",
          indicators: [
            "Vague situation description",
            "Limited business impact articulation",
            "Unclear constraints or timeline",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate context",
          indicators: [
            "Clear situation with basic context",
            "Some business stakes identified",
            "Basic timeline and constraints mentioned",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong context",
          indicators: [
            "Detailed situation with clear business context",
            "Well-articulated stakes and urgency",
            "Clear constraints and timeline",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive context",
          indicators: [
            "Rich, detailed situation description",
            "Clear business impact and stakes",
            "Well-defined constraints and timeline",
            "Relevant background information",
            "Sets up clear 'before' state for comparison",
          ],
        },
      ],
      commonIssues: [
        "Jumping to actions without context",
        "Missing business stakes",
        "Vague timeline",
        "Not explaining why situation mattered",
      ],
    },
    {
      id: "taskOwnership",
      name: "Task & Ownership",
      weight: 25,
      description:
        "Evaluates clarity of personal responsibility, role definition, and ownership demonstration.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in task clarity",
          indicators: [
            "Unclear personal role",
            "Uses 'we' without clarifying contribution",
            "No specific responsibility identified",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak task definition",
          indicators: [
            "Vague personal responsibility",
            "Confusion between team and individual role",
            "Limited ownership demonstrated",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate task definition",
          indicators: [
            "Clear personal task identified",
            "Some distinction from team contribution",
            "Basic ownership demonstrated",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong task clarity",
          indicators: [
            "Well-defined personal responsibility",
            "Clear distinction from team role",
            "Strong ownership and accountability",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive ownership",
          indicators: [
            "Crystal clear personal responsibility",
            "Explicit distinction from team contribution",
            "Strong accountability demonstrated",
            "Leadership or initiative shown",
            "Scope of influence well-defined",
          ],
        },
      ],
      commonIssues: [
        "Using 'we' without specifying 'I'",
        "Not clarifying personal contribution",
        "Overinflating role",
        "Not explaining why they were chosen for task",
      ],
    },
    {
      id: "actionDetail",
      name: "Action & Decision-Making",
      weight: 30,
      description:
        "Evaluates specificity of actions, decision rationale, and problem-solving approach.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in action description",
          indicators: [
            "No specific actions described",
            "Missing decision rationale",
            "Generic or vague approach",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak actions",
          indicators: [
            "Limited action specificity",
            "Weak decision reasoning",
            "Missing alternatives considered",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate actions",
          indicators: [
            "Clear actions with some specificity",
            "Basic decision rationale provided",
            "Some problem-solving approach shown",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong actions",
          indicators: [
            "Detailed, specific actions",
            "Clear decision-making framework",
            "Alternatives considered and rejected",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive action detail",
          indicators: [
            "Highly specific, step-by-step actions",
            "Clear rationale for each decision",
            "Alternatives explicitly considered",
            "Adaptation when challenges arose",
            "Proactive problem-solving demonstrated",
          ],
        },
      ],
      commonIssues: [
        "Too high-level, lacking specifics",
        "Not explaining why choices were made",
        "Missing how challenges were handled",
        "No mention of alternatives considered",
      ],
    },
    {
      id: "resultImpact",
      name: "Result & Impact",
      weight: 25,
      description:
        "Evaluates outcome quantification, impact articulation, and learnings extraction.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in results",
          indicators: [
            "No outcome mentioned",
            "No quantification or impact",
            "Missing learnings",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak results",
          indicators: [
            "Vague outcome description",
            "No quantification",
            "Generic learnings without specificity",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate results",
          indicators: [
            "Clear outcome stated",
            "Some quantification or business impact",
            "Basic learnings identified",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong results",
          indicators: [
            "Specific, quantified outcome",
            "Clear business impact",
            "Meaningful learnings with application",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive results",
          indicators: [
            "Specific metrics and quantified impact",
            "Clear 'before vs after' comparison",
            "Business impact well-articulated",
            "Deep learnings with future application",
            "Recognition or broader impact mentioned",
          ],
        },
      ],
      commonIssues: [
        "Missing quantification",
        "No 'before vs after' comparison",
        "Generic learnings",
        "Not connecting to broader impact",
        "Missing what would be done differently",
      ],
    },
  ],
};

export const behavioralExamples: CalibratedExample[] = [
  {
    id: "cross-team-conflict",
    questionTitle: "Tell me about a time you had to influence without authority",
    company: "Google",
    transcriptSummary: `Candidate described a clear conflict situation between PM and Engineering teams.

SITUATION & CONTEXT: Working on Google Maps feature launch. Engineering team wanted to delay launch by 2 months for additional testing. PM team had committed to partners for Q3 launch. Stakes: $2M partner contract at risk, team credibility with leadership.

TASK & OWNERSHIP: As the TPM, my specific responsibility was to facilitate alignment between teams. I owned the launch timeline and partner communication. Team of 15 engineers and 3 PMs looked to me for resolution.

ACTION & DECISION-MAKING:
1. First, met 1:1 with eng lead to understand concerns - discovered they feared specific edge cases in offline mode
2. Proposed compromise: launch with 80% of features, defer offline edge cases to fast-follow
3. Created risk matrix showing 95% of users unaffected by deferred items
4. Facilitated joint session where I had eng present their concerns, then PM present partner commitments
5. Built coalition by getting senior eng to validate risk assessment
Chose this approach because previous attempts at top-down decisions had failed.

RESULT & IMPACT: Launched on time with 80% scope. Partner retained, $2M contract secured. Deferred features shipped 3 weeks later with zero issues. Key learning: Influence requires understanding underlying concerns, not just presenting data. Now I always start with 1:1 conversations before group negotiations.`,
    scores: {
      situationContext: 4,
      taskOwnership: 4.5,
      actionDetail: 4.5,
      resultImpact: 4,
    },
    overallScore: 4.3,
    scoreJustifications: {
      situationContext:
        "Strong context with clear stakes ($2M contract), timeline pressure, and team dynamics. Could have added more on why this conflict arose in the first place.",
      taskOwnership:
        "Excellent clarity on personal role as TPM vs team contribution. Clear scope of influence defined. Strong ownership demonstrated.",
      actionDetail:
        "Highly specific 5-step approach with clear rationale for each decision. Explained why alternatives (top-down) were rejected. Good adaptation shown.",
      resultImpact:
        "Quantified outcome ($2M retained), clear timeline (on-time + 3 weeks). Good learning stated. Could include more on broader team impact.",
    },
    strengths: [
      "Crystal clear personal ownership distinct from team",
      "Specific step-by-step actions with rationale",
      "Quantified business impact",
      "Actionable learning with future application",
    ],
    improvements: [
      "Could explain root cause of conflict more deeply",
      "Could quantify team morale or relationship improvement",
      "Could mention long-term process changes implemented",
    ],
  },
  {
    id: "product-failure",
    questionTitle: "Tell me about a time you failed and what you learned",
    company: "Amazon",
    transcriptSummary: `Candidate described a product launch failure with genuine reflection.

SITUATION & CONTEXT: Launched recommendation feature for Amazon retail that underperformed. Feature was meant to increase cross-sell by 15%. Context: Q4 launch timing was critical for holiday shopping. Team of 8 had worked 6 months on this.

TASK & OWNERSHIP: I was the PM who defined the requirements and prioritized the recommendation algorithm approach. The failure was my decision to optimize for relevance over diversity in recommendations.

ACTION & DECISION-MAKING:
1. Initially chose collaborative filtering approach based on competitor analysis
2. Prioritized relevance scores over category diversity
3. When early metrics looked weak (week 1), I doubled down on the approach instead of pivoting
4. Didn't listen to data scientist who suggested A/B testing alternative approach
Decision rationale at time: believed more data would improve results. In retrospect, this was confirmation bias.

RESULT & IMPACT: Feature achieved only 3% cross-sell lift vs 15% target. Missed $5M projected Q4 revenue. Team morale impacted. After analysis, discovered users wanted discovery, not just similar items.

Learning: Now I always define 'failure criteria' upfront and commit to pivoting when hit. Implemented 'pre-mortem' practice for new features. This approach prevented similar failure on next two launches.`,
    scores: {
      situationContext: 3.5,
      taskOwnership: 4,
      actionDetail: 3.5,
      resultImpact: 4,
    },
    overallScore: 3.7,
    scoreJustifications: {
      situationContext:
        "Clear business context and stakes. Timeline and team size mentioned. Could have explained more about why this feature was prioritized.",
      taskOwnership:
        "Strong ownership of failure - explicitly takes responsibility for the decision. Clear about what was personally vs team-driven.",
      actionDetail:
        "Good specificity on decisions made. Honest about mistake (not listening to data scientist). Could have more detail on specific actions taken post-failure.",
      resultImpact:
        "Clear quantified failure (3% vs 15%, $5M miss). Strong learning with concrete process change (pre-mortem). Evidence of applying learning to future work.",
    },
    strengths: [
      "Genuine ownership of failure without deflection",
      "Honest about decision-making mistakes",
      "Specific learning with process change implemented",
      "Evidence of applying learning (next two launches)",
    ],
    improvements: [
      "More detail on post-failure recovery actions",
      "Could quantify improvement from pre-mortem practice",
      "Could explain how team morale was addressed",
      "More specific timeline of events",
    ],
  },
];
