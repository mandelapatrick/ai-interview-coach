# Voice Agent State Machines (Multi-Type)

> **Derived from:** 12 Exponent mock interview transcripts + 8 Analytical Thinking PDFs + OpenAI Realtime Prompting Guide

## Overview

State machines for ALL interview types:

| Interview Type | Resources Available | States |
|----------------|---------------------|--------|
| **Product Sense** | 12 transcripts, 5 PDFs, rubric | 14 states |
| **Analytical Thinking** | 8 PDFs | 7 states |
| **Consulting Cases** | Existing 5-phase prompt | 5 states |
| **Behavioral/Technical/Strategy/Estimation** | No docs | 4 states (Generic PM) |

The system prompt in `/data/prompts.ts` is the primary lever.

## Pain Points to Address

1. **Robotic/repetitive responses** - Agent sounds scripted, uses same phrases
2. **Poor turn-taking** - Interruptions, awkward pauses, timing issues
3. **Losing conversation thread** - Agent forgets context, goes off-track
4. **Unclear audio handling** - Struggles with unclear speech or noise

---

## State Machines by Interview Type

### 1. PRODUCT SENSE (14 states - from 12 transcripts)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT SENSE STATE MACHINE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │  INTRO   │────▶│ MISSION  │────▶│ECOSYSTEM │                │
│  │ (1 min)  │     │ (2-3min) │     │ (2 min)  │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│                                          │                       │
│                                          ▼                       │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │ PERSONA  │◀────│PRIORITIZE│◀────│ SEGMENTS │                │
│  │ (2 min)  │     │ SEGMENT  │     │ (3 min)  │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │ JOURNEY  │────▶│ PROBLEMS │────▶│PRIORITIZE│                │
│  │ (3 min)  │     │ (3 min)  │     │ PROBLEM  │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│                                          │                       │
│                                          ▼                       │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │   MVP    │◀────│PRIORITIZE│◀────│SOLUTIONS │                │
│  │ (2 min)  │     │ SOLUTION │     │ (3 min)  │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐     ┌──────────┐                                  │
│  │  RISKS   │────▶│ WRAP_UP  │                                  │
│  │ (2 min)  │     │ (1 min)  │                                  │
│  └──────────┘     └──────────┘                                  │
│                                                                  │
│  INTERRUPT STATES (can occur from any state):                   │
│  • CLARIFY_AUDIO - When speech unclear                          │
│  • NUDGE - When candidate stuck >30s                            │
│  • CHALLENGE - Test depth of thinking                           │
│  • CHECK_IN - Transition acknowledgment                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### State Definitions & Exit Criteria

| State | Goal | Exit Criteria | Interviewer Actions |
|-------|------|---------------|---------------------|
| **INTRO** | Present question, set context | Candidate acknowledges or asks clarifying Q | Read prompt clearly, allow restatement |
| **MISSION** | Product motivation, company tie | Mission statement delivered | Probe: "Why does this matter to [Company]?" |
| **ECOSYSTEM** | Identify all players | 4-6 ecosystem players listed | Ask: "Who else is in this space?" |
| **SEGMENTS** | Create user segments | 3 distinct segments named | Prompt: "How would you segment users?" |
| **PRIORITIZE_SEGMENT** | Choose focus segment | Segment chosen with 2-dimension rationale | Challenge: "Why not [other segment]?" |
| **PERSONA** | Develop specific persona | Persona with name, age, context | Ask for specifics if vague |
| **JOURNEY** | Map user experience | 5-7 journey steps mapped | Help structure if needed |
| **PROBLEMS** | Identify pain points | 3 distinct problems from journey | Probe: "What's most painful here?" |
| **PRIORITIZE_PROBLEM** | Choose focus problem | Problem chosen with freq/severity | **CHALLENGE**: Push back on choice |
| **SOLUTIONS** | Brainstorm approaches | 3 distinct solutions proposed | Encourage creativity |
| **PRIORITIZE_SOLUTION** | Choose solution | Solution chosen with impact/effort | Ask about tradeoffs |
| **MVP** | Define scope | MVP features and constraints clear | Probe feasibility |
| **RISKS** | Identify & mitigate | 2-3 risks with mitigations | Ask: "What could go wrong?" |
| **WRAP_UP** | Close interview | Summary delivered | Thank candidate, end |

---

### 2. ANALYTICAL THINKING (7 states - from 8 PDFs)

```
┌─────────────────────────────────────────────────────────────────┐
│              ANALYTICAL THINKING STATE MACHINE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │ASSUMPTIONS│────▶│ ROADMAP  │────▶│ PRODUCT  │                │
│  │ (2 min)  │     │ (1 min)  │     │RATIONALE │                │
│  └──────────┘     └──────────┘     │ (3 min)  │                │
│                                    └──────────┘                │
│                                          │                       │
│                                          ▼                       │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │TEAM GOALS│◀────│NORTH STAR│◀────│ECOSYSTEM │                │
│  │ (5 min)  │     │& GUARDRAIL│    │ METRICS  │                │
│  └──────────┘     │ (3 min)  │     │ (5 min)  │                │
│       │           └──────────┘     └──────────┘                │
│       ▼                                                          │
│  ┌──────────┐     ┌──────────┐                                  │
│  │TRADEOFFS │────▶│ WRAP_UP  │                                  │
│  │ (5 min)  │     │ (2 min)  │                                  │
│  └──────────┘     └──────────┘                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### State Definitions & Exit Criteria

| State | Goal | Exit Criteria | Interviewer Actions |
|-------|------|---------------|---------------------|
| **ASSUMPTIONS** | State context | 3 assumptions with rationale (role, geography, platforms) | Probe: "What's your role assumption?" |
| **ROADMAP** | Announce plan | Candidate outlines approach | Acknowledge: "Sounds good, let's proceed" |
| **PRODUCT_RATIONALE** | Why product exists | Mission statement (<15 words), why company cares | Probe: "Why does [Company] care about this?" |
| **ECOSYSTEM_METRICS** | Who are players | 3 ecosystem players + value props + health metrics (DWM) | Ask: "How would you measure health for each?" |
| **NORTH_STAR** | Define NSM | NSM with 2 strengths, 2 drawbacks + 2 guardrails | Challenge: "What's the downside of that metric?" |
| **TEAM_GOALS** | Altitude shift | 3 goals scored on impact/feasibility, 1 selected | Probe: "Why that goal over the others?" |
| **TRADEOFFS** | Decision making | Pros/cons framework, decisive recommendation | Push: "Make a call—which direction?" |

#### Key Milestone Check-ins (from AT Framework)

- **After ASSUMPTIONS:** "Those assumptions make sense. Let's proceed."
- **After PRODUCT_RATIONALE:** "Good connection to company mission."
- **After ECOSYSTEM_METRICS:** "Clear ecosystem view. Now let's define success."
- **After NORTH_STAR:** "Solid NSM choice. What goals support this?"
- **After TEAM_GOALS:** "Good prioritization. Let's talk tradeoffs."

---

### 3. CONSULTING CASE (5 states - from existing prompt)

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONSULTING CASE STATE MACHINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │  INTRO   │────▶│CLARIFY & │────▶│QUANTITAT │                │
│  │& PROMPT  │     │FRAMEWORK │     │IVE MATH  │                │
│  │ (2 min)  │     │ (5 min)  │     │ (10 min) │                │
│  └──────────┘     └──────────┘     └──────────┘                │
│                                          │                       │
│                                          ▼                       │
│                   ┌──────────┐     ┌──────────┐                │
│                   │SYNTHESIS │◀────│QUALITAT  │                │
│                   │& RECOM   │     │IVE BRAIN │                │
│                   │ (3 min)  │     │ (5 min)  │                │
│                   └──────────┘     └──────────┘                │
│                                                                  │
│  FORMAT VARIANTS:                                               │
│  • Interviewer-Led (McKinsey): YOU drive transitions            │
│  • Candidate-Led (BCG/Bain): Candidate asks for data            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### State Definitions & Exit Criteria

| State | Goal | Exit Criteria | Interviewer Actions |
|-------|------|---------------|---------------------|
| **INTRO** | Present case | Candidate restates or clarifies | Read prompt clearly, confirm understanding |
| **CLARIFY_FRAMEWORK** | Structure problem | Framework with buckets presented | Probe: "What metric would you look at in that bucket?" |
| **QUANTITATIVE** | Math analysis | Key calculation completed | Track logic, correct errors gently |
| **QUALITATIVE** | Brainstorm | 3+ ideas categorized | Ask: "Can you bucket those ideas?" |
| **SYNTHESIS** | Final rec | Yes/No + 3 arguments + risks | Signal: "The CEO is walking in. What's your rec?" |

#### Format-Specific Behaviors

**Interviewer-Led (McKinsey):**
- YOU drive transitions: "Let's look at this chart"
- Demand specific stances: "You have to pick one"
- Explicitly move between phases

**Candidate-Led (BCG/Bain):**
- Wait for candidate to ask for data
- Pause to see if they drive forward
- Follow their structure (Revenue first? Costs first?)

---

### 4. GENERIC PM (4 states - fallback for Behavioral/Technical/Strategy/Estimation)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GENERIC PM STATE MACHINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                │
│  │  INTRO   │────▶│FRAMEWORK │────▶│DEEP DIVE │                │
│  │& CONTEXT │     │& APPROACH│     │(type-    │                │
│  │ (2 min)  │     │ (5 min)  │     │specific) │                │
│  └──────────┘     └──────────┘     │(10-15min)│                │
│                                    └──────────┘                │
│                                          │                       │
│                                          ▼                       │
│                                    ┌──────────┐                │
│                                    │SYNTHESIS │                │
│                                    │ (3 min)  │                │
│                                    └──────────┘                │
│                                                                  │
│  DEEP DIVE VARIANTS BY TYPE:                                    │
│  • Behavioral: STAR stories, impact, learnings                  │
│  • Technical: System design, constraints, tradeoffs             │
│  • Strategy: Market dynamics, competition, GTM                  │
│  • Estimation: Decomposition, assumptions, sanity checks        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### State Definitions by Question Type

| State | Behavioral | Technical | Strategy | Estimation |
|-------|------------|-----------|----------|------------|
| **INTRO** | Set context, ask for situation | State problem | Set market context | Present estimation Q |
| **FRAMEWORK** | Confirm STAR approach | Discuss constraints | Outline market forces | Agree on decomposition |
| **DEEP_DIVE** | Probe actions, impact | Design walkthrough | Competitive analysis | Work through math |
| **SYNTHESIS** | Learnings, what differently | Tradeoffs, scaling | Recommendation | Sanity check result |

---

## Transcript-Derived Conversation Patterns

**From 12 Exponent mock interviews, these patterns consistently appear:**

### 1. ROADMAP ANNOUNCEMENT (at interview start)

Candidate lays out full approach upfront:
> "First I'll talk about mission, then segmentation, prioritize one, brainstorm pain points, prioritize one, then solutions, and finally MVP. Does that sound good?"

**Interviewer should:**
- Acknowledge the roadmap: "Sounds great. Thanks for mapping it out."
- Redirect if needed: "Let's skip X and focus more on Y"

### 2. THINKING PAUSES (before each major section)

Candidate requests pause:
> "Let me take a minute to jot down my thoughts"
> "Would it be okay if I take a couple minutes?"

**Interviewer should:**
- Grant pause: "Please do" / "Take your time"
- Stay COMPLETELY SILENT during pause
- Only prompt if >60 seconds: "Take your time. Let me know when ready."

### 3. ENUMERATION (before presenting items)

Candidate announces count:
> "I've thought of three segments" / "Four pain points came to mind"

**Interviewer should:**
- Track the count mentally
- If candidate loses count, gently prompt: "You mentioned three, I heard two so far..."

### 4. CHECK-INS (at every transition)

Candidate asks permission to proceed:
> "Does that sound good?" / "Are you okay with that direction?"
> "Before I move on, any questions?"

**Interviewer should:**
- Confirm: "Sounds good, let's continue"
- Or redirect: "Actually, tell me more about X first"
- Or challenge: "Before we move on, why didn't you pick Y?"

### 5. REFRAMING (to track state)

Candidate restates where they are:
> "So to reframe where we're at: our goal is to design X for Y users"

**Interviewer should:**
- Confirm understanding or correct misalignment

### 6. PRIORITIZATION WITH RATIONALE (at selection points)

Candidate explains why they chose:
> "I'm picking segment A because [2 reasons]. Segment B was close but [tradeoff]."

**Interviewer should CHALLENGE:**
> "Interesting. But why not B? Couldn't you argue that..."
> After response: "Good defense. Let's continue."

---

## Transition Phrases (vary these)

**State Transitions:**
- After MISSION: "Good foundation. Now, who are all the players in this space?"
- After SEGMENTS: "Three solid segments. Which would you focus on and why?"
- After PROBLEMS: "That's a clear problem. What solutions come to mind?"
- After MVP: "Good scope. What risks concern you most?"

**Check-ins (use at every transition):**
- "Before we move on, does that approach make sense to you?"
- "I want to make sure we're aligned—ready to dive into [next phase]?"
- "Good progress. Let's shift to thinking about [next topic]."
- "Any questions before I continue?"

**Challenge Patterns (use at PRIORITIZE states):**
- "Interesting choice. But couldn't you argue [alternative] is more important?"
- "Push back: What if [counterpoint]?"
- "Why not [other option]? It seemed promising too."
- After good response: "Good defense. Let's continue."

---

## Interrupt States (Apply to ALL Interview Types)

**THINKING_PAUSE** (candidate requests time):
- Grant immediately: "Please do" / "Take your time"
- Remain SILENT for up to 60 seconds
- After 60s: "Take your time. Let me know when you're ready."

**CLARIFY_AUDIO** (graduated - from OpenAI guide):
1. "I didn't catch that clearly. Could you repeat?"
2. "Still having trouble. Could you say that more slowly?"
3. "Let me summarize what I understood: [X]. Is that right?"

**NUDGE** (when candidate stuck >30s without asking for time):
- "Take your time. Would it help to think about [hint]?"
- "One way to approach this is to consider [framework]."
- "What's the first thing that comes to mind?"

**CHALLENGE** (test depth - mandatory at prioritization):
- Candidate must defend their choice
- Accept reasonable defense: "Good thinking. Let's proceed."
- If weak defense: "Let's dig deeper. What data supports that?"

**REDIRECT** (when conversation drifts):
- "That's interesting for later. Right now, let's finish [current state]."
- "Good thought—let's capture that when we get to solutions."
- "Let me pull you back to [current focus]."

---

## Failure Modes (from transcript analysis)

**These patterns caused weak interview moments:**

| Failure Mode | Example | Interviewer Should |
|--------------|---------|-------------------|
| **Lost enumeration** | "Added a segment at the end without summary" | Prompt: "You mentioned 3 segments, can you recap all 4?" |
| **Jumbled brainstorm** | "Features felt jumbled, no structure" | Ask: "Before solutions, can you bucket them somehow?" |
| **Mind stuck** | "Couldn't think beyond single risk" | Nudge: "What about [different category of risk]?" |
| **Missing buckets** | "Metrics without goal labels" | Ask: "Is that an engagement or retention metric?" |
| **Rambling** | "Long explanation without pause" | Interrupt gently: "Quick pause—so the key point is...?" |
| **Skipped check-in** | "Moved to solutions without alignment" | Stop: "Before we go there, let me make sure I followed..." |

**Interviewer recovery phrases:**
- After rambling: "Let me make sure I caught that. Your main point was..."
- After lost structure: "Can you give me the 1-2-3 of what we just covered?"
- After weak prioritization: "Walk me through the tradeoffs again."

---

## Turn-Taking Rules (Apply to ALL Types)

**Thinking Time Protocol:**
- When candidate requests time: "Please do" / "Take your time"
- Remain COMPLETELY SILENT for up to 60 seconds
- If >60s: "Take your time. Let me know when you're ready."
- NEVER fill silence prematurely with suggestions

**Interruption Handling:**
- If candidate starts speaking while you talk, STOP IMMEDIATELY
- After they finish: "Got it. You were saying..."
- Never complete your interrupted sentence

**Pacing:**
- 1-2 second pause between major sections
- Announce transitions: "Good, let's move to [next phase]"
- Check in at every state change: "Before we continue..."

---

## Variety Constraints (Apply to ALL Types)

**NEVER repeat the same acknowledgment consecutively. Rotate between:**

| Context | Options |
|---------|---------|
| After good point | "Solid thinking" / "That tracks" / "Interesting angle" / "I see where you're going" |
| After framework | "Clear structure" / "Good breakdown" / "That covers the key areas" |
| After prioritization | "Strong rationale" / "Makes sense given [X]" / "Good defense" |
| General | "Understood" / "Walk me through that" / "Tell me more" |

**DO NOT overuse:** "Great" / "That makes sense" / "Good"

---

## Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `/data/prompts.ts` | Add state machines to PM_SYSTEM_PROMPT and SYSTEM_PROMPT |

### PM_SYSTEM_PROMPT Changes

1. Replace Conversation Flow section with State Machine (Product Sense by default)
2. Add Turn-Taking Rules section
3. Add Challenge Patterns section
4. Expand Personality & Tone with variety constraints

### SYSTEM_PROMPT (Consulting) Changes

1. Add explicit state machine with exit criteria
2. Add format-specific behaviors for Interviewer-Led vs Candidate-Led
3. Add variety constraints

### Question-Type Specific Prompts

For Analytical Thinking and other PM types, consider adding to `/data/prompts_json/pmQuestionTypePrompts.json` with type-specific state machines.

---

## Success Criteria

**State Tracking:**
- [ ] Agent announces state transitions
- [ ] Uses check-ins at every transition
- [ ] Redirects when candidate jumps ahead

**Turn Dynamics:**
- [ ] Grants thinking pauses silently (up to 60s)
- [ ] Varied acknowledgments (no consecutive repeats)
- [ ] Natural pacing between sections

**Interview Realism:**
- [ ] Challenges at EVERY prioritization state
- [ ] Accepts good defenses, probes weak ones
- [ ] Uses "Rule of 3s" and "Rule of 2s" consistently

**Failure Recovery:**
- [ ] Recovers lost enumeration ("You said 3, I heard 2...")
- [ ] Interrupts rambling gently
- [ ] Prompts structure when brainstorm is jumbled
