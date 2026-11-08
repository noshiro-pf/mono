# pr-report-core

## 0.5.0

### Minor Changes

- 60ab844: `unblock-prs` reads which check runs carry the "command failed" annotation from the run GitHub answers for each name, through `pr-report-core`'s new `winningRuns`. `z:ci-job` prints that annotation as a notice, so that problem matchers spending a step's ten error annotations cannot drop it, and names the step that exited non-zero, a failed build included.
- 15bbead: `codeOwnersEnforcedBy` now reads only the file's head, the comments before its first rule, as the file and the check describe it: an `# enforced-by:` line after a rule no longer counts. `codeOwnerReviewOf` gives the code-owner half of `reviewHold` on its own, and `reviewHold` takes it precomputed. `namesEveryChangedPath` says whether GraphQL's changed files name every path (a rename or copy hides its old one), and `unblock-prs` and the Pull Requests Manager count a pull request with one as not fully read; `codeOwnerReview` still settles such a read where every rule's owners have approved. `unblock-prs` holds a red check that enforces `CODEOWNERS` when the review read cannot judge it instead of re-running it, reads failing pull requests' reviews only where `CODEOWNERS` names a required check, and names the `CODEOWNERS` a regeneration is judged by — the default branch's — apart from the branch it rebases onto.
- 9e92857: Support a `CODEOWNERS` file enforced by a required check instead of the ruleset's `require_code_owner_review`. `codeOwnersEnforcedBy` reads the `# enforced-by: <context>` line, `codeOwnerGate` says which of the two enforces the file, and `codeOwnerReview`'s `authorApproves` and `ReviewRules.codeOwnerGate` count the author as approving the paths they own there. `unblock-prs` holds someone else's pull request until an owner approves it, re-runs the failed check after the approval, and its auto-fix no longer pushes a fix that changes a path `CODEOWNERS` owns.
- 85e4ba4: `codeOwnerReview` takes `pushers`, who pushed to the pull request's branch: under a check that enforces `CODEOWNERS`, the author stands for a path they own only where everyone who pushed owns it too. `pushersOf` reads them from the repository's activity on the branch, or answers `'unknown'` where the chain of pushes does not reach the head. `unblock-prs` reads who pushed to a pull request failing only that check, and sets aside one only a bypass can merge (`checks-failed`) rather than re-running the check.
- beff847: `unblock-prs` keeps a `rebase-failed` set-aside across a move of the default branch while the branch still conflicts, updating only the base its comment records, so that the owner stays `skill` and `claim-pr` succeeds. It clears the set-aside only once the conflict is gone. `pr-report-core` gains `moveSetAsideBase`.
- 05aa7ba: Hold back the red of an earlier attempt while "Re-run failed jobs" runs its workflow run again, read from REST's `run_started_at` and shared by `unblock-prs` and `pr-report` (`isOfEarlierAttempt`, `readWorkflowRound`, `readWorkflowRounds`), for at most 40 minutes after the attempt began.
- eeaeeda: `pr-report-core` exports `REVIEW_SECTION_HEADING`, `CLAUDE_SESSION_LINE` and `isDeclarationLine`, so that `pr-description` guards a body with the patterns its parsers read it by rather than copies of them.

### Patch Changes

- Updated dependencies [931ba22]
    - ts-data-forge@14.13.0
    - ts-fortress@12.4.6

## 0.4.1

### Patch Changes

- 12754c6: `unblock-prs` says what holds a pull request that went green and did not merge from its review as read at the watched head — the code owner it waits for, or the unresolved conversations — instead of GitHub's `reviewDecision`, which is `null` under a ruleset, so the set-aside status stops guessing when the review names the hold.

    `queueOwner` no longer says the worker cannot read what holds a `not-merging` pull request, since the set-aside now names it when the review does.

- Updated dependencies [39ac703]
    - ts-data-forge@14.12.0
    - ts-fortress@12.4.5

## 0.4.0

### Minor Changes

- 670c1d3: `unblock-prs` ranks the runs of one job in one workflow and event by check suite, then by check run id, as `pr-report` does, rather than by when they started, and waits on a red required check while its own workflow run, with a job in it re-run after the red, has not finished. A queued re-run of a failed job, or the new round's queued aggregate, is waited on instead of losing to the red it replaces, and a pending commit status no longer counts as the start of a round. `pr-report-core` exports `outranks`, the ranking `statesFromCheckRuns` uses, and its `CheckRunRank` type.

### Patch Changes

- Updated dependencies [36ffebb]
- Updated dependencies [23bfcbe]
    - ts-data-forge@14.11.1

## 0.3.0

### Minor Changes

- dd6abb2: `pr-report-core` adds `readBranchRequirements`, which reads what GitHub requires of a branch — every ruleset that applies to it and the contexts a classic branch protection rule requires — through a transport the reader hands over. `unblock-prs`, and `pr-report` wherever it reads GitHub's rules rather than the checkout's `repo-settings/rulesets/main.json`, now read the required contexts through it, so a context required only by a classic branch protection rule is waited for rather than missed, and they ask for a hundred rules rather than GitHub's default page of thirty.
- 5185cec: Place every issue in one priority tier. `pr-report-core` reads the `priority:S`, `priority:A`, `priority:B`, `priority:C`, `priority:D`, `priority:hold` and `priority:close` issue labels (`issuePriorityOfLabels`, `issueStartRank`). `pr-description create` needs `--priority <tier>` and refuses while an open issue has a close title, unless each is named with `--not-duplicate`; the new `pr-description similar` lists the open issues a new one may repeat. `run-issue-resolver` takes issues by tier and leaves `priority:hold` and `priority:close`, `pr-report` names an issue with no tier or several, and `report-unowned-prs` files its issues under `priority:A`.
- 10932ac: `start-issue` now says who started an issue. It takes `--by <claimant>` (a session URL, or any word unique to the claimant), which is required, and writes it into a claim comment beside the `in-progress` label. An issue someone else claimed is refused with their name and the time they claimed it. `--plan` labels an issue `planned` under a claim that lapses after 24 hours. `--release` takes either label off, and `--force` now goes with it to release someone else's claim. Two sessions starting one issue at the same moment no longer both get it: the claim is read back, and only the oldest one holds. `run-issue-resolver` claims under a name of its own for each run.

    `pr-report-core` adds `issue-claim.mts` (`writeIssueClaimComment`, `parseIssueClaimComment`, `readIssueClaim`, `issueClaimApplies`, `PLANNED_CLAIM_LIFETIME_HOURS`) and exports `CLOCK_SKEW_MINUTES`.

- ba78a89: `unblock-prs` sets a released pull request aside as `checks-not-started` once its head has gone five minutes with required contexts unreported and nothing running on it — GitHub started no check workflow — and tries the next candidate, instead of holding the queue until `--watch-timeout`. `pr-report-core` adds `checks-not-started` to `SET_ASIDE_REASONS`, owned by a person and cleared when the base moves.
- 8fd6ccc: `unblock-prs` no longer stalls the whole queue behind a pull request whose last push GitHub dropped, leaving its head, `refs/pull/<n>/head` and merge state behind its branch. A branch found at another commit before the rebase was always read as someone else pushing, so the cycle surveyed again, picked the same pull request, and never reached the next. The same mismatch still there ten minutes later now sets it aside as the new `head-out-of-sync` reason, with both commits, and the next candidate is tried; while it stays aside, its `UNKNOWN` merge state no longer makes every survey re-list. `pr-report-core` adds `head-out-of-sync` to `SET_ASIDE_REASONS`, owned by a person and not cleared by the base moving.
- 04da26a: `unblock-prs` no longer holds the queue for good behind a released pull request whose checks (or, for the version pull request, whether it was rebuilt on the tip) cannot be read. Unread at the same head for five surveys in a row, it is set aside as the new `read-failed` reason, with what failed, and the queue moves on — unless the same kind of read fails for the tip of the base too, which is GitHub failing rather than the pull request, and holds the queue instead. The log says which read failed. `pr-report-core` adds `read-failed` to `SET_ASIDE_REASONS`, owned by a person.

### Patch Changes

- Updated dependencies [9c02332]
    - ts-fortress@12.4.4

## 0.2.1

### Patch Changes

- aa74c78: `findMergeAfterCycles` now puts every number that lies on a cycle into at least one reported cycle. Its depth-first walk skipped nodes it had finished, so a node whose only way back into a cycle ran through one was missed: with #1 after #2 and #3, #2 after #1 and #3 after #2, #3 was left out, and the tree, the queue order and the issue start states treated it as off any cycle. Each entry is now the shortest cycle through the first number no earlier entry covers.
- c4ce547: `outsideCodeFences`, and with it `parseMergeAfter` and `parseStartAfter`, now closes a fenced code block the way CommonMark does: only on a run of the opening character at least as long as the opener, with nothing after it. Every fence line used to toggle the block, so a ` ``` ` line inside a ` ` ```` or `~~~` block ended it, and a sample `Merge-After:` or `Start-After:` after it was read as a real declaration. A backtick line whose info string holds a backtick no longer opens a block either.
- Updated dependencies [e9420e9]
- Updated dependencies [a48864f]
- Updated dependencies [1f78470]
- Updated dependencies [d567a6a]
- Updated dependencies [27bc91d]
    - ts-data-forge@14.11.0
    - ts-fortress@12.4.3

## 0.2.0

### Minor Changes

- 2cd2d59: `unblock-prs` now ranks a queued pull request that only a ruleset bypass can merge with `priority:low` unless it is labelled `priority:high` (alone), both when picking and when two pull requests are released at once. Picked early, it went green only to be set aside `awaiting-bypass`, and the candidates behind it waited for nothing. `pr-report-core` adds `pickPriorityRank`, and `orderCandidates` takes a required `bypass` predicate; the Pull Requests Manager draws the queue in the same order.

## 0.1.0

### Minor Changes

- 6365077: Mark issues as started or planned. `pr-report-core` adds the `in-progress` and `planned` labels (`IN_PROGRESS_LABEL`, `PLANNED_LABEL`) and `progressOf`: a startable issue labelled `in-progress` now reads as `in-progress`, as one an open pull request closes does, and one labelled `planned` as the new `planned` start state. `withProgress` takes that `IssueProgress` instead of a boolean. `pr-merge-queue` adds `start-issue`, which labels an issue `in-progress` before work on it begins and refuses one already labelled so or closed by an open pull request, unless given `--force`.

## 0.0.6

### Patch Changes

- d4c53a2: Read the branches a repository generates, such as a dependency update, from `generatedBranches` in `.github/unblock-prs.json` instead of a fixed `chore/pnpm-update`: `push-fixed-pr` refuses a hand-resolved conflict on one and names its `rebuild`. `pr-report-core` no longer exports `PNPM_UPDATE_BRANCH`. `pr-report` reads the checkout's `repo-settings/rulesets/main.json` only when it reports on the checkout's own repository.

## 0.0.5

### Patch Changes

- 5fd0af1: No change to the code. This is the first version published by the release workflow through npm trusted publishing, so it carries a provenance attestation; 0.0.4 was published by hand without one.
- Updated dependencies [1ebff9f]
- Updated dependencies [4d0d586]
    - ts-fortress@12.4.0

## 0.0.4

### Patch Changes

- Updated dependencies [7f3e173]
    - ts-data-forge@14.10.0
    - ts-fortress@12.3.2

## 0.0.3

### Patch Changes

- Updated dependencies [079cb28]
    - ts-data-forge@14.9.0
    - ts-fortress@12.3.1

## 0.0.2

### Patch Changes

- Updated dependencies [f89dc57]
- Updated dependencies [4d08519]
    - ts-data-forge@14.8.0
    - ts-fortress@12.3.0

## 0.0.1

### Patch Changes

- Updated dependencies [7fcbc3b]
    - ts-fortress@12.2.0
