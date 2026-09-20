---
name: unblock-prs
description: Clear what is blocking the open pull requests labelled `merge-queued` — rebase the one that is out-of-date with the base branch, take `skip-ci` off when its turn comes, watch its checks, fix what fails — one PR at a time, in the order they declare with `Merge-After:` and `blocks-release`, and never merge anything. Use when asked to unblock or look after the open PRs, rebase branches behind main, release the merge queue, watch CI, or fix a failing check on a PR.
---

# Unblock open pull requests

Clear the obstacles in front of the pull requests that are already queued to
merge, so GitHub can merge them itself.

**Scope.** Only pull requests labelled `merge-queued` with auto-merge already
enabled (`autoMergeRequest` is not null). The label is the author saying this
one is reviewed and is to be landed; auto-merge is what actually lands it,
since this skill never merges anything. A PR without the label is none of this
skill's business however ready it looks — pass it over in silence. A PR with
the label that cannot be acted on (a draft, no auto-merge, a base that is not
`main`) is reported, because the label asked for something and the answer is
no.

**`skip-ci` does not put a PR out of scope; taking it off is the job.** It
pauses a queued PR rather than removing it, and the release is a PR at a time,
in turn.

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
`tools/scripts/cmd/unblock-prs/README.md` walks through what the script does
at each of those steps, in English and Japanese; this skill is the half the
script does not do.
Stop and report instead of continuing when a failure needs a decision the user
has to make.

## 1. Survey

```bash
gh pr list --state open --json number,title,body,headRefName,baseRefName,isDraft,labels,author,mergeStateStatus,autoMergeRequest \
  --jq '[.[] | select(.autoMergeRequest != null and (.labels | map(.name) | index("merge-queued")))]'
```

Those two filters are the scope rule. Still drop any PR whose `baseRefName` is
not `main`. `body` is in the list because the declared order is read from it —
see "The declared merge order" below.

**A `skip-ci` PR in that list is a paused one, not an excluded one.** While the
label is on, the five check workflows and the two lint jobs skip and
`skip-ci-label.yml` writes the required `no-skip-ci-label` status as `pending`,
which is the only thing holding the merge — so its `mergeStateStatus` says
nothing useful (`BLOCKED` however ready it is) and its checks cannot go green
however long it is watched. Taking the label off is the action, one PR at a
time. See "Check triggers, `skip-ci` and out-of-date branches" in `CLAUDE.md`.

`chore/pnpm-update` is opened `merge-queued` by the bot, with auto-merge, so it
is in scope — but `pnpm-update.yml` force-pushes that branch twice a week. If
it moves under you, do not fight it: re-survey and take its new state.

**`changeset-release/main` is the version PR, and it is never rebased** — see
"The release goes last" below. `release.yml` rebuilds that branch from the tip
of `main` and force-pushes it on every push to `main`, so the only thing it is
ever given is its `skip-ci`.

`mergeStateStatus` says what is blocking each one (for a PR without `skip-ci` —
with it, the state is `BLOCKED` and means nothing):

- `BEHIND` — exactly the "out-of-date with the base branch" banner. This is the
  one the loop rebases.
- `BLOCKED` — up to date, but a required check is failing or still pending, or a
  review is missing. Go to step 3 or 4; do not rebase it, that only restarts the
  same matrix.
- `DIRTY` — GitHub's test _merge_ of the branch into `main` conflicts, which is
  not the same as saying a rebase will. That answer is computed asynchronously
  and cached, so it is regularly stale after a force-push or a base that has
  just moved, and a rebase replays commit by commit onto the tip rather than
  three-way merging from a merge base. Try the rebase before believing it —
  step 2b. Only a rebase that actually stops on a conflict is a conflict.
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

### 2b. When GitHub says it conflicts

`gh pr update-branch` fails, or `mergeStateStatus` was `DIRTY`. Rebase locally
anyway, from a clean working tree — it often just works, and where it does the
PR was never conflicted:

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

**A short green list is not a green PR.** `gh pr checks` lists the check runs
that exist on the head commit, and a required context whose workflow has not
reported yet is _absent_ from that output rather than pending in it. Three
minutes into a twenty-five minute matrix, `--required` happily returns four
green rows out of seven. So count them against what the ruleset actually
requires, live rather than from the file:

```bash
gh api 'repos/{owner}/{repo}/rules/branches/main' \
  --jq '.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context'
```

`mergeStateStatus` is the cross-check: while it says `BLOCKED` and every
reported check is green, the reason is almost always a context that has not
reported. Keep waiting; do not conclude the PR is held by something else, and
above all do not start on the next PR.

**`no-skip-ci-label` pending is the exception, and it never resolves itself.** It
means the `skip-ci` label went on while you were watching, which also skipped
every other check on that commit. Stop watching, go back to step 1, and treat
the PR as out of scope until the label comes off.

Do not start the next PR while this one is being watched.

## 4. Fix a failing check

Find the failing job and read only its failing step:

```bash
gh pr checks <number> --json name,bucket,link --jq '.[] | select(.bucket=="fail")'
gh run view --job <job-id> --log-failed
```

**The check name is the command.** `style-check (X)` and `code-check (X)` both
run `pnpm run X` at the repository root, so `code-check (check:knip)` reproduces as
`pnpm run check:knip`. Five checks do not follow that rule:

| Check                        | What to run                                                     |
| :--------------------------- | :-------------------------------------------------------------- |
| `test-node-versions (<ver>)` | `pnpm run ws:build` then `pnpm run ws:check:test` on that Node  |
| `verify-published`           | `pnpm run verify:npm-packages:published`                        |
| `backup-repository-settings` | `pnpm run repo-settings:backup`, then look for a dirty tree     |
| `Validate PR title`          | The PR title is not Conventional Commits — `gh pr edit --title` |
| `Validate commit count`      | The branch is more than one commit — squash it, see below       |

`Validate PR title` is required because a squash merge takes the PR title as the
commit title (`squash_merge_commit_title: PR_TITLE`), so the fix is the title
itself, not the branch. It checks Conventional Commits and English; `skip-ci` in
a title means nothing to any workflow, which reads the label instead.

`Validate commit count` is the same rule about the other half of the squash
commit: the branch's subjects become its body, so the branch is one commit.
Squashing rewrites someone's branch and writes the message that lands on
`main`, which is more than a rebase — do it only for a pull request this run is
already moving, from a throwaway worktree, with
`git reset --soft "$(git merge-base HEAD origin/main)" && git commit` and a
`--force-with-lease` push against the head the survey saw. If the message is
not obvious from the PR title and body, stop and ask.

Two things about reproducing the rest:

- `code-check (*)`, `style-check (ws:doc)`, `style-check (ws:check:ext)` and
  `style-check (ws:gen)` run `pnpm run ws:build` first in CI. Do the same
  locally or they fail for the wrong reason.
- Every job ends with `z:assert-repo-is-clean`. So `fix:fmt:full`, `ws:doc`,
  `fix:codemod:full`, `ws:fix:lint` and `ws:gen` fail by _changing_
  files, and the fix is to run the command locally and commit what it wrote. A
  green run of the command with a dirty tree afterwards is still a failure.

Reproduce locally before pushing — a speculative fix costs another full matrix,
which is the cost this whole loop exists to avoid. Fix the cause: `CLAUDE.md`
rules hold, so no file-level `eslint-disable`, no loosening `eslint.config.mts`,
no `as any`. Then `pnpm run fmt`, commit with a Conventional Commits message,
push to the branch, and go back to watching. Auto-merge survives the push, so a
green result merges the PR without another command. Do not re-rebase for a fix
unless `main` has moved.

`code-check` and `node-version-compatibility` jobs gate on
`z:check-should-run:code-checks`, and `style-check` jobs on
`z:check-should-run:style-checks`; both diff against `origin/main`. A job that
reports green having skipped its steps is expected on a docs-only branch (or,
for every workflow, an `experimental/`-only one), not a problem to chase.

## 5. It merged — then go round again

Confirm with `gh pr view <number> --json state,mergedAt`. The remote branch is
deleted automatically (`delete_branch_on_merge`); locally, `git fetch --prune`,
and if that branch was checked out, switch back to `main` and pull.

If every required context has reported (step 3 — not merely every context that
happens to be listed) and all of them are green while the PR is still open,
something outside this skill's two jobs is holding it — a missing review, an
unresolved conversation, auto-merge disabled behind your back. Report that and
stop. Do not merge it.

Once it does merge, `main` has moved and every remaining PR reads `BEHIND` again.
That is expected, not a regression. Return to step 1 and pick the next single PR.

## The declared merge order

**`Merge-After: #1234`, a trailer on its own line in the PR body.** The PR is
not _picked_ — not rebased, not released from `skip-ci` — while any PR it
names is still open. It constrains picking and nothing else: a PR that is
already up to date and merging is left to auto-merge, which takes no notice of
anything written here, and passing it over would only send you off to rebase a
branch that merge is about to invalidate. Several numbers may be named, on one
line or on several, so the declarations form a graph; a cycle in it blocks
everything it touches, and it is named as a cycle rather than left to report
"waiting on #N" forever.

**A trailer inside a fenced code block is not read**, so a PR that documents
the convention does not accidentally declare one. Write examples in a fence.

**Rebase first, take `skip-ci` off second.** While the label is on, the push the
rebase makes fires a `synchronize` whose every check workflow skips, so it
costs nothing; taking the label off then fires `unlabeled`, and the matrix
that starts runs once, on the head that will actually be merged. The other
order starts a full matrix on the pre-rebase head and has the push cancel it.

**Releasing one PR is the whole of the job.** From there it is an ordinary
queued PR: if its checks fail it is set aside like any other, with its
`skip-ci` off, and everything that declared `Merge-After` on it waits, because
it has not merged. That is a queue that has stalled and is waiting for a
person, which is what a declared order is for — do not take the next PR out of
turn to keep things moving.

## The release goes last

**`changeset-release/main`** is the PR `changesets/action` opens to version the
packages and publish them. It is derived, not written, and that changes what
you may do to it.

**Never rebase it.** `release.yml` rebuilds the branch from the tip of `main`
and force-pushes it on every push to `main`. Rebasing it here would be a second
thing force-pushing one branch, and it would land the old version commit on a
tip carrying a changeset it never consumed — merge that and the release is
missing the very change the queue was assembled for. If it is not on the tip of
`main`, wait: the release run is regenerating it. Check with git, not with
`mergeStateStatus`, which is an asynchronously computed cached answer:

```bash
test "$(git merge-base "$(git rev-parse origin/main)" "$HEAD_OID")" = "$(git rev-parse origin/main)"
```

**`blocks-release` on any open PR holds it.** That label is how an order is
declared _on_ the version PR, because its body cannot carry one — `release.yml`
overwrites its title and body on every push to `main`, so a `Merge-After:`
written there is wiped exactly when another queued PR merging first made it
matter. **Never write a `Merge-After:` trailer into the version PR's body**;
put `blocks-release` on the PR the release is waiting for instead. A draft
carrying it counts, and nothing ever takes it off — merging or closing that PR
is what clears it.

**Report the blockers every cycle, by number.** A forgotten draft carrying
`blocks-release` holds every release silently, and the report is the only thing
that would say so.

**Take its `skip-ci` off last**, after the queued PRs: a queued change belongs
in this release rather than in the one after it. `release.yml` puts `skip-ci`
back on whenever it rebuilds the branch, which is correct — the contents
changed, so the PR goes through the queue again. Do not work around it.

## 6. Report

One line per PR, in the order handled: number, what was done (rebased and merged
by GitHub / rebased and waiting / fix pushed / left alone and why), and where its
checks stand. Name any PR left failing and what the failure is. Do not report a
run as green while checks are still pending, and say plainly which PRs were never
reached and which were out of scope — for lacking `merge-queued`, or for
lacking auto-merge. Report it as an order: which PR was released, what is
behind it, and what each one is waiting on.
