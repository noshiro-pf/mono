# pr-report-core

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
