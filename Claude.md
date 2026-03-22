# Project Guidelines

## Commits

- When committing, only stage and commit files related to changes made in the current conversation context. Do not include unrelated modified or untracked files.

## Deployment

- Always redeploy the LiveKit agent after making changes to `livekit-agent/agent.py`:
  ```
  cd livekit-agent && lk agent deploy
  ```

## Figma MCP Server Rules

### General
- Prioritize Figma fidelity to match designs exactly
- Avoid hardcoded values, use design tokens from Figma where available
- Follow WCAG requirements for accessibility
- Add component documentation

### Required flow (do not skip)
- Run `get_design_context` first to fetch the structured representation for the exact node(s)
- Run `get_screenshot` for a visual reference of the node variant being implemented
- Validate against Figma for visual and behavioral accuracy before completion

### Implementation
- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style.
- Replace Tailwind utility classes with the project's preferred utilities/design‑system tokens when applicable.
- Reuse existing components (e.g., buttons, inputs, typography, icon wrappers) instead of duplicating functionality.
- Use the project's color system, typography scale, and spacing tokens consistently.
- Respect existing routing, state management, and data‑fetch patterns already adopted in the repo.
- Strive for 1:1 visual parity with the Figma design. When conflicts arise, prefer design‑system tokens and adjust spacing or sizes minimally to match visuals.
- Validate the final UI against the Figma screenshot for both look and behavior.

### Assets
- The Figma MCP server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or an SVG, use that image or SVG source directly
- IMPORTANT: DO NOT import/add new icon packages, all the assets should be in the Figma payload
- IMPORTANT: Do NOT use or create placeholders if a localhost source is provided
