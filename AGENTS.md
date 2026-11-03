# Repository instructions

At the start of every session, read [CLAUDE.md](./CLAUDE.md) in full and follow
its instructions for all work in this repository.

## Codex adaptations

The workflow requirements in `CLAUDE.md` apply to Codex too. A Claude Code
command or integration being unavailable does not waive the underlying work.

- **Review loop:** `/code-review high` and `/code-review medium` mean a review
  at the corresponding level using the review mechanism available in
  Codex. If no review mechanism is available, perform a separate self-review and
  disclose that limitation in the pull request's `## Review` section; do not
  claim to have run `/code-review` or an independent review. That section opens
  with the level and the total of rounds actually run, as ``Review at `high`, 2
rounds.`` for Codex's own review mechanism or ``Self-review at `high`, 1
round.`` for a self-review. Follow [the review
  procedure](./docs/code-review-loop.md), including its diff scope, finding
  ledger, checks after fixes, and timing before opening a pull request or
  pushing an amend. Its stopping conditions still apply: no findings,
  wording-only findings, only previously dismissed findings, or the third round.
  This is not an unlimited loop until every finding is gone.
- **Claude Code hooks and permissions:** `.claude/settings.json` does not
  configure Codex. Do not assume its post-edit formatter and lint hook ran;
  run the repository's prescribed checks and fix their findings explicitly.
  Use Codex's actual tools and permissions rather than Claude tool names.
- **Claude-specific session details:** `Claude-Session:` and the Claude
  Code proxy restriction apply only to Claude Code sessions. Do not invent
  a Claude session link for Codex or assume that Codex has that proxy.
  The repository's GitHub API requirement and prohibition on proxy-specific
  routes still apply.
