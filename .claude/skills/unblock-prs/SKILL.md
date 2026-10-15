---
name: unblock-prs
description: Fix the queued pull requests whose owner is this skill — set aside by `pnpm run unblock-prs` for a failing check or a rebase that conflicted, the dependency update (`chore/pnpm-update`) included — one at a time, claimed first and pushed with the worker's own push, and file an issue for any whose owner is nobody; leave every other rebase, release, watch and merge to that script. Use when asked to unblock the open PRs, look after the pnpm-update pull request, fix what the merge queue set aside, fix a failing check on a queued PR, or resolve a conflict the script could not; run it under `/loop` beside the script.
---

# Fix what the merge queue set aside

`pnpm run unblock-prs` — the worker — runs all the time on the author's
machine. It rebases the queued pull requests one at a time, arms their
auto-merge, takes `skip-ci` off when each one's turn comes, watches the
checks, and fixes a failure that is only a fixer's diff itself
(`tools/scripts/cmd/unblock-prs/README.md`, "4a"). When it can go no further
with one it **sets it aside** and says why in a comment on it. **This skill
fixes those pull requests and does nothing else**, so that the two never do
the same thing.

**Every queued pull request has exactly one owner**, and every tool reads it
from one function — `apps/pr-report-core/src/queue-owner.mts`, through
`tools/scripts/cmd/pr-report/queue.mts` here and through
`tools/scripts/cmd/unblock-prs/owner.mts` in the worker — so the two cannot
disagree about whose a pull request is:

| `owner`  | who moves it next                                                   |
| :------- | :------------------------------------------------------------------ |
| `worker` | the worker: in the queue, waiting its turn, or stacked              |
| `skill`  | this skill: claimed, or set aside `rebase-failed` / `checks-failed` |
| `human`  | a person: a draft, a bypass merge, a setting or permission, a cycle |
| `none`   | nobody — a bug in the queue's tooling, filed as an issue (step 1)   |

The set-aside comment is the hand-off, not the tip of `main`: it stays the
skill's until the worker rewrites it as resolved, so a stopped worker leaves
it here rather than nowhere.

**Never**, because each is the worker's or a person's:

- act on a pull request whose `owner` is not `skill`; call `update-branch`,
  take `skip-ci` off, put `skip-ci` on any pull request but the one being
  pushed, or watch CI;
- merge, arm or disarm auto-merge, approve, or tick the "Retry" box in a
  set-aside comment;
- push with `git push`: `pnpm run push-fixed-pr` is the worker's own push and
  restack (step 4);
- run `gh` (`CLAUDE.md`, "Session rules"). Everything below is
  `pnpm run pr-report`, `claim-pr`, `push-fixed-pr`, `rebuild-pnpm-update`,
  `report-unowned-prs`, git in a worktree, or the REST API as
  `.claude/skills/references/github-api.md` describes.

Invoking this skill is the explicit instruction `CLAUDE.md` asks for before
pushing: to the branch of a pull request this run has claimed, through
`push-fixed-pr`, which carries the layers stacked on it along — and, for the
dependency update, to have `pnpm-update.yml` rebuild it through
`rebuild-pnpm-update`. Nothing else.

## 1. Survey

```bash
pnpm run report-unowned-prs
pnpm run pr-report -- --format json
```

`report-unowned-prs` files an issue for each queued pull request whose owner
is `none`, once per pull request, and says which it filed or had filed
already. Name them in the report; do not fix the pull request by hand, since
what to do with it is what the issue asks.

Each entry in `entries` of the report carries `owner` when the token is the
worker's account (without one it is absent and there is nothing to do; a
missing `owner` on one entry means its comments could not be read). This
skill's pull requests are those whose `owner.owner` is `skill` — the
dependency update (`chore/pnpm-update`) as much as any other — and whose
`claim` is not someone else's
standing claim (`claim.applies` and `claim.says.claim.by` another claimant).
`setAside.says.setAside.reason` says what to do with it: `rebase-failed` or
`checks-failed`.

Take them `priority:high` first and `priority:low` last (both at once count
as neither), and the lowest number first within each. When there are none,
end without a report.

Those whose `owner.owner` is `human` are something to name in the report,
with `owner.reason`, not to fix.

## 2. Claim it

```bash
pnpm run claim-pr -- <number> --by <claimant>
```

`<claimant>` is this session's URL when you know it, otherwise one word made
up once for this run; the same one throughout. It is refused unless the
owner is a skill and no one else holds it: take the next one.

The claim (`apps/pr-report-core/src/claim.mts`) is what keeps the worker from
retrying the pull request while you work — it would when `main` moves or the
box is ticked — and keeps the session that opened it from fixing the same
thing. It ends by itself when the branch is pushed, or after two hours. Run
the same command again to renew it during long work, and with `--release`
when you give up without pushing.

## 3. Fix it, in a throwaway worktree

Work in a worktree of your own, never the checkout you were started in:

```bash
git fetch origin main <branch>
git worktree add --detach <dir> "origin/<branch>"
```

**Rebase onto `origin/main` first, whatever the reason.** The worker rebases
before it releases anyway, so the fix has to hold on the tip; and under
`skip-ci` the push costs nothing. Resolve a conflict by keeping the intent of
both sides. If the right resolution is not obvious, release the claim, report
what conflicts, and leave the pull request.

- `rebase-failed` — the rebase is the whole job. On an `auto-rebase` pull
  request that is not queued, do nothing more: its checks are not this run's
  business until someone queues it.
- `rebase-failed` on **the dependency update** (`headRef` is
  `chore/pnpm-update`) — no worktree and no rebase. The branch is generated,
  lockfile and all, so the conflict is resolved by generating it again from
  the tip: `pnpm run rebuild-pnpm-update -- <number> --by <claimant>`. It
  starts `pnpm-update.yml`, whose force-push at the end is the hand-back, as
  step 4's push is for any other; skip step 4. Refused for want of
  `actions: write`, say so, release the claim and leave it. `push-fixed-pr`
  refuses a hand resolution of it.
- `checks-failed` — reproduce the failure and fix it ("Fixing a failing
  check" below), amend it onto the branch's one commit, and run
  `pnpm run fmt`.

## 4. Push it with `push-fixed-pr`

```bash
pnpm run push-fixed-pr -- <number> --by <claimant> --head "$(git -C <dir> rev-parse HEAD)"
```

It is the worker's own code (`pushLeased` and `restack` in
`tools/scripts/cmd/unblock-prs/rebase.mts`): it refuses unless the owner is a
skill and the claim is yours, puts `skip-ci` on first when it is off, pushes
leased against the claimed head, and carries the layers stacked on it along,
lowest first, logging any it cannot move.

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

`/loop /unblock-prs`, with no interval: each round surveys, fixes what there
is, and waits 20–30 minutes when there is nothing. Nothing needs to be
watched in between — a pull request set aside meanwhile waits for the next
round, and the worker carries on without it.

## Fixing a failing check

What is left by the time the worker sets a pull request aside `checks-failed`
is a real failure, or a fixer that did not settle it: when every failed job
was a `fix:` / `gen:` matrix entry it already ran those and pushed what they
wrote.

Find the failing job and read only its failing step. `checks.failed` from the
report names the contexts — so does the set-aside comment, with a link to each
run. They are aggregate jobs and do not name the matrix entry that failed, so
go from one to the run and from the run to the failing job, then to its log:
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
Squash with `git reset --soft "$(git merge-base HEAD origin/main)" && git commit`
in the worktree. If the message is not obvious from the PR title and body,
stop and ask.

Two things about reproducing the rest:

- `code-check (*)`, `style-check (ws:doc)`, `style-check (ws:check:ext)` and
  `style-check (ws:gen)` run `pnpm run ws:build` first in CI. Do the same
  locally or they fail for the wrong reason.
- Every job ends with `z:assert-repo-is-clean`. So `fix:fmt:full`, `ws:doc`,
  `fix:codemod:full`, `ws:fix:lint` and `ws:gen` fail by _changing_
  files, and the fix is to run the command locally and commit what it wrote. A
  green run of the command with a dirty tree afterwards is still a failure.

Reproduce locally before pushing — a speculative fix costs another full matrix
when the worker releases it.

**First ask whether the branch is broken at all.** A required context can be
red with nothing wrong in it: the run the `opened` event starts is cancelled by
a later one, and GitHub sometimes answers the context with the cancelled run.
When the newest run of the failing context is green and only an older suite is
red, re-run that suite (`.claude/skills/references/github-api.md`, "A stale red
that is holding the merge") instead of pushing anything; without
`actions: write`, say so and leave it. Fix the cause: `CLAUDE.md` rules hold, so no
file-level `eslint-disable`, no loosening `eslint.config.mts`, no `as any`.

**Leave a decision to a person.** A failure whose fix is a choice — a
dependency's breaking change that wants a design call, a test whose expected
value could reasonably go either way — is not this skill's. Leave one comment
on the pull request, in Japanese, saying what is broken and what the choice
is, release the claim, and name it in the report. **`check:root:licenses`
failing is always one of these**, usually on the dependency update: an update
brought in a license `tools/configs/license-policy.mts` does not let through.
An exception added to turn it green is the check switched off; say which
package, which version, and from which license to which.

On the dependency update, a fix lasts only until `pnpm-update.yml` next
rebuilds the branch from `main`, and goes with the update when it merges, so
code adapting to a new version of a dependency is still made there, on the
branch.

`code-check` and `node-version-compatibility` jobs gate on
`z:check-should-run:code-checks`, and `style-check` jobs on
`z:check-should-run:style-checks`; both diff against `origin/main`. A job that
reports green having skipped its steps is expected on a docs-only branch (or,
for every workflow, an `experimental/`-only one), not a problem to chase.
