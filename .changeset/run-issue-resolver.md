---
'pr-merge-queue': minor
---

Add `run-issue-resolver`, which starts the open issues nobody has started without a Claude Code session, on the Claude API: one `claude -p` session per issue, which decides whether the issue can be finished unattended and opens its pull request with `open-pr`. Up to `--concurrency` sessions (3 by default) run at once, each on an issue of its own and in a worktree the command makes for it from the latest `origin/main`. The command labels the issue with `start-issue` before the session and takes the label off again when the session ends with no pull request that closes it; such an issue is not handed to another session until someone changes it, across runs. It picks the issue with no model, from how `pr-report` says each open issue stands for being started, and only among the ones the token's account (or `--author`) wrote. It refuses any credential but `ANTHROPIC_API_KEY`, caps each session with a required `--max-budget-usd`, and exits after `--max-sessions` sessions (10 by default).

`pr-report --issues-limit` now reads past the first page of open issues when the limit asks for more.
