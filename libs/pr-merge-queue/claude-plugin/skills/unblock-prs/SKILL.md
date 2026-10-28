---
name: unblock-prs
description: Fix the queued pull requests whose owner is this skill — set aside by the `unblock-prs` worker for a failing check or a rebase that conflicted — one at a time, claimed first and pushed with the worker's own push, and file an issue for any whose owner is nobody; leave every other rebase, release, watch and merge to the worker. Use when asked to unblock the open PRs, fix what the merge queue set aside, fix a failing check on a queued PR, or resolve a conflict the worker could not; run it under `/loop` beside the worker.
---

# Fix what the merge queue set aside

`unblock-prs` — the worker, from the npm package `pr-merge-queue` — runs all
the time on the author's machine. It rebases the queued pull requests one at a
time, arms their auto-merge, takes `skip-ci` off when each one's turn comes,
watches the checks, and fixes a failure that is only a fixer's diff itself
(the package's `src/unblock-prs/README.md`, "4a. Fix a failure that is only a
fixer's diff"). When it can go no further with one it **sets it aside** and
says why in a comment on it. **This skill fixes those pull requests and does
nothing else**, so that the two never do the same thing.

## Before anything: the repository's own rules

Read the repository's instructions first — `CLAUDE.md`, `AGENTS.md`, a
contributing guide — and, if it exists, **`.github/unblock-prs.md`**, the
repository's guide for this skill: how its checks are reproduced, which
branches it generates rather than writes, and what a fix may not do there.
Where they say more than this file, they win; this file says what holds in
every repository the worker runs in.

**The commands** below — `pr-report`, `claim-pr`, `push-fixed-pr`,
`report-unowned-prs` — are the package's. Run each the way the repository
runs it: a script of its own when it has one (`pnpm run claim-pr -- …`),
otherwise through the package manager (`npx claim-pr …`). All of them
authenticate with `GH_TOKEN` or `GITHUB_TOKEN`; each prints its options with
`--help`.

## Who owns a pull request

**Every queued pull request has exactly one owner**, and every tool reads it
from one function — `queueOwner` in `pr-report-core`, the package the worker
and `pr-report` both build on — so the two cannot disagree about whose a pull
request is:

| `owner`  | who moves it next                                                   |
| :------- | :------------------------------------------------------------------ |
| `worker` | the worker: in the queue, waiting its turn, or stacked              |
| `skill`  | this skill: claimed, or set aside `rebase-failed` / `checks-failed` |
| `human`  | a person: a draft, a bypass merge, a setting or permission, a cycle |
| `none`   | nobody — a bug in the queue's tooling, filed as an issue (step 1)   |

The set-aside comment is the hand-off, not the tip of the default branch: it
stays the skill's until the worker rewrites it as resolved, so a stopped
worker leaves it here rather than nowhere.

**Never**, because each is the worker's or a person's:

- act on a pull request whose `owner` is not `skill`; call `update-branch`,
  take `skip-ci` off, put `skip-ci` on any pull request but the one being
  pushed, or watch CI;
- merge, arm or disarm auto-merge, approve, or tick the "Retry" box in a
  set-aside comment;
- push with `git push`: `push-fixed-pr` is the worker's own push and restack
  (step 4);
- reach GitHub any way but the commands, git in a worktree, and the REST API
  as [references/github-api.md](references/github-api.md) describes. The
  `gh` CLI acts as whoever logged it in, which is not the token the worker's
  claims and comments are read as.

Invoking this skill is the instruction to push: to the branch of a pull
request this run has claimed, through `push-fixed-pr`, which carries the
layers stacked on it along — and, for a branch the repository generates, to
have it generated again the way its guide says. Nothing else.

## 1. Survey

```bash
report-unowned-prs
pr-report --format json
```

`report-unowned-prs` files an issue for each queued pull request whose owner
is `none`, once per pull request, and says which it filed or had filed
already. Name them in the report; do not fix the pull request by hand, since
what to do with it is what the issue asks.

Each entry in `entries` of the report carries `owner` when the token is the
worker's account (without one it is absent and there is nothing to do; a
missing `owner` on one entry means its comments could not be read). This
skill's pull requests are those whose `owner.owner` is `skill` — a branch
the repository generates as much as any other — and whose
`claim` is not someone else's standing claim (`claim.applies` and
`claim.says.claim.by` another claimant). `setAside.says.setAside.reason` says
what to do with it: `rebase-failed` or `checks-failed`.

Take them `priority:high` first and `priority:low` last (both at once count
as neither), and the lowest number first within each. When there are none,
end without a report.

Those whose `owner.owner` is `human` are something to name in the report,
with `owner.reason`, not to fix.

## 2. Claim it

```bash
claim-pr <number> --by <claimant>
```

`<claimant>` is this session's URL when you know it, otherwise one word made
up once for this run; the same one throughout. It is refused unless the
owner is a skill and no one else holds it: take the next one.

The claim is what keeps the worker from retrying the pull request while you
work — it would when the default branch moves or the box is ticked — and
keeps the session that opened it from fixing the same thing. It ends by
itself when the branch is pushed, or after two hours. Run the same command
again to renew it during long work, and with `--release` when you give up
without pushing.

## 3. Fix it, in a throwaway worktree

Work in a worktree of your own, never the checkout you were started in
(`<base>` is the default branch):

```bash
git fetch origin <base> <branch>
git worktree add --detach <dir> "origin/<branch>"
```

**Rebase onto `origin/<base>` first, whatever the reason.** The worker
rebases before it releases anyway, so the fix has to hold on the tip; and
under `skip-ci` the push costs nothing. Resolve a conflict by keeping the
intent of both sides. If the right resolution is not obvious, release the
claim, report what conflicts, and leave the pull request.

- `rebase-failed` — the rebase is the whole job. On an `auto-rebase` pull
  request that is not queued, do nothing more: its checks are not this run's
  business until someone queues it.
- `rebase-failed` on **a branch the repository generates** — one listed
  under `generatedBranches` in `.github/unblock-prs.json` — no worktree and
  no rebase. The branch is generated, lockfile and all, so the conflict is
  resolved by generating it again from the tip: run its `rebuild`, and what
  the guide adds about it; its push is the hand-back, as step 4's is for any
  other, so skip step 4. `push-fixed-pr` refuses a hand resolution of such a
  branch.
- `checks-failed` — reproduce the failure and fix it ("Fixing a failing
  check" below), commit it the way the repository's instructions say (an
  amend onto the branch's one commit, where they ask for one commit per pull
  request), and run its formatter.

## 4. Push it with `push-fixed-pr`

```bash
push-fixed-pr <number> --by <claimant> --head "$(git -C <dir> rev-parse HEAD)"
```

It is the worker's own code: it refuses unless the owner is a skill and the
claim is yours, puts `skip-ci` on first when it is off, pushes leased against
the claimed head, and carries the layers stacked on it along, lowest first,
logging any it cannot move.

**A refused push** means someone moved the branch. Release the claim, throw
the work away, and survey again; do not push again against a fresh lease.

That push is the hand-back. The head moved, so the claim has ended and the
worker rewrites its set-aside comment as resolved; from then on the pull
request is the worker's — rebased, armed and released in its turn, or kept on
the tip if it is only `auto-rebase`. If its checks fail again, it is set aside
again and comes back here.

## 5. Go round, and report

Remove the worktree, and go back to step 1 for the next one. At the end, one
line per pull request: what was done (conflict resolved and pushed / failure
fixed and pushed / left, and why), the `human` ones with their reason, and
the issues `report-unowned-prs` filed or found. Do not say a pushed fix
works: the worker's run of the checks says that.

## Running it all the time

Under `/loop` with no interval: each round surveys, fixes what there is, and
waits 20–30 minutes when there is nothing. Nothing needs to be watched in
between — a pull request set aside meanwhile waits for the next round, and
the worker carries on without it.

## Fixing a failing check

What is left by the time the worker sets a pull request aside `checks-failed`
is a real failure, or a fixer that did not settle it: when every failed job
was one the repository's `.github/unblock-prs.json` names a fixer for, the
worker already ran those and pushed what they wrote.

Find the failing job and read only its failing step. `checks.failed` from the
report names the contexts — so does the set-aside comment, with a link to each
run. An aggregate job does not name the matrix entry that failed, so go from
it to the run and from the run to the failing job, then to its log:
[references/github-api.md](references/github-api.md), "Which job failed, and
why". There is no `--log-failed` — the whole job log comes back, so grep for
the command that actually failed rather than reading the first error-shaped
line.

**How a check reproduces locally is the repository's**: its guide says which
command each check runs and what has to run first. Reproduce locally before
pushing — a speculative fix costs another full run of the checks when the
worker releases it. A job that ends by asserting a clean working tree fails a
generator or a formatter by _changing_ files, and the fix is to run the
command and commit what it wrote; a green run of the command with a dirty
tree afterwards is still a failure.

**First ask whether the branch is broken at all.** A required context can be
red with nothing wrong in it: the run the `opened` event starts is cancelled by
a later one, and GitHub sometimes answers the context with the cancelled run.
When the newest run of the failing context is green and only an older suite is
red, re-run that suite ([references/github-api.md](references/github-api.md),
"A stale red that is holding the merge") instead of pushing anything; without
`actions: write`, say so and leave it. Fix the cause, not the check: no
turning a lint rule off for the file, no loosening the lint configuration, no
cast that silences the type checker.

**Leave a decision to a person.** A failure whose fix is a choice — a
dependency's breaking change that wants a design call, a test whose expected
value could reasonably go either way, a license policy an update no longer
meets — is not this skill's. Leave one comment on the pull request saying
what is broken and what the choice is, release the claim, and name it in the
report.

On the dependency update, a fix lasts only until the branch is next generated
from the default branch, and goes with the update when it merges, so code
adapting to a new version of a dependency is still made there, on the branch.
