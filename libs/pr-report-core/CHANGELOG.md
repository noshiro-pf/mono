# pr-report-core

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
