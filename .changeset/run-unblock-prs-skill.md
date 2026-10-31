---
'pr-merge-queue': minor
---

Add `run-unblock-prs-skill`, which runs the `unblock-prs` skill beside the worker without a Claude Code session, on the Claude API. It reads the queue with no model, and starts `claude -p` on the skill only when a pull request is the skill's and unclaimed, one pull request per session. It refuses any credential but `ANTHROPIC_API_KEY`, and caps each session with a required `--max-budget-usd`.
