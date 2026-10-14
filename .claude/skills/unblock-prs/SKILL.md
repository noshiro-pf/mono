---
name: unblock-prs
description: Fix the pull requests `pnpm run unblock-prs` set aside — a failing check on a queued one, a rebase that conflicted on a queued or `auto-rebase` one — one at a time, claimed first and pushed under `skip-ci`, and leave every rebase, release, watch and merge to that script. Use when asked to unblock the open PRs, fix what the merge queue set aside, fix a failing check on a queued PR, or resolve a conflict the script could not; run it under `/loop` beside the script.
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

**Never**, because each is the worker's or nobody's:

- rebase a pull request that is not set aside, call `update-branch`, take
  `skip-ci` off, put `skip-ci` on any pull request but the one being pushed,
  or watch CI;
- merge, arm or disarm auto-merge, approve, or tick the "Retry" box in a
  set-aside comment;
- run `gh` (`CLAUDE.md`, "Session rules"). Everything below is
  `pnpm run pr-report`, `pnpm run claim-pr`, git, or the REST API as
  `.claude/skills/references/github-api.md` describes.

Invoking this skill is the explicit instruction `CLAUDE.md` asks for before
pushing: to the branch of a pull request this run has claimed, with
`--force-with-lease`, and to the layers stacked on it. Nothing else.

## 1. Survey

```bash
pnpm run pr-report -- --format json
```

Each entry in `entries` carries `setAside` and `claim` when the worker's
account has written them (the token has to be that account; without one both
are absent and there is nothing to do). A pull request is this skill's when:

- `setAside.applies` is true — standing, at the current head and `main`, and
  no retry asked for — and `setAside.says.setAside.reason` is
    - `checks-failed` on one labelled `merge-queued`, or
    - `rebase-failed` on one labelled `merge-queued`, or labelled
      `auto-rebase` and `skip-ci`;
- `claim.applies` is not true, unless `claim.says.claim.by` is this run's
  claimant;
- and it is none of these: `chore/pnpm-update` (`pnpm-update-ci` fixes that
  one, and `pnpm-update.yml` rebuilds it), `changeset-release/main`
  (`release.yml` rebuilds it), a draft, a fork's branch (`fromFork`), or a
  layer of a stack (`stackedOn` set — its turn comes after the layer below).

Take them `priority:high` first and `priority:low` last (both at once count
as neither), and the lowest number first within each. When there are none,
end without a report.

A pull request set aside for any other reason (`not-merging`, `arm-failed`,
`unlabel-failed`, `push-failed`, `watch-timeout`, `already-in-base`,
`awaiting-bypass`) is something to name in the report, not to fix: what holds
it is a setting, a permission or a review, and the comment says which.

## 2. Claim it

```bash
pnpm run claim-pr -- <number> --by <claimant>
```

`<claimant>` is this session's URL when you know it, otherwise one word made
up once for this run; the same one throughout. A refusal means someone else
holds it, or the worker is about to act on it: take the next one.

The claim (`apps/pr-report-core/src/claim.mts`) is what keeps the worker from
retrying the pull request while you work — it would when `main` moves or the
box is ticked — and keeps the session that opened it from fixing the same
thing. It ends by itself when the branch is pushed, or after two hours. Run
the same command again to renew it during long work, and with `--release`
when you give up without pushing.

## 3. Fix it, in a throwaway worktree

Note the pull request's `headSha`. Work in a worktree of your own, never the
checkout you were started in:

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
- `checks-failed` — reproduce the failure and fix it ("Fixing a failing
  check" below), amend it onto the branch's one commit, and run
  `pnpm run fmt`.

## 4. Push it under `skip-ci`

1. If the pull request has no `skip-ci`, put it on first
   (`POST /repos/noshiro-pf/mono/issues/<number>/labels`). One set aside
   `checks-failed` usually has it off, and a push without it would start a
   full matrix beside the one the worker is running.
2. `git push --force-with-lease="<branch>:<headSha>" origin "HEAD:<branch>"`.
3. Carry the layers stacked on it along, lowest first — the entries whose
   `stackedOn` is this pull request, then theirs: in a worktree of each,
   `git rebase --onto <new head> <its parent's old head>`, then push leased
   against its own old head. A layer that does not contain its parent's old
   head is not yours to guess at: report it.

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
fixed and pushed / left, and why), and the set-aside ones that are not this
skill's, with their reason. Do not say a pushed fix works: the worker's run
of the checks says that.

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
when the worker releases it. Fix the cause: `CLAUDE.md` rules hold, so no
file-level `eslint-disable`, no loosening `eslint.config.mts`, no `as any`.

`code-check` and `node-version-compatibility` jobs gate on
`z:check-should-run:code-checks`, and `style-check` jobs on
`z:check-should-run:style-checks`; both diff against `origin/main`. A job that
reports green having skipped its steps is expected on a docs-only branch (or,
for every workflow, an `experimental/`-only one), not a problem to chase.
