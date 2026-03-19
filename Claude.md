# Project Guidelines

## Commits

- When committing, only stage and commit files related to changes made in the current conversation context. Do not include unrelated modified or untracked files.

## Deployment

- Always redeploy the LiveKit agent after making changes to `livekit-agent/agent.py`:
  ```
  cd livekit-agent && lk agent deploy
  ```
