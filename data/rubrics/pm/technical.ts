import { AssessmentRubric, CalibratedExample } from "../types";

export const technicalRubric: AssessmentRubric = {
  questionType: "technical",
  passingScore: 3,
  maxScore: 5,
  dimensions: [
    {
      id: "requirementsClarity",
      name: "Requirements & Scope",
      weight: 20,
      description:
        "Evaluates ability to clarify scope, identify constraints, and make reasonable assumptions.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in requirements understanding",
          indicators: [
            "No clarifying questions asked",
            "Jumped to solution without scoping",
            "Missing critical constraints",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak requirements",
          indicators: [
            "Few clarifying questions",
            "Vague scope definition",
            "Missing key assumptions",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate requirements",
          indicators: [
            "Some clarifying questions asked",
            "Basic scope defined",
            "Key assumptions stated",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong requirements",
          indicators: [
            "Good clarifying questions",
            "Clear scope with priorities",
            "Reasonable assumptions justified",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive requirements",
          indicators: [
            "Probing clarifying questions",
            "Clear functional and non-functional requirements",
            "Scale and constraints well-defined",
            "Assumptions explicitly stated and justified",
            "Prioritized must-haves vs nice-to-haves",
          ],
        },
      ],
      commonIssues: [
        "Jumping to solution without clarification",
        "Not asking about scale requirements",
        "Missing non-functional requirements (latency, availability)",
        "Not defining success metrics",
      ],
    },
    {
      id: "architectureDesign",
      name: "Architecture & Design",
      weight: 35,
      description:
        "Evaluates system architecture, component design, data flow, and scalability considerations.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in architecture",
          indicators: [
            "No clear system architecture",
            "Missing key components",
            "Data flow unclear",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak architecture",
          indicators: [
            "Incomplete component diagram",
            "Vague data flow",
            "Missing scalability consideration",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate architecture",
          indicators: [
            "Basic components identified",
            "Data flow reasonably clear",
            "Some scalability thought",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong architecture",
          indicators: [
            "Clear component breakdown",
            "Well-defined data flow",
            "Good scalability approach",
            "API contracts considered",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive architecture",
          indicators: [
            "Clear high-level architecture with component breakdown",
            "Well-defined data flow and storage",
            "Scalability built into design",
            "API design with clear contracts",
            "Caching strategy where appropriate",
            "Failure handling considered",
          ],
        },
      ],
      commonIssues: [
        "Missing data storage design",
        "No API definition",
        "Ignoring scalability until asked",
        "Single points of failure",
        "Not considering read vs write patterns",
      ],
    },
    {
      id: "tradeoffAnalysis",
      name: "Tradeoff Analysis",
      weight: 25,
      description:
        "Evaluates ability to identify design tradeoffs, consider alternatives, and justify decisions.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major gaps in tradeoff analysis",
          indicators: [
            "No alternatives considered",
            "No tradeoffs identified",
            "Decisions not justified",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak tradeoffs",
          indicators: [
            "Limited alternatives mentioned",
            "Vague tradeoff articulation",
            "Weak justification for choices",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate tradeoffs",
          indicators: [
            "Some alternatives considered",
            "Basic tradeoffs identified",
            "Reasonable justifications given",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong tradeoffs",
          indicators: [
            "Multiple alternatives considered",
            "Clear tradeoffs articulated",
            "Decisions well-justified with context",
          ],
        },
        {
          score: 5,
          description: "Exceptional - comprehensive tradeoff analysis",
          indicators: [
            "Multiple design alternatives considered",
            "Clear pros/cons for each approach",
            "Decisions tied to requirements",
            "CAP theorem considerations where relevant",
            "Cost vs performance tradeoffs discussed",
          ],
        },
      ],
      commonIssues: [
        "Not considering alternatives",
        "Picking technology without justification",
        "Ignoring cost implications",
        "Not discussing CAP tradeoffs for distributed systems",
        "Over-engineering without acknowledging simpler options",
      ],
    },
    {
      id: "technicalCommunication",
      name: "Technical Communication",
      weight: 20,
      description:
        "Evaluates clarity of technical explanation, diagram usage, and ability to adjust depth.",
      scoringCriteria: [
        {
          score: 1,
          description: "Major communication issues",
          indicators: [
            "Unclear explanations",
            "No visual structure",
            "Cannot explain decisions",
          ],
        },
        {
          score: 2,
          description: "Below expectations - weak communication",
          indicators: [
            "Confusing technical explanations",
            "Disorganized presentation",
            "Limited ability to simplify",
          ],
        },
        {
          score: 3,
          description: "Meets expectations - adequate communication",
          indicators: [
            "Reasonably clear explanations",
            "Some structure to presentation",
            "Can explain main decisions",
          ],
        },
        {
          score: 4,
          description: "Above expectations - strong communication",
          indicators: [
            "Clear technical explanations",
            "Well-organized presentation",
            "Good use of examples",
          ],
        },
        {
          score: 5,
          description: "Exceptional - excellent communication",
          indicators: [
            "Crystal clear technical explanations",
            "Logical flow from high-level to details",
            "Effective visual descriptions",
            "Adjusts depth based on audience",
            "Summarizes key points effectively",
          ],
        },
      ],
      commonIssues: [
        "Too deep in details without overview",
        "Cannot explain at different levels",
        "Disorganized jumping between topics",
        "Not checking for understanding",
      ],
    },
  ],
};

export const technicalExamples: CalibratedExample[] = [
  {
    id: "url-shortener",
    questionTitle: "Design a URL shortening service like bit.ly",
    company: "Meta",
    transcriptSummary: `Candidate approached the problem systematically with clear requirements gathering.

REQUIREMENTS & SCOPE: Asked clarifying questions about scale (100M URLs/day), read vs write ratio (100:1), URL length requirements, and analytics needs. Stated assumptions: global service, high availability required, eventual consistency acceptable.

ARCHITECTURE & DESIGN:
- API Layer: REST API for create (POST /urls), redirect (GET /{shortCode}), analytics (GET /urls/{shortCode}/stats)
- Application Layer: Stateless servers behind load balancer
- Storage: Distributed key-value store (Redis for hot data, Cassandra for persistence)
- ID Generation: Distributed ID generator using Twitter Snowflake approach
- Encoding: Base62 encoding for short codes (62^7 = 3.5 trillion combinations)
Data flow: Write path → API → ID Generator → Encode → Store. Read path → API → Cache check → DB if miss → Redirect.

TRADEOFF ANALYSIS:
1. Counter vs Random ID: Chose random to prevent enumeration attacks, sacrifices some storage efficiency
2. SQL vs NoSQL: Chose NoSQL for horizontal scaling and simple key-value pattern
3. Cache strategy: Write-through cache for consistency, accepted higher write latency
Acknowledged could use bloom filter for existence checks at scale.

TECHNICAL COMMUNICATION: Started with high-level diagram, drilled into each component. Explained base62 encoding clearly. Checked in with interviewer before deep dives.`,
    scores: {
      requirementsClarity: 4,
      architectureDesign: 4.5,
      tradeoffAnalysis: 4,
      technicalCommunication: 4,
    },
    overallScore: 4.2,
    scoreJustifications: {
      requirementsClarity:
        "Strong clarifying questions about scale and read/write ratio. Clear assumptions stated. Could have asked more about analytics requirements.",
      architectureDesign:
        "Comprehensive design with clear data flow for read and write paths. Good choice of distributed ID generation. Could have discussed sharding strategy more.",
      tradeoffAnalysis:
        "Good consideration of SQL vs NoSQL and ID generation approaches. Tied decisions to requirements. Could have discussed more cost implications.",
      technicalCommunication:
        "Clear top-down explanation. Good use of concrete numbers. Checked in with interviewer appropriately.",
    },
    strengths: [
      "Strong requirements gathering with scale considerations",
      "Clear separation of concerns in architecture",
      "Concrete numbers and calculations (base62, combinations)",
      "Proactive security consideration (enumeration attacks)",
    ],
    improvements: [
      "Could discuss sharding and data partitioning strategy",
      "Could estimate storage and bandwidth requirements",
      "Could discuss disaster recovery approach",
    ],
  },
  {
    id: "notification-system",
    questionTitle: "Design a notification system for a social media platform",
    company: "Google",
    transcriptSummary: `Candidate scoped the problem and built a comprehensive notification architecture.

REQUIREMENTS & SCOPE: Clarified notification types (push, email, in-app), scale (1B users, 10K notifications/second), delivery requirements (real-time for push, batch for email), personalization needs. Assumed: multi-platform (iOS, Android, web), user preferences must be respected.

ARCHITECTURE & DESIGN:
- Event Ingestion: Kafka for event streaming from various services
- Processing: Worker pools for different notification types
- User Preference Service: Stores delivery preferences, quiet hours
- Delivery Services: Separate services for push (APNS/FCM), email (SendGrid), in-app
- Storage: Redis for user sessions, PostgreSQL for preferences, Cassandra for notification history
Designed fan-out on read for in-app notifications to handle celebrities with millions of followers.

TRADEOFF ANALYSIS:
1. Fan-out on write vs read: Chose hybrid - write for regular users, read for high-follower accounts
2. Push vs pull for real-time: Chose push with WebSocket connections for real-time, polling fallback
3. At-most-once vs at-least-once: Chose at-least-once delivery with client-side deduplication
Trade-off between notification freshness and system load discussed.

TECHNICAL COMMUNICATION: Drew clear system diagram. Explained fan-out problem well. Used concrete examples (celebrity with 10M followers).`,
    scores: {
      requirementsClarity: 4,
      architectureDesign: 3.5,
      tradeoffAnalysis: 3.5,
      technicalCommunication: 3.5,
    },
    overallScore: 3.6,
    scoreJustifications: {
      requirementsClarity:
        "Good clarification of notification types and scale. User preferences considered. Could have asked about SLA requirements and failure tolerance.",
      architectureDesign:
        "Solid component design with good technology choices. Fan-out strategy addressed. Could have detailed rate limiting and throttling more.",
      tradeoffAnalysis:
        "Good hybrid fan-out approach. Delivery guarantee tradeoffs discussed. Could have explored more alternatives and cost implications.",
      technicalCommunication:
        "Clear explanation with good examples. Could have been more structured in walking through the design.",
    },
    strengths: [
      "Good understanding of notification complexity",
      "Hybrid fan-out approach shows depth",
      "Considered user preferences and quiet hours",
      "Good technology choices for each component",
    ],
    improvements: [
      "More detail on rate limiting and abuse prevention",
      "Could discuss notification prioritization",
      "Could estimate infrastructure costs",
      "More structured walkthrough of data flow",
    ],
  },
];
