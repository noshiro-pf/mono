---
name: unblock-prs
description: Clear what is blocking the open pull requests labelled `merge-queued` — rebase the one that is out-of-date with the base branch, take `skip-ci` off when its turn comes, watch its checks, fix what fails — one PR at a time, in the order they declare with `Merge-After:` and `blocks-release`, and never merge anything. Use when asked to unblock or look after the open PRs, rebase branches behind main, release the merge queue, watch CI, or fix a failing check on a PR.
---

# Unblock open pull requests

Clear the obstacles in front of the pull requests that are already queued to
merge, so GitHub can merge them itself.

**Scope.** Only pull requests labelled `merge-queued` with auto-merge already
enabled (`autoMerge` is true). The label is the author saying this
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
still in flight, and never leave more than one queued PR without `skip-ci` —
see "Beside the worker".

Invoking this skill is the explicit instruction `CLAUDE.md` asks for before
pushing: for one PR at a time, you may push to that PR's branch, force-pushing
with `--force-with-lease`. Nothing on `main`, and no merges.

**`gh` is not used here**, because `CLAUDE.md`, "Session rules" does not allow
a session it. Every call below is the REST API or `pnpm run pr-report`;
`.claude/skills/references/github-api.md` has the credential, the one-call
helper, and what each `gh` command became. `pnpm run unblock-prs` itself does
shell out to `gh`, which is what keeps that script the author's to run — this
skill is the half a session can do.

## Beside the worker

`pnpm run unblock-prs` is the worker: it runs on the author's machine for
hours, surveying every few minutes, rebasing, taking `skip-ci` off and
watching — the same queue this skill moves, through the same labels and the
same branches. **Assume it is running.** A session cannot see it — it has no
process here, no lock and no heartbeat — and a session that assumes it is
alone is how two writers end up force-pushing one branch or running two
matrices where one was meant to run. The two are split by what the worker does
not do, and made safe where they overlap:

- **What the worker sets aside is this skill's.** Each time it gives up on a
  pull request it writes a `failure` commit status, context `unblock-prs`, on
  that head: `reported["unblock-prs"] === "failed"` in the report, and the
  description in `GET /commits/{sha}/status` reads
  `<reason> at <base sha>: <detail>`. `checks-failed` is step 4 and
  `rebase-failed` is step 2b; the other reasons are to report. The worker
  leaves that pull request alone until its head moves (or, for every reason
  but `checks-failed`, `main` does), so working on it collides with nothing,
  and the push that carries the work is what hands it back. A
  `checks-failed` it wrote on the pull request it was watching comes after it
  tried the one fix it makes itself — running the `fix:` / `gen:` matrix
  entries that failed and pushing what they wrote, when nothing else failed —
  so what is left is a real failure, or a fixer that did not settle it.
- **Every write is leased against a SHA this session read**:
  `expected_head_sha` on `update-branch`, `--force-with-lease=<branch>:<sha>`
  on a push. A lease that loses means someone else — the worker,
  `pnpm-update.yml`, `release.yml`, the author — moved the branch. Survey
  again and take the new state; do not retry against a fresh lease, and do
  not turn to another pull request instead, because whoever pushed is about
  to start a matrix. The worker does the same.
- **Pick as the worker picks** (step 2), so that two writers choosing at once
  choose the same pull request and the lease settles which of them moves it.
- **Re-read just before anything that starts a matrix** — a rebase, taking
  `skip-ci` off, a push without the label. An up-to-date pull request with no
  `skip-ci` and checks pending is in flight, whoever put it there, and it is
  watched, not joined by a second.
- **At most one queued pull request is released**, released meaning
  `merge-queued` without `skip-ci`: a push to it, or the label coming off,
  starts the full matrix, and only one can merge before `main` moves.
  Releasing — taking `skip-ci` off, or pushing to one that has no label — is
  done only when nothing is in flight, and first puts `skip-ci`
  (`POST /issues/{n}/labels`) on every other released one: set-aside ones,
  drafts and ones without auto-merge included. Then run the report again.
  Another released one means someone released it in the same moment, and the
  one first in the pick order (lowest number, the version PR last) keeps its
  release: put `skip-ci` on the rest, yours included if it lost, and go back
  to step 1. While watching, the same: of the ones in flight the first in the
  pick order is kept, and every other released one is paused —
  `pnpm-update.yml` opens its pull request without the label. The worker
  applies the same rule, so both settle on the same one. The case it exists
  for is in `tools/scripts/cmd/unblock-prs/README.md`, "One released pull
  request at a time".
- **So a push while another pull request is in flight goes out under
  `skip-ci`**: put the label on first, then push. The push costs nothing, and
  the pull request is back in the queue, to be rebased and released in turn
  by the worker or by this skill's next pass. By the time a failure has been
  reproduced and fixed, the worker has usually released the next pull request
  already.

## The loop

**Survey → pick one → rebase → watch → fix → it merges itself → survey again.**
`tools/scripts/cmd/unblock-prs/README.md` walks through what the script does
at each of those steps, in English and Japanese; this skill is the half the
script does not do.
Stop and report instead of continuing when a failure needs a decision the user
has to make.

## 1. Survey

```bash
pnpm run pr-report -- --format json
```

`entries` is one object per open pull request. The scope rule is
`autoMerge === true` and a `labels` entry whose `name` is `merge-queued`;
still drop any
whose `baseRef` is not `main`. The declared order is already read for you, as
`mergeAfter` and `blockedBy` — see "The declared merge order" below.

**A `skip-ci` PR in that list is a paused one, not an excluded one.** While the
label is on, the five check workflows and the two lint jobs skip and
`skip-ci-label.yml` writes the required `no-skip-ci-label` status as `pending`,
which is the only thing holding the merge — so its checks cannot go green
however long it is watched, and `pr-report` calls the verdict `paused` rather
than pretending otherwise. Taking the label off is the action, one PR at a
time. See "CI" in `CLAUDE.md`.

`chore/pnpm-update` is opened `merge-queued` by the bot, with auto-merge, so it
is in scope — but `pnpm-update.yml` force-pushes that branch twice a week. If
it moves under you, do not fight it: re-survey and take its new state.

**`changeset-release/main` is the version PR, and it is never rebased** — see
"The release goes last" below. `release.yml` rebuilds that branch from the tip
of `main` and force-pushes it on every push to `main`, so the only thing it is
ever given is its `skip-ci`.

Two fields say what is blocking each one. `mergeStateStatus` is not among
them: it is GraphQL, which the proxy refuses, and it was an asynchronously
computed cached answer anyway.

- **`comparison.behindBy > 0`** — exactly the "out-of-date with the base
  branch" banner, counted on the spot rather than cached. This is the one the
  loop rebases.
- **`checks.verdict`** — `failing` or `pending` on an up-to-date branch is step
  3 or 4; do not rebase it, that only restarts the same matrix. `paused` is
  `skip-ci`, and taking the label off is the action. `passed` with
  `behindBy === 0` means nothing here is blocking it and auto-merge is
  landing it — leave it alone.

A conflict is the one thing neither says. GitHub's own answer to it is a test
_merge_ of the branch into `main`, which is not the same as saying a rebase
will conflict: a rebase replays commit by commit onto the tip rather than
three-way merging from a merge base. So there is nothing to read — try the
rebase (step 2b) and let it tell you. Only a rebase that actually stops on a
conflict is a conflict.

## 2. Pick exactly one, and rebase it

Only when nothing is in flight (step 1). Take whichever PR the user named;
otherwise the one the worker would take, so that both of you choose the same
one: among those with `behindBy > 0` or carrying `skip-ci`, with `blockedBy`
empty and no `unblock-prs` failure on the head that still applies, the lowest
number, the version PR last. The worker also puts last one GitHub calls
`DIRTY`, which the report does not carry; where that makes the two differ, the
lease settles it. Everything else waits, untouched. A PR sitting at `BEHIND`
costs nothing.

### 2a. The normal case

If the PR carries no `skip-ci`, the rebase is its release: pause the others
first (see "Beside the worker").

```bash
curl -sS -X PUT -w '\n%{http_code}\n' \
    -H "Authorization: Bearer $GH_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -H "User-Agent: noshiro-pf-mono" \
    -d '{"expected_head_sha": "<headSha from the survey>"}' \
    'https://api.github.com/repos/noshiro-pf/mono/pulls/<number>/update-branch'
```

This rebases server-side. It does not touch the working tree, needs no checkout,
and fails cleanly instead of leaving a half-finished rebase behind. It does not
merge anything, and it leaves auto-merge armed. A 202 means GitHub accepted the
job, not that it finished — the head moves a moment later. Confirm it did, and
that checks are queued on the new SHA, by running the report again and looking
at `headSha`, `autoMerge` and `checks`.

A 422 is either lease: the head is no longer the one named, so someone else
moved it — survey again — or GitHub cannot rebase it, which is step 2b. The
report's `headSha` says which.

If it carries `skip-ci`, take it off now, and only now: run the report again
and check that `headSha` is the rebased one, `behindBy` is 0, both labels
are still on and nothing else is released or in flight; pause the others,
then `DELETE /repos/noshiro-pf/mono/issues/<number>/labels/skip-ci`. A 404
there means someone else took it off in the meantime, which is what you were
about to do. Either way, run the report once more and settle a second release
as "Beside the worker" says before going to step 3.

If the local clone has that branch checked out, it is now stale. Only resync it
when `git status --porcelain` is empty — never discard uncommitted work:

```bash
git fetch origin <branch> && git reset --hard "origin/<branch>"
```

### 2b. When GitHub says it conflicts

`update-branch` answered an error rather than accepting the job. Rebase locally
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
fetch — the same trap `pnpm-update.yml` hit. A refused push is the branch
moving under you: survey again rather than rebasing once more. Resolve
conflicts by keeping the intent of both sides; if the resolution is not
obvious, stop and ask rather than guessing. `git rebase --abort` puts
everything back.

A conflict takes time to resolve, and another pull request may be in flight by
the time it is: then the push goes out under `skip-ci` (see "Beside the
worker"). Otherwise, if it carries `skip-ci`, take it off as in 2a.

Note that a force-push does not disarm auto-merge; if `autoMerge` did come
back false, say so and stop rather than re-enabling it.

## 3. Watch the checks

Every workflow here triggers on `push`, so the rebase started a fresh matrix; the
full set takes roughly 25 minutes. Watch it in the background:

There is no server-side wait to ask for, so poll — `pnpm run pr-report` every
60 seconds or more, in the background, until that PR's `checks.verdict` stops
being `pending`. When every required context passes, GitHub squashes and merges
the PR on its own — that is the intended ending, and nothing here should race
it.

**A short green list is not a green PR, and `pr-report` is what knows the
difference.** A required context whose workflow has not reported yet is
_absent_ from the check list rather than pending in it, so three minutes into a
twenty-five minute matrix a hand count says four of nine are green and none is
waiting. `checks.missing` is where those are, and `checks.verdict` already
counts them. Two more traps — `no-skip-ci-label` being a commit status, and a
name that reported twice resolving to the run in the greatest check suite id
rather than the newest one — are in
`.claude/skills/references/github-api.md`, "Whether a pull request is green".

`pr-report` reads the required list from `repo-settings/rulesets/main.json`,
which is the desired state and not necessarily what GitHub is enforcing: a
context added there and not yet applied with `pnpm run repo-settings:apply` is
required by nothing. When that difference matters, ask GitHub for the live
list — the same reference has the call.

A pull request whose every required context is green and which is still open is
held by something outside this skill's two jobs. Do not conclude that from a
guess: `checks.missing` empty and `checks.failed` empty is the evidence, and
until then keep waiting rather than starting on the next PR.

**`no-skip-ci-label` pending is the exception, and it never resolves itself.** It
means the `skip-ci` label went on while you were watching, which also skipped
every other check on that commit. Stop watching, go back to step 1, and treat
the PR as out of scope until the label comes off.

**A `headSha` that changes when you did not push** is the worker rebasing it
because `main` moved, or `pnpm-update.yml` rebuilding its branch. Go back to
step 1 and take the new state rather than moving it back.

Do not start the next PR while this one is being watched.

## 4. Fix a failing check

Find the failing job and read only its failing step:

`checks.failed` from the report names the contexts. They are aggregate jobs and
do not name the matrix entry that failed, so go from one to the run and from
the run to the failing job, then to its log:
`.claude/skills/references/github-api.md`, "Which job failed, and why". There
is no `--log-failed` — the whole job log comes back, so grep `ELIFECYCLE` for
the command that actually failed rather than reading the first error-shaped
line.

**The check name is the command.** `style-check (X)` and `code-check (X)` both
run `pnpm run X` at the repository root, so `code-check (check:knip)` reproduces as
`pnpm run check:knip`. Five checks do not follow that rule:

| Check                        | What to run                                                    |
| :--------------------------- | :------------------------------------------------------------- |
| `test-node-versions (<ver>)` | `pnpm run ws:build` then `pnpm run ws:check:test` on that Node |
| `verify-published`           | `pnpm run verify:npm-packages:published`                       |
| `backup-repository-settings` | `pnpm run repo-settings:backup`, then look for a dirty tree    |
| `Validate PR title`          | The PR title is not Conventional Commits — `PATCH /pulls/{n}`  |
| `Validate commit count`      | The branch is more than one commit — squash it, see below      |

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
  The worker does this itself for the pull request it is watching when every
  failed job is such an entry (its README, "4a"); a pull request in that state
  that it has not touched is one it was not watching.

Reproduce locally before pushing — a speculative fix costs another full matrix,
which is the cost this whole loop exists to avoid. Fix the cause: `CLAUDE.md`
rules hold, so no file-level `eslint-disable`, no loosening `eslint.config.mts`,
no `as any`. Then `pnpm run fmt`, amend it onto the branch's one commit, and
push with `--force-with-lease=<branch>:<the headSha you fixed>`. Re-read the
report just before the push: if another queued PR is in flight, the push goes
out under `skip-ci` (see "Beside the worker") and this PR waits its turn;
otherwise the push is its release — pause the others first, push, settle, and
go back to watching. Auto-merge survives the
push, so a green result merges the PR without another command. Do not
re-rebase for a fix unless `main` has moved.

`code-check` and `node-version-compatibility` jobs gate on
`z:check-should-run:code-checks`, and `style-check` jobs on
`z:check-should-run:style-checks`; both diff against `origin/main`. A job that
reports green having skipped its steps is expected on a docs-only branch (or,
for every workflow, an `experimental/`-only one), not a problem to chase.

## 5. It merged — then go round again

Confirm with `GET /repos/noshiro-pf/mono/pulls/<number>` — `state` and
`merged_at`. The remote branch is deleted automatically (`delete_branch_on_merge`); locally, `git fetch --prune`,
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
`main`, wait: the release run is regenerating it. Check with git, which
answers now, rather than with anything GitHub computes asynchronously and
caches:

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
lacking auto-merge — and which the worker had set aside, with its reason.
Report it as an order: which PR was released, what is
behind it, and what each one is waiting on.
