---
name: pnpm-update-ci
description: Fix the CI on the dependency-update pull request the pnpm-update workflow opens, and nothing else — find the open `chore/pnpm-update` pull request, judge its required checks, reproduce a failure locally, push the fix, and end silently when there is nothing wrong. Use when asked to look after the pnpm-update pull request, fix the dependency bump's CI, or when run as the scheduled routine that follows `pnpm-update.yml`.
---

# Fix the CI on the pnpm-update pull request

`.github/workflows/pnpm-update.yml` runs twice a week at 21:07 UTC. It rebuilds
`chore/pnpm-update` from `main`, force-pushes it, and opens
`chore: update dependencies` with `merge-queued` and auto-merge armed. Roughly
an hour later this runs, and its whole job is: if that pull request's CI is
red, make it green.

**When nothing is wrong, end without saying anything.** No "checked, all green"
— this runs unattended, and a report nobody asked for is noise on a schedule.

## Scope

One branch: `chore/pnpm-update`. Invoking this skill is the explicit
instruction `CLAUDE.md`, "Session rules" asks for before pushing, and it
reaches that branch and no other.

**Two jobs, and no third.** Reproduce a failing check and fix it. Everything
else about the pull request is already arranged: `merge-queued` says it is to
be landed, auto-merge is what lands it.

Never merge (`PUT /pulls/{n}/merge`), never arm or disarm auto-merge, never
approve, never touch labels. Never rebase — not locally, not through
`PUT /pulls/{n}/update-branch`. A branch behind `main` is not a problem here:
the next scheduled run rebuilds it from `main` anyway, and rebasing it now
buys a full CI matrix for a branch that is about to be thrown away.

`pnpm run unblock-prs` is not this skill's to run. It shells out to `gh`, and
`CLAUDE.md` keeps that with the author.

## Before starting

Read `.claude/skills/unblock-prs/SKILL.md`, "4. Fix a failing check" — the
check-name-to-command table, which checks need `pnpm run ws:build` first, and
why a command that succeeds can still fail the job. That is the half of this
skill that is not written here, because it is the same for every pull request.

Read `.claude/skills/references/github-api.md` for anything that talks to
GitHub. `gh` is not used.

## 1. Find it, and decide whether there is anything to do

```bash
pnpm run pr-report -- --format json
```

Take the entry whose `headRef` is `chore/pnpm-update`.

- **No such entry** — end silently. Either it merged or there was nothing to
  update that day; both are the system working.
- **`labels` has `skip-ci`** (each is `{ name, color, description }`, so the
  test is on `name`) — end silently. Somebody stopped it on
  purpose, and taking the label off is not this skill's job.
- **`checks.verdict` is `passed`** — end silently. Auto-merge will land it.
- **`checks.verdict` is `pending`** — the matrix is still running. Wait, and
  come back to this step; a full matrix is about 25 minutes.
- **`checks.verdict` is `failing`** — step 2.

`comparison.behindBy` being non-zero changes none of the above. So does
`checks.verdict` being `paused`, which is the `skip-ci` case above said
another way.

Keep `headSha`. It is what says, later, whether the bot force-pushed the
branch out from under this run.

## 2. First ask whether the branch is actually broken

A required context can fail with nothing wrong in the branch. The run the
`opened` event starts is cancelled by the `labeled` event's, and GitHub
resolves a duplicated context name to the run in the check suite with the
greatest id — which is usually the green one that superseded it, and
sometimes is not. When it is not, the cancelled run's red holds the merge and
there is no bug to find.

So before reproducing anything: for the failing context, list its runs and
look at the newest one. If the branch is fine and only an older suite is red,
the fix is to make that suite answer again — re-run it, per
`.claude/skills/references/github-api.md`, "A stale red that is holding the
merge". That is a write to Actions and costs one matrix; if the token lacks
`actions: write`, say so and stop rather than pushing an empty commit to
dislodge it.

Only when the newest run of the failing context is itself red is there
something to fix.

## 3. Find out what actually failed

`checks.failed` names the required contexts, which are aggregate jobs — they
do not name the matrix entry that failed. Follow
`.claude/skills/references/github-api.md`, "Which job failed, and why" down to
the job log, and grep `ELIFECYCLE` for the command rather than reading the
first error-shaped line.

## 4. Fix it

Reproduce locally first. A speculative push costs a full matrix, which is the
cost this whole routine exists to save.

```bash
git fetch origin chore/pnpm-update
git switch --detach FETCH_HEAD   # or check the branch out, if the tree is clean
pnpm install --frozen-lockfile
pnpm run ws:build                # for every check that needs it — see the table
```

`CLAUDE.md`'s rules hold: no file-level `eslint-disable`, no loosening
`eslint.config.mts`, no `as any`, no `@ts-ignore`. Fix the cause.

A failure from `fix:fmt:full`, `ws:gen`, `ws:fix:lint`, `ws:doc` or
`fix:codemod:full` is the job's closing `z:assert-repo-is-clean` finding a
dirty tree: the fix is to run that command locally and commit what it wrote.
The command exiting 0 is not the check passing.

Then:

```bash
pnpm run fmt
git commit -m "<Conventional Commits, in English>"
git push origin HEAD:chore/pnpm-update
```

An ordinary push should do. Only when one is genuinely needed, force with the
head this run actually saw:

```bash
git push --force-with-lease="chore/pnpm-update:<headSha from step 1>" origin HEAD:chore/pnpm-update
```

A bare `--force-with-lease` compares against the remote-tracking ref, which is
only as fresh as the last fetch — naming the SHA is what makes it a check.

If `git commit` dies with `failed to write commit object`, the signing key is
not in this environment: `git -c commit.gpgsign=false commit`. If the push is
refused with `Permission to noshiro-pf/mono.git denied`, the token lacks
`contents: write` — say so and stop.

Go back to step 1 and watch the new head through to a verdict.

## 5. When the branch moves under you

If `headSha` no longer matches what step 1 saw, the bot force-pushed. Do not
fight it: start again from step 1 against the new head, and drop the work that
was for the old one.

## Stop and ask instead of guessing

A failure that needs a decision — a dependency's breaking change that wants a
design call, a test whose expected value could reasonably go either way — is
not this skill's to resolve. Leave exactly one comment on the pull request, in
Japanese, saying what is broken and what the choice is, and end.

**`check:root:licenses` failing is always one of these.** It means an update
brought in a license `tools/configs/license-policy.mts` does not let through,
or changed the license of a package an exception covers. Adding or rewriting
an exception would turn the check green and is exactly what it exists to
prevent: that edit belongs to a person who has read the license, in a pull
request to `main`. Say in the comment which package, which version, and from
which license to which, and end.

## Report

Nothing at all, if nothing was done. Otherwise: which check failed, why, what
the fix was, and where the checks stand after the push. Short.
