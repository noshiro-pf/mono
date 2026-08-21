---
name: unblock-prs
description: Clear what is blocking the open pull requests that already have auto-merge enabled — rebase the one that is out-of-date with the base branch, watch its checks, fix what fails — one PR at a time, and never merge anything. Use when asked to unblock or look after the open PRs, rebase branches behind main, watch CI, or fix a failing check on a PR.
---

# Unblock open pull requests

Clear the obstacles in front of the pull requests that are already queued to
merge, so GitHub can merge them itself.

**Scope.** Only pull requests with auto-merge already enabled
(`autoMergeRequest` is not null). That flag is the author's statement that the
PR should land as soon as it is able to; everything else is still someone's work
in progress and is none of this skill's business.

**Two jobs, and no third.** Rebase a branch that is out-of-date with `main`, and
fix a failing check. **Never merge.** No `gh pr merge`, no `--auto`, no enabling
auto-merge on a PR that lacks it, no review approvals. When a PR is green and
still unmerged, report why — do not finish it by hand.

**One at a time.** Merging any PR moves `main`, which puts every other open
branch back to `BEHIND`. A batch rebase therefore runs a full CI matrix per
branch and throws all but the first away. Never rebase a second PR while one is
still in flight.

Invoking this skill is the explicit instruction `CLAUDE.md` asks for before
pushing: for one PR at a time, you may push to that PR's branch, force-pushing
with `--force-with-lease`. Nothing on `main`, and no merges.

## The loop

**Survey → pick one → rebase → watch → fix → it merges itself → survey again.**
Stop and report instead of continuing when a failure needs a decision the user
has to make.

## 1. Survey

```bash
gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,author,mergeStateStatus,autoMergeRequest \
  --jq '[.[] | select(.autoMergeRequest != null)]'
```

That filter is the scope rule, and it does most of the exclusion by itself:
`changeset-release/main` carries no auto-merge, and a draft PR cannot have one.
Still drop any PR whose `baseRefName` is not `main`.

`chore/pnpm-update` does have auto-merge, enabled by the bot, so it is in scope —
but `pnpm-update.yml` force-pushes that branch daily. If it moves under you, do
not fight it: re-survey and take its new state.

`mergeStateStatus` says what is blocking each one:

- `BEHIND` — exactly the "out-of-date with the base branch" banner. This is the
  one the loop rebases.
- `BLOCKED` — up to date, but a required check is failing or still pending, or a
  review is missing. Go to step 3 or 4; do not rebase it, that only restarts the
  same matrix.
- `DIRTY` — the rebase will conflict. Step 2b.
- `UNKNOWN` — GitHub has not finished computing the merge state. Query again a
  few seconds later; do not read it as up to date.
- `CLEAN` — nothing is blocking it and auto-merge is on, so it is already
  merging. Leave it alone.

## 2. Pick exactly one, and rebase it

Take whichever PR the user named; otherwise the one most likely to go green
unattended — small, already reviewed, oldest first among equals. Everything else
waits, untouched. A PR sitting at `BEHIND` costs nothing.

### 2a. The normal case

```bash
gh pr update-branch --rebase <number>
```

This rebases server-side. It does not touch the working tree, needs no checkout,
and fails cleanly instead of leaving a half-finished rebase behind. It does not
merge anything, and it leaves auto-merge armed. Confirm the head commit actually
moved and that checks are queued on the new SHA:

```bash
gh pr view <number> --json headRefOid,mergeStateStatus,autoMergeRequest
gh pr checks <number>
```

If the local clone has that branch checked out, it is now stale. Only resync it
when `git status --porcelain` is empty — never discard uncommitted work:

```bash
git fetch origin <branch> && git reset --hard "origin/<branch>"
```

### 2b. When it conflicts

`gh pr update-branch` fails, or `mergeStateStatus` was `DIRTY`. Rebase locally,
from a clean working tree:

```bash
git fetch origin main
git switch <branch>
git rebase origin/main
# resolve, git add, git rebase --continue
git push --force-with-lease="<branch>:<sha-before-the-rebase>" origin <branch>
```

Name the expected SHA in `--force-with-lease`. A bare `--force-with-lease`
compares against the remote-tracking ref, which is only as fresh as the last
fetch — the same trap `pnpm-update.yml` hit. Resolve conflicts by keeping the
intent of both sides; if the resolution is not obvious, stop and ask rather than
guessing. `git rebase --abort` puts everything back.

Note that a force-push does not disarm auto-merge; if `autoMergeRequest` did come
back null, say so and stop rather than re-enabling it.

## 3. Watch the checks

Every workflow here triggers on `push`, so the rebase started a fresh matrix; the
full set takes roughly 25 minutes. Watch it in the background:

```bash
gh pr checks <number> --watch --fail-fast --interval 60
```

`--required` narrows the output to the checks that gate the merge;
`repo-settings/rulesets/main.json` is that list. When they all pass, GitHub
squashes and merges the PR on its own — that is the intended ending, and nothing
here should race it.

Do not start the next PR while this one is being watched.

## 4. Fix a failing check

Find the failing job and read only its failing step:

```bash
gh pr checks <number> --json name,bucket,link --jq '.[] | select(.bucket=="fail")'
gh run view --job <job-id> --log-failed
```

**The check name is the command.** `style-check (X)` and `type-check (X)` both
run `pnpm run X` at the repository root, so `type-check (knip)` reproduces as
`pnpm run knip`. Four checks do not follow that rule:

| Check                        | What to run                                                     |
| :--------------------------- | :-------------------------------------------------------------- |
| `test-node-versions (<ver>)` | `pnpm run ws:build` then `pnpm run ws:test` on that Node        |
| `verify-published`           | `pnpm run verify:npm-packages:published`                        |
| `backup-repository-settings` | `pnpm run repo-settings:backup`, then look for a dirty tree     |
| `Validate PR title`          | The PR title is not Conventional Commits — `gh pr edit --title` |

`Validate PR title` is required because a squash merge takes the PR title as the
commit title (`squash_merge_commit_title: PR_TITLE`), so the fix is the title
itself, not the branch.

Two things about reproducing the rest:

- `type-check (*)`, `style-check (ws:doc)` and `style-check (ws:check:ext)` run
  `pnpm run ws:build` first in CI. Do the same locally or they fail for the wrong
  reason.
- Every job ends with `z:assert-repo-is-clean`. So `fmt:full`, `ws:doc`,
  `codemod:full` and `ws:lint:fix` fail by _changing_ files, and the fix is to
  run the command locally and commit what it wrote. A green run of the command
  with a dirty tree afterwards is still a failure.

Reproduce locally before pushing — a speculative fix costs another full matrix,
which is the cost this whole loop exists to avoid. Fix the cause: `CLAUDE.md`
rules hold, so no file-level `eslint-disable`, no loosening `eslint.config.mts`,
no `as any`. Then `pnpm run fmt`, commit with a Conventional Commits message,
push to the branch, and go back to watching. Auto-merge survives the push, so a
green result merges the PR without another command. Do not re-rebase for a fix
unless `main` has moved.

`type-check` and `node-version-compatibility` jobs gate on
`z:check-should-run:code-checks`, and `style-check` jobs on
`z:check-should-run:style-checks`; both diff against `origin/main`. A job that
reports green having skipped its steps is expected on a docs-only branch (or,
for every workflow, an `experimental/`-only one), not a problem to chase.

## 5. It merged — then go round again

Confirm with `gh pr view <number> --json state,mergedAt`. The remote branch is
deleted automatically (`delete_branch_on_merge`); locally, `git fetch --prune`,
and if that branch was checked out, switch back to `main` and pull.

If every required check is green and the PR is still open, something outside this
skill's two jobs is holding it — a missing review, a required check that never
reported, auto-merge disabled behind your back. Report that and stop. Do not
merge it.

Once it does merge, `main` has moved and every remaining PR reads `BEHIND` again.
That is expected, not a regression. Return to step 1 and pick the next single PR.

## 6. Report

One line per PR, in the order handled: number, what was done (rebased and merged
by GitHub / rebased and waiting / fix pushed / left alone and why), and where its
checks stand. Name any PR left failing and what the failure is. Do not report a
run as green while checks are still pending, and say plainly which PRs were never
reached and which were out of scope for lacking auto-merge.
