# pr-merge-queue

## 0.4.0

### Minor Changes

- 4967c5a: Add `pr-description`, which reads and writes a pull request or issue description written in two languages: `read` leaves the translation out, and `push` (after `pull`), `create` and `check` refuse halves that do not mirror each other — headings, `#N` references, what may appear once — or an edit to one half alone. The heading the translation follows is `translation.heading` in `.github/unblock-prs.json`; with it set, `open-pr --body-file` checks the body the same way before pushing.
- 00bc22a: Add `run-issue-resolver`, which starts the open issues nobody has started without a Claude Code session, on the Claude API: one `claude -p` session per issue, which decides whether the issue can be finished unattended and opens its pull request with `open-pr`. Up to `--concurrency` sessions (3 by default) run at once, each on an issue of its own and in a worktree the command makes for it from the latest `origin/main`. The command labels the issue with `start-issue` before the session and takes the label off again when the session ends with no pull request that closes it; such an issue is not handed to another session until someone changes it, across runs. It picks the issue with no model, from how `pr-report` says each open issue stands for being started, and only among the ones the token's account (or `--author`) wrote. It refuses any credential but `ANTHROPIC_API_KEY` and exits after `--max-sessions` sessions (10 by default). A required `--max-total-usd` is what the run may spend in all, and what each session may spend follows from it: until a session resolves its issue, sessions run one at a time, each capped at a quarter of the total; after, each is capped at three times what a resolved issue has cost on average, and a session starts only while what is left holds its cap besides those of the sessions running.

    `pr-report --issues-limit` now reads past the first page of open issues when the limit asks for more.

### Patch Changes

- 8c19164: `report-unowned-prs` now reads every page of the open issues and pull requests the token's account wrote before deciding whether a pull request nobody owns has been reported. It read only the newest 100, so once the account had more open, a report older than that was not seen and the same issue was filed again on every run. The new `restAllPages` helper reads a list endpoint page by page until a short page.
- 838f598: `run-issue-resolver`: a session that finds every part of its issue already on `main`, done by a pull request that never named the issue, now closes it as completed after a comment saying which pull request or commit did each part. It used to leave only the comment, and the issue stayed open with nothing left to hand on.
- Updated dependencies [e9420e9]
- Updated dependencies [2731308]
- Updated dependencies [aa74c78]
- Updated dependencies [a48864f]
- Updated dependencies [c4ce547]
- Updated dependencies [8859dc2]
- Updated dependencies [1f78470]
- Updated dependencies [d567a6a]
- Updated dependencies [27bc91d]
    - ts-data-forge@14.11.0
    - ts-repo-utils@10.7.2
    - pr-report-core@0.2.1
    - ts-fortress@12.4.3

## 0.3.0

### Minor Changes

- 2cd2d59: `unblock-prs` now ranks a queued pull request that only a ruleset bypass can merge with `priority:low` unless it is labelled `priority:high` (alone), both when picking and when two pull requests are released at once. Picked early, it went green only to be set aside `awaiting-bypass`, and the candidates behind it waited for nothing. `pr-report-core` adds `pickPriorityRank`, and `orderCandidates` takes a required `bypass` predicate; the Pull Requests Manager draws the queue in the same order.

### Patch Changes

- Updated dependencies [2cd2d59]
    - pr-report-core@0.2.0

## 0.2.0

### Minor Changes

- 9781418: Add `run-unblock-prs-skill`, which runs the `unblock-prs` skill beside the worker without a Claude Code session, on the Claude API. It reads the queue with no model, and starts `claude -p` on the skill only when a pull request is the skill's and unclaimed, one pull request per session. It refuses any credential but `ANTHROPIC_API_KEY`, and caps each session with a required `--max-budget-usd`.

## 0.1.0

### Minor Changes

- 6365077: Mark issues as started or planned. `pr-report-core` adds the `in-progress` and `planned` labels (`IN_PROGRESS_LABEL`, `PLANNED_LABEL`) and `progressOf`: a startable issue labelled `in-progress` now reads as `in-progress`, as one an open pull request closes does, and one labelled `planned` as the new `planned` start state. `withProgress` takes that `IssueProgress` instead of a boolean. `pr-merge-queue` adds `start-issue`, which labels an issue `in-progress` before work on it begins and refuses one already labelled so or closed by an open pull request, unless given `--force`.

### Patch Changes

- Updated dependencies [6365077]
    - pr-report-core@0.1.0

## 0.0.4

### Patch Changes

- d4c53a2: Read the branches a repository generates, such as a dependency update, from `generatedBranches` in `.github/unblock-prs.json` instead of a fixed `chore/pnpm-update`: `push-fixed-pr` refuses a hand-resolved conflict on one and names its `rebuild`. `pr-report-core` no longer exports `PNPM_UPDATE_BRANCH`. `pr-report` reads the checkout's `repo-settings/rulesets/main.json` only when it reports on the checkout's own repository.
- Updated dependencies [d4c53a2]
    - pr-report-core@0.0.6

## 0.0.3

### Patch Changes

- 80f016b: Identify requests to GitHub as `pr-merge-queue` rather than by the repository it was written in, and describe the commands' conventions as the queue's own rather than as one repository's.

## 0.0.2

### Patch Changes

- a273c0b: fix(unblock-prs): close the selection the checks query left open, which GitHub now rejects, and release nothing else while a released pull request's checks cannot be read

## 0.0.1

### Patch Changes

- 1a26cfe: Publish through npm trusted publishing for the first time. Nothing in the package changes.
- Updated dependencies [c5f2503]
    - ts-fortress@12.4.1
