# Product Sense State Machine Implementation

**Status: COMPLETED**

Based on: `/specs/voice-agent-state-machine.md`

## Overview

Implement the 14-state Product Sense state machine derived from 12 Exponent mock interview transcripts. This includes state transitions, exit criteria, turn-taking rules, challenge patterns, and variety constraints.

## Implementation Summary

All components have been added to `PM_SYSTEM_PROMPT` in `/data/prompts.ts`:
- 14-state machine with exit criteria and interviewer actions
- 5 interrupt states (THINKING_PAUSE, CLARIFY_AUDIO, NUDGE, CHALLENGE, REDIRECT)
- 5 conversation patterns from real interviews
- Turn-taking rules with 60s silence protocol
- Variety constraints to avoid repetitive acknowledgments
- Failure recovery patterns for common issues

---

## Tasks

### Phase 1: Core State Machine

- [x] Add Product Sense state machine to `PM_SYSTEM_PROMPT` in `/data/prompts.ts`
  - [x] Define all 14 states with goals and exit criteria
    - INTRO (1 min)
    - MISSION (2-3 min)
    - ECOSYSTEM (2 min)
    - SEGMENTS (3 min)
    - PRIORITIZE_SEGMENT
    - PERSONA (2 min)
    - JOURNEY (3 min)
    - PROBLEMS (3 min)
    - PRIORITIZE_PROBLEM
    - SOLUTIONS (3 min)
    - PRIORITIZE_SOLUTION
    - MVP (2 min)
    - RISKS (2 min)
    - WRAP_UP (1 min)
  - [x] Add interviewer actions for each state
  - [x] Add state transition flow diagram as comment

### Phase 2: Interrupt States

- [x] Implement interrupt states that can occur from any state
  - [x] CLARIFY_AUDIO - graduated approach for unclear speech
  - [x] NUDGE - when candidate stuck >30s without asking for time
  - [x] CHALLENGE - test depth of thinking (mandatory at prioritization)
  - [x] CHECK_IN - transition acknowledgment (via THINKING_PAUSE + REDIRECT)

### Phase 3: Conversation Patterns

- [x] Add Roadmap Announcement handling
  - Acknowledge candidate's approach outline
  - Redirect if needed
- [x] Add Thinking Pause protocol
  - Grant pause immediately
  - Stay COMPLETELY SILENT up to 60s
  - Prompt only after 60s
- [x] Add Enumeration tracking
  - Track candidate's stated count
  - Prompt if count mismatch
- [x] Add Check-in patterns at transitions
- [x] Add Reframing confirmation
- [x] Add Prioritization with Rationale challenge patterns

### Phase 4: Turn-Taking Rules

- [x] Implement thinking time protocol (up to 60s silence)
- [x] Add interruption handling (STOP IMMEDIATELY if candidate speaks)
- [x] Add pacing rules (1-2 second pause between sections)

### Phase 5: Variety Constraints

- [x] Add varied acknowledgment phrases (rotate, never repeat consecutively)
  - After good point: "Solid thinking" / "That tracks" / "Interesting angle"
  - After framework: "Clear structure" / "Good breakdown"
  - After prioritization: "Strong rationale" / "Good defense"
- [x] Avoid overusing: "Great" / "That makes sense" / "Good"

### Phase 6: Failure Recovery Patterns

- [x] Add recovery for lost enumeration
- [x] Add recovery for jumbled brainstorm (ask to bucket)
- [x] Add nudges for stuck candidates
- [x] Add recovery for missing structure
- [x] Add gentle interruption for rambling
- [x] Add recovery for skipped check-ins

### Phase 7: Transition Phrases

- [x] Add state-specific transition phrases
  - After MISSION: "Good foundation. Now, who are all the players in this space?"
  - After SEGMENTS: "Three solid segments. Which would you focus on and why?"
  - After PROBLEMS: "That's a clear problem. What solutions come to mind?"
  - After MVP: "Good scope. What risks concern you most?"
- [x] Add check-in phrases for every transition
- [x] Add challenge patterns for PRIORITIZE states

---

## Success Criteria

- [x] Agent announces state transitions (via transition phrases)
- [x] Uses check-ins at every transition (conversation patterns)
- [x] Redirects when candidate jumps ahead (REDIRECT interrupt state)
- [x] Grants thinking pauses silently (up to 60s) (THINKING_PAUSE)
- [x] Varied acknowledgments (no consecutive repeats) (variety constraints)
- [x] Natural pacing between sections (turn-taking rules)
- [x] Challenges at EVERY prioritization state (CHALLENGE interrupt)
- [x] Accepts good defenses, probes weak ones (challenge patterns)
- [x] Recovers lost enumeration (failure recovery)
- [x] Interrupts rambling gently (failure recovery)
- [x] Prompts structure when brainstorm is jumbled (failure recovery)

---

## Files to Modify

| File | Changes |
|------|---------|
| `/data/prompts.ts` | Add state machine to PM_SYSTEM_PROMPT, add turn-taking rules, add challenge patterns, expand variety constraints |
