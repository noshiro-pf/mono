# pr-merge-queue

## 0.7.0

### Minor Changes

- 63bc3ec: The `resolve-issues` skill stacks every pull request of a run serially, in the order it takes the issues, even where their paths are disjoint and nothing orders them, and no longer defers to the repository's own instructions on how several pull requests relate, so the whole stack can be queued as it stands and its layers merge without conflicting with each other.

### Patch Changes

- 12754c6: `unblock-prs` says what holds a pull request that went green and did not merge from its review as read at the watched head — the code owner it waits for, or the unresolved conversations — instead of GitHub's `reviewDecision`, which is `null` under a ruleset, so the set-aside status stops guessing when the review names the hold.

    `queueOwner` no longer says the worker cannot read what holds a `not-merging` pull request, since the set-aside now names it when the review does.

- Updated dependencies [39ac703]
- Updated dependencies [12754c6]
    - ts-data-forge@14.12.0
    - pr-report-core@0.4.1
    - ts-fortress@12.4.5

## 0.6.0

### Minor Changes

- 2101cd3: Add `rework-pr`, which takes the current branch's pull request out of the queue while more work goes into it (`start`: `skip-ci` on, `merge-queued` off, auto-merge disarmed, a draft) and gives it back for review once that work is pushed (`done`: push with `--force-with-lease`, mark it ready).

### Patch Changes

- f0f8dc0: `open-pr --merge-before N` refuses a cycle against the `Merge-After:` of the pull request's body as the run leaves it, not only against what the run declares: the body of a pull request open already, and the order carried from the `Start-After:` of the issues it closes, are now checked before `N`'s body is written. Such a run stops with nothing written into `N`, after `skip-ci` and `auto-rebase` are on.
- 54652b6: `pr-report` fails, naming each pull request and what failed, when the check runs or the commit statuses of a pull request cannot be read, as it does when the rate limit is spent. It used to read such a failure as nothing reported, so every required context of that pull request came out `missing` and its verdict `pending`, as if CI had not started.
- eee1ea8: `unblock-prs` now waits 60 seconds by default, instead of 30, between polls of the pull request it watches (`--poll-interval`) and between surveys while the list is changing (`--active-interval`), and slows to `--idle-interval` after 5 unchanged surveys instead of 10, so that still happens after about five minutes. This halves what the queue spends of the account's GraphQL budget, at the cost of noticing a merge about 15 seconds later on average. A watched pull request that is green and not merging is given up on after 2 polls (5 while GitHub reads `BLOCKED`) instead of 3 (8), which keeps those waits at least as long as they were. A released pull request whose reads keep failing now holds the queue for about five minutes, instead of two and a half, before it is set aside as `read-failed`.
- c9d5ffa: `unblock-prs` ends its cycle after a release failure GitHub may have caused — a refused push, a failed fetch, auto-merge that could not be armed, a label that could not be removed — instead of trying the next candidate. In an outage every candidate failed the same way, so the whole queue was set aside within one cycle, and nothing cleared the reasons once GitHub recovered. A failure that is the pull request's own (a real conflict, a stacked branch whose commits cannot be told, nothing left to merge) still moves on to the next candidate.
- 670c1d3: `unblock-prs` ranks the runs of one job in one workflow and event by check suite, then by check run id, as `pr-report` does, rather than by when they started, and waits on a red required check while its own workflow run, with a job in it re-run after the red, has not finished. A queued re-run of a failed job, or the new round's queued aggregate, is waited on instead of losing to the red it replaces, and a pending commit status no longer counts as the start of a round. `pr-report-core` exports `outranks`, the ranking `statesFromCheckRuns` uses, and its `CheckRunRank` type.
- 41c97fd: `unblock-prs` re-fires the check workflows once before it sets a released pull request aside as `checks-not-started`: after five minutes with a required context unreported and nothing running on the head, it puts `skip-ci` back on and takes it off, which every check workflow triggers on, and waits five minutes more. The set-aside clears only when `main` moves, so when that pull request was the only one the worker could release, the queue used to stay stalled until a person moved it.
- Updated dependencies [22cef42]
- Updated dependencies [36ffebb]
- Updated dependencies [23bfcbe]
- Updated dependencies [670c1d3]
    - ts-repo-utils@10.7.4
    - ts-data-forge@14.11.1
    - ts-type-forge@9.2.3
    - pr-report-core@0.4.0

## 0.5.0

### Minor Changes

- dd6abb2: `pr-report-core` adds `readBranchRequirements`, which reads what GitHub requires of a branch — every ruleset that applies to it and the contexts a classic branch protection rule requires — through a transport the reader hands over. `unblock-prs`, and `pr-report` wherever it reads GitHub's rules rather than the checkout's `repo-settings/rulesets/main.json`, now read the required contexts through it, so a context required only by a classic branch protection rule is waited for rather than missed, and they ask for a hundred rules rather than GitHub's default page of thirty.
- f020219: `pr-report` says of an issue labelled `pending` that `pending` is for pull requests and an issue is held with `priority:hold`.
- 5185cec: Place every issue in one priority tier. `pr-report-core` reads the `priority:S`, `priority:A`, `priority:B`, `priority:C`, `priority:D`, `priority:hold` and `priority:close` issue labels (`issuePriorityOfLabels`, `issueStartRank`). `pr-description create` needs `--priority <tier>` and refuses while an open issue has a close title, unless each is named with `--not-duplicate`; the new `pr-description similar` lists the open issues a new one may repeat. `run-issue-resolver` takes issues by tier and leaves `priority:hold` and `priority:close`, `pr-report` names an issue with no tier or several, and `report-unowned-prs` files its issues under `priority:A`.
- e73d0ad: `pr-description` and `open-pr --body-file` also refuse a description with a trailer (a `Start-After:` or `Claude-Session:` line, or a closing keyword) inside either half instead of after the `---` rule, with more than one `## Review` section in the original, or with one in the translation. `pr-description push` does not count moving a trailer out of a half as an edit to that half.
- c90e8c5: `pr-description` and `open-pr --body-file` refuse a `## Review` section whose
  first line does not state the level and the total of rounds in digits, in one of
  these forms:

    ```md
    `/code-review high`, 3 rounds.
    Review at `high`, 2 rounds.
    Self-review at `high`, 1 round.
    ```

    `reviewOpeningOf` picks a section's opening line and `reviewOpeningRounds` reads
    the total from it.

- 10932ac: `start-issue` now says who started an issue. It takes `--by <claimant>` (a session URL, or any word unique to the claimant), which is required, and writes it into a claim comment beside the `in-progress` label. An issue someone else claimed is refused with their name and the time they claimed it. `--plan` labels an issue `planned` under a claim that lapses after 24 hours. `--release` takes either label off, and `--force` now goes with it to release someone else's claim. Two sessions starting one issue at the same moment no longer both get it: the claim is read back, and only the oldest one holds. `run-issue-resolver` claims under a name of its own for each run.

    `pr-report-core` adds `issue-claim.mts` (`writeIssueClaimComment`, `parseIssueClaimComment`, `readIssueClaim`, `issueClaimApplies`, `PLANNED_CLAIM_LIFETIME_HOURS`) and exports `CLOCK_SKEW_MINUTES`.

- bb577f6: Add `startable-issues`, which lists the open issues nobody has started in the order `run-issue-resolver` would hand them on — the same survey, by priority tier (`priority:S` first, `priority:D` last, `priority:hold` and `priority:close` held), the lowest number first within each — and says which startable ones it passed over and why. It writes nothing; `--limit` lists the first few and `--author` names whose issues it lists.

    Add the `resolve-issues` skill to the Claude Code plugin: `/pr-merge-queue:resolve-issues N` goes down the issues `startable-issues` lists, passing over any that one pull request cannot finish, and takes the others one at a time until N pull requests are open: `start-issue` as it takes one, then its own pull request opened with `open-pr`.

### Patch Changes

- cd4efe4: `open-pr` refuses, before pushing, a run whose `--base` differs from the base of the pull request already open for the branch, instead of reporting it stacked while it still targets the old base, and one that names that pull request in its own `--merge-after` or `--merge-before`. Without `--base`, the open pull request's base is used, so a stacked one stays stacked. On a pull request opened earlier it writes the `Merge-After:` the run declares that the body does not name yet, says that `--title` and `--body-file` are not applied, and `--dry-run` and the final message say what is done for it.
- ab618eb: `unblock-prs` decides whether a pull request needs a ruleset bypass merge for the head its rebase reached, not the head triage read, so a stacked pull request that loses an owned path on the rebase is armed rather than set aside `awaiting-bypass`, and one that gains one is not armed by it.
- ba78a89: `unblock-prs` sets a released pull request aside as `checks-not-started` once its head has gone five minutes with required contexts unreported and nothing running on it — GitHub started no check workflow — and tries the next candidate, instead of holding the queue until `--watch-timeout`. `pr-report-core` adds `checks-not-started` to `SET_ASIDE_REASONS`, owned by a person and cleared when the base moves.
- 8fd6ccc: `unblock-prs` no longer stalls the whole queue behind a pull request whose last push GitHub dropped, leaving its head, `refs/pull/<n>/head` and merge state behind its branch. A branch found at another commit before the rebase was always read as someone else pushing, so the cycle surveyed again, picked the same pull request, and never reached the next. The same mismatch still there ten minutes later now sets it aside as the new `head-out-of-sync` reason, with both commits, and the next candidate is tried; while it stays aside, its `UNKNOWN` merge state no longer makes every survey re-list. `pr-report-core` adds `head-out-of-sync` to `SET_ASIDE_REASONS`, owned by a person and not cleared by the base moving.
- 4bca9a0: `unblock-prs` no longer re-lists the pull requests for a minute on every survey behind an armed pull request whose push GitHub dropped. When a survey finds an armed pull request `UNKNOWN`, it reads the branches' tips in one `git ls-remote --heads origin` and records one whose branch is not at the head GitHub shows. The next survey that finds the same mismatch does not wait on it; the first still does, since a push GitHub has yet to take in looks the same for a few seconds. A `merge-queued` one is set aside as `head-out-of-sync` once the mismatch has lasted `OUT_OF_SYNC_GRACE_MS`, before triage, wherever it stands in the queue. Before, only the candidate a cycle picked was checked, and only a set-aside this run held in memory stopped the wait.
- 327bfab: `unblock-prs` no longer sets a pull request aside as checks-failed because of a red check left over from the round before, when some job of the new round is still queued and another one has already started. A queued check has no start time. It used to get a placeholder that read as year 1, which made the round look as if it began before every red check. While every job is still queued the round has no start time to compare against, and a red is judged, as before, only by whether its workflow has a newer run.
- db4053a: `unblock-prs` reads a pull request's checks once per survey and once per watch poll, not twice. The required checks and the ones still running now come from the same answer, so a round that ends between two reads can no longer show as both unfinished and finished in a single verdict when the head's checks fit on one page of 100. The read also costs half the GraphQL requests it did.
- 04da26a: `unblock-prs` no longer holds the queue for good behind a released pull request whose checks (or, for the version pull request, whether it was rebuilt on the tip) cannot be read. Unread at the same head for five surveys in a row, it is set aside as the new `read-failed` reason, with what failed, and the queue moves on — unless the same kind of read fails for the tip of the base too, which is GitHub failing rather than the pull request, and holds the queue instead. The log says which read failed. `pr-report-core` adds `read-failed` to `SET_ASIDE_REASONS`, owned by a person.
- Updated dependencies [dd6abb2]
- Updated dependencies [bb49866]
- Updated dependencies [5185cec]
- Updated dependencies [10932ac]
- Updated dependencies [9c02332]
- Updated dependencies [a28d46b]
- Updated dependencies [ba78a89]
- Updated dependencies [8fd6ccc]
- Updated dependencies [04da26a]
    - pr-report-core@0.3.0
    - ts-repo-utils@10.7.3
    - ts-fortress@12.4.4

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
