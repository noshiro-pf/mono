---
name: unblock-prs
description: Clear what is blocking the open pull requests that already have auto-merge or the merge queue armed — resolve a conflict, fix a failing check, re-queue one the queue ejected — one PR at a time, and never merge anything by hand. Use when asked to unblock or look after the open PRs, watch CI, fix a failing check on a PR, or deal with a PR that fell out of the merge queue.
---

# Unblock open pull requests

Clear the obstacles in front of the pull requests that are already queued to
merge, so GitHub can merge them itself.

**Scope.** Only pull requests whose author has said "land this when it can":
auto-merge armed (`autoMergeRequest` is not null), sitting in the merge queue,
or demonstrably ejected from it (see step 4b). Everything else is still
someone's work in progress and is none of this skill's business.

**Two jobs, and no third.** Fix a failing check, and resolve a merge conflict.
**Never merge by hand.** No review approvals, no enabling auto-merge on a PR
whose author never armed it. The one arming allowed is re-arming: when the
queue ejects a PR, GitHub disarms its auto-merge mechanically — the author's
intent was already stated, so after fixing what failed, `gh pr merge --auto`
puts it back where its author left it. When a PR is green and still unmerged
for any other reason, report why — do not finish it by hand.

**What this skill no longer does: rebase branches that are behind `main`.**
The merge queue integrates every PR against main's tip itself, on the
`gh-readonly-queue/main/*` commit that actually lands — see "Check triggers,
drafts and the merge queue" in `CLAUDE.md`. `BEHIND` is not a blocker and not
actionable; updating the branch just burns a PR-head matrix the queue never
needed. The only rebase left is the conflict one (step 3).

Invoking this skill is the explicit instruction `CLAUDE.md` asks for before
pushing: for one PR at a time, you may push to that PR's branch, force-pushing
with `--force-with-lease`. Nothing on `main`, and no manual merges.

## The loop

**Survey → pick one → fix what blocks it → it merges itself → survey again.**
Stop and report instead of continuing when a failure needs a decision the user
has to make.

## 1. Survey

```bash
gh pr list --state open --json number,title,headRefName,baseRefName,isDraft,author,mergeStateStatus,autoMergeRequest \
  --jq '[.[] | select(.autoMergeRequest != null)]'
```

That filter finds the armed PRs, and it does most of the exclusion by itself:
`changeset-release/main` carries no auto-merge, and a draft PR cannot have one.
Still drop any PR whose `baseRefName` is not `main`. A PR the queue ejected is
the one in-scope state this filter misses — its auto-merge came back null
without anyone deciding that — so also check for failed `merge_group` runs:

```bash
gh run list --event merge_group --status failure --limit 10
```

`chore/pnpm-update` arms auto-merge via the bot, so it is in scope — but
`pnpm-update.yml` force-pushes that branch daily. If it moves under you, do
not fight it: re-survey and take its new state.

`mergeStateStatus` says what, if anything, blocks each one:

- `BEHIND` — behind main's tip. **Not a blocker and not actionable**: the
  queue integrates it when its turn comes. Leave it alone.
- `BLOCKED` — a required check is failing or still pending on the PR head, or
  a review thread is unresolved. The PR-head checks are the queue's entry
  ticket, so a failure here keeps it out of the queue: step 4a.
- `DIRTY` — conflicts with main; the queue cannot build its group. Step 3.
- `UNKNOWN` — GitHub has not finished computing the merge state. Query again a
  few seconds later; do not read it as up to date.
- `CLEAN` — nothing is blocking it, so it is queued or about to be. Leave it
  alone.

## 2. Pick exactly one

Take whichever PR the user named; otherwise the one most likely to go green
unattended — small, already reviewed, oldest first among equals. Everything
else waits, untouched: the queue orders the merges itself, and a second
fix-in-flight just muddies whose failure is whose.

## 3. Resolve a conflict (`DIRTY`)

Rebase locally, from a clean working tree:

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
intent of both sides; if the resolution is not obvious, stop and ask rather
than guessing. `git rebase --abort` puts everything back.

A force-push does not disarm auto-merge. If `autoMergeRequest` did come back
null and there is no ejection to explain it (step 4b), say so and stop rather
than re-enabling it.

## 4. Fix a failing check

Two places a check can fail, with different consequences:

### 4a. On the PR head (`BLOCKED`)

The failure is keeping the PR out of the queue. Find it and read only its
failing step:

```bash
gh pr checks <number> --json name,bucket,link --jq '.[] | select(.bucket=="fail")'
gh run view --job <job-id> --log-failed
```

Auto-merge survives an ordinary push, so once the fix lands and the head goes
green, the PR queues itself — no further command.

### 4b. On the merge group (ejected)

The PR-head checks passed, the queue built its group, and a required check
failed **there** — usually a semantic conflict with something that merged
ahead of it. GitHub ejects the PR and disarms its auto-merge; the evidence is
a failed `merge_group`-event run naming the PR's branch:

```bash
gh run list --event merge_group --status failure --limit 10
gh run view <run-id> --log-failed
```

Reproduce against what the group actually contained — main's tip plus this
branch — not against the branch alone:

```bash
git fetch origin main
git switch <branch>
git rebase origin/main   # or merge, if the branch is shared
```

Fix, push, and re-arm with `gh pr merge --auto <number>` — the one arming
this skill is allowed, because the disarming was the queue's, not the
author's.

### Reproducing either kind

**The check name is the command.** `style-check (X)` and `type-check (X)` both
run `pnpm run X` at the repository root, so `type-check (knip)` reproduces as
`pnpm run knip`. Four checks do not follow that rule:

| Check                        | What to run                                                     |
| :--------------------------- | :-------------------------------------------------------------- |
| `test-node-versions (<ver>)` | `pnpm run ws:build` then `pnpm run ws:test` on that Node        |
| `verify-published`           | `pnpm run verify:npm-packages:published`                        |
| `backup-repository-settings` | `pnpm run repo-settings:backup`, then look for a dirty tree     |
| `Validate PR title`          | The PR title is not Conventional Commits — `gh pr edit --title` |

`Validate PR title` is required because a squash merge takes the PR title as
the commit title (`squash_merge_commit_title: PR_TITLE`), so the fix is the
title itself, not the branch. On a merge-group run this check reports success
without validating anything — a title failure only ever appears on the PR
itself.

Two things about reproducing the rest:

- `type-check (*)`, `style-check (ws:doc)` and `style-check (ws:check:ext)` run
  `pnpm run ws:build` first in CI. Do the same locally or they fail for the wrong
  reason.
- Every job ends with `z:assert-repo-is-clean`. So `fmt:full`, `ws:doc`,
  `codemod:full` and `ws:lint:fix` fail by _changing_ files, and the fix is to
  run the command locally and commit what it wrote. A green run of the command
  with a dirty tree afterwards is still a failure.

Reproduce locally before pushing — a speculative fix costs another full
matrix. Fix the cause: `CLAUDE.md` rules hold, so no file-level
`eslint-disable`, no loosening `eslint.config.mts`, no `as any`. Then
`pnpm run fmt`, commit with a Conventional Commits message, push to the
branch, and watch:

```bash
gh pr checks <number> --watch --fail-fast --interval 60
```

`type-check` and `node-version-compatibility` jobs gate on
`z:check-should-run:code-checks`, and `style-check` jobs on
`z:check-should-run:style-checks`; both diff against `origin/main`. A job that
reports green having skipped its steps is expected on a docs-only branch (or,
for every workflow, an `experimental/`-only one), not a problem to chase.

## 5. It merged — then go round again

Confirm with `gh pr view <number> --json state,mergedAt`. The remote branch is
deleted automatically (`delete_branch_on_merge`); locally, `git fetch --prune`,
and if that branch was checked out, switch back to `main` and pull.

If every required check is green, the PR is armed, and it is still open and
out of the queue, something outside this skill's jobs is holding it — an
unresolved review thread, a required check that never reported. Report that
and stop. Do not merge it.

## 6. Report

One line per PR, in the order handled: number, what was done (fix pushed /
conflict resolved / re-queued after an ejection / left alone and why), and
where its checks stand. Name any PR left failing and what the failure is. Do
not report a run as green while checks are still pending, and say plainly
which PRs were never reached and which were out of scope for lacking
auto-merge.
