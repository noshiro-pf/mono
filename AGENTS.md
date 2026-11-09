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
  with the level and the total of rounds, counted as [the review
  procedure](./docs/code-review-loop.md) says, in one of these forms:

    ```md
    Review at `high`, 2 rounds.
    Self-review at `high`, 1 round.
    ```

    The first is for Codex's own review mechanism, the second for a self-review.
    Follow that procedure, including its diff scope, finding ledger, checks
    after fixes, and timing before opening a pull request or pushing an amend.
    Its rules for when the loop ends and when it is put to the user apply as
    written: a dismissed, deferred or wording finding does not hold it open,
    save that a comment written to record a dismissal is a fix the next round
    reads, and ending it is never a reason to defer a finding in scope.

- **Claude Code hooks and permissions:** `.claude/settings.json` does not
  configure Codex. Do not assume its post-edit formatter and lint hook ran;
  run the repository's prescribed checks and fix their findings explicitly.
  Use Codex's actual tools and permissions rather than Claude tool names.
- **Claude-specific session details:** `Claude-Session:` and the Claude
  Code proxy restriction apply only to Claude Code sessions. Do not invent
  a Claude session link for Codex or assume that Codex has that proxy.
  The repository's GitHub API requirement and prohibition on proxy-specific
  routes still apply.
