# pr-merge-queue

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
