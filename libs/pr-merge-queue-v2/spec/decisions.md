<!-- cspell:ignore unlabel -->

# Decisions

Every decision below is a pure function in `pr-report-core-v2` over facts in the
`Snapshot`. The page, `pr-report`, the other commands and the worker call the
same functions, so they cannot disagree. Where v1's rule had a reason that cost
an incident, the issue is cited.

## Required contexts

What GitHub enforces on the default branch, not what `repo-settings/` declares:

- every rule of every ruleset that applies to the branch
  (`GET /repos/{o}/{r}/rules/branches/{branch}`), **paged to the end**
  (**Changed in v2**, #3217: v1 read one page of 100);
- the contexts of a classic protection rule (`GET /repos/{o}/{r}/branches/{b}`),
  unless the protection is disabled or its `enforcement_level` is `off`.

From the rules:

- `requiredContexts`: the union of every `required_status_checks` rule's
  contexts.
- `requireCodeOwnerReview`: any `pull_request` rule with
  `require_code_owner_review`.
- `requireConversationResolution`: any `pull_request` rule with
  `required_review_thread_resolution`.

A rule of another type, or of an unexpected shape, adds nothing. Either request
failing fails the read: half a list read as the whole is the failure mode.

`pr-report` on the checkout's own repository reads
`repo-settings/rulesets/main.json` instead (the desired state), unless `--repo`
names another.

## Check verdicts

### What one context reported

From the head commit's check runs and commit statuses:

1. **Of several runs of one name, the one in the check suite with the greatest
   id wins; within one suite, the greatest run id** (`outranks`). Not the latest
   started or finished: GitHub resolves a context this way, and a cancelled
   suite created a second later holds the merge with its stale red.
2. A run classifies as `pending` unless `completed`; then `skipped` for
   `skipped`, `passed` for `success` / `neutral`, `failed` for anything else
   (`cancelled`, `stale`, `timed_out`, `action_required`, `startup_failure`).
   **Changed in v2**: the worker classifies as the page does. v1's worker read
   `neutral` as skipped (met all the same), `stale` as still pending (waiting to
   the watch timeout) and `cancelled` apart; v2 sets a `stale` or `cancelled`
   required check aside as `checks-failed` at once, as the page already shows it
   red.
3. **A run whose workflow has a newer round still going is `pending`** (#2191):
   rounds are the workflow runs on the commit by check suite; the newest round
   of a workflow by suite id, if not completed and not this run's suite, makes
   this run `pending`. A round held by a concurrency group has no check run yet,
   so rounds are read from the workflow runs themselves (#3703).
4. **A red of an earlier attempt of its own round is `pending`**
   (`isOfEarlierAttempt`, #3474): the round is not completed, its
   `run_started_at` (REST only; a re-run sets it anew) is after the run's
   `completedAt`, and now is within 40 minutes (`RE_RUN_GRACE_MS`) of that
   start. Only a red: the green of the attempt before stands.
5. A commit status classifies `success` → `passed`, `pending` and `expected`
   (GraphQL's, for one not reported yet) → `pending`, anything else → `failed`.
   **Changed in v2**: v1 read `expected` as `failed`, which only a reader of
   GraphQL's rollup ever saw.
6. **A check run and a commit status of one name: the stricter wins**
   (`failed` > `pending` > `skipped` > `passed`): GitHub requires both.

`running` is true when the counting run of any name on the head (the one
GitHub answers with, above; every run is read, superseded ones included) has not
completed, or the newest round of any workflow (by suite) has not, required or
not (**Changed in v2**: an older round GitHub never closed, as a superseded run,
holds nothing): an aggregate has no run in a new round until the jobs before it
finish, so "every required context reported" is true halfway through a round,
from the round before (#2031). A commit status pending since long ago is not a
round start.

### The verdict

Over the required contexts only:

| verdict   | when                                                                   |
| :-------- | :--------------------------------------------------------------------- |
| `paused`  | `skip-ci` is on (what shows is from before the label; listed as stale) |
| `failing` | a required context `failed`                                            |
| `pending` | `running`, or one `pending`, or one `missing`                          |
| `passed`  | otherwise (`skipped` counts as met, and is reported as `skipped`)      |

Each required context is in exactly one of `passed`, `failed`, `pending`,
`skipped`, `missing` (nothing reported) and `notRun`. **`notRun`**: on a pull
request whose base the rules do not cover (a stacked one), a context nothing
reported is not awaited — some workflows run only into `main` — once at least
one required context has reported.

## The merge graph

From every open pull request:

- **Stack parents**: a pull request whose base is the head branch of exactly one
  other open, non-fork pull request is stacked on it.
- **Dependencies** of each pull request, in this order, each once:
    1. its stack parent;
    2. its body's `Merge-After:` — except the version pull request's, which
       declares nothing;
    3. **inherited** from the issues it closes: for each such issue's
       `Start-After:` (and "blocked by"), an open pull request named is waited
       for, and an open issue named stands for the open pull requests closing
       it.
       Never itself. Not transitive. The version pull request inherits nothing.
       An open issue named that no open pull request closes holds nothing and is
       reported as `notStarted`.
- **Cycles** over the dependencies: each reported as the shortest cycle through
  the first uncovered member, rotated to start at its lowest number; every
  member of any cycle appears in at least one. A self-reference is a cycle of
  one.
- **Release blockers**: the open pull requests labelled `blocks-release`, drafts
  included.
- **The forest** for display: roots are the pull requests with no open
  dependency; a pull request with several predecessors is drawn under each,
  expanded under the first only (`repeated`). Cycle members are not drawn.

## Set-aside reasons

| reason               | owner while it stands | cleared by a push | cleared when `main` moves |
| :------------------- | :-------------------- | :---------------: | :-----------------------: |
| `rebase-failed`      | skill                 |         ✓         | once the conflict is gone |
| `checks-failed`      | skill                 |         ✓         |             ✗             |
| `awaiting-bypass`    | human                 |         ✓         |             ✗             |
| `head-out-of-sync`   | human                 |         ✓         |             ✗             |
| `already-in-base`    | human                 |         ✓         |             ✓             |
| `arm-failed`         | human                 |         ✓         |             ✓             |
| `checks-not-started` | human                 |         ✓         |             ✓             |
| `not-merging`        | human                 |         ✓         |             ✓             |
| `push-failed`        | human                 |         ✓         |             ✓             |
| `read-failed`        | human                 |         ✓         |             ✓             |
| `unlabel-failed`     | human                 |         ✓         |             ✓             |
| `watch-timeout`      | human                 |         ✓         |             ✓             |

`setAsideApplies(record, head, baseTip)`: the head is the record's, and either
the reason is one `main` moving does not clear or the base is the record's. A
ticked retry box ends it too. It is the worker's rule for settling a comment,
not the owner's: a `rebase-failed` whose base moved stands until the worker has
replayed it (`git merge-tree`) and either moved its recorded base or resolved
it, and the owner (below) reads the comment, never the tip, so it stays the
skill's meanwhile.

## Queue owner

Every pull request in the queue — `merge-queued`, or `auto-rebase` with
`skip-ci` — has exactly one owner. Decided from the pull request and this
account's comments only, never from the tip of the base (#2267). The first that
applies:

1. a claim that holds at the head → `skill` ("claimed by … at …");
2. a draft, a fork's branch, a member of a cycle, or a base that is neither the
   default branch nor a stack parent → `human`, saying which;
3. stacked → `worker` (carried along);
4. no set-aside standing at the head (or retry ticked) → `worker`;
5. a reason not in the table above → `none` (a bug in the tooling);
6. a `human` reason → `human`, with the reason's sentence;
7. a `skill` reason → `skill`, except on the version pull request, or a
   `checks-failed` no longer `merge-queued`, which go to `human`.

## Review holds

Two things no check reports, read for a pull request about to be picked or
watched while GitHub still calls it `BLOCKED`:

- **Code-owner approval.** Owners of a path are those of the **last**
  `CODEOWNERS` pattern matching it (GitHub's `.gitignore` subset: leading or
  middle `/` anchors, trailing `/` is a directory, `*` and `?` within a segment,
  `**` across). Every changed path with owners needs an approval from one of
  them (latest review per login, compared case-insensitively).
    - What enforces it, the **gate**: the ruleset's `require_code_owner_review`;
      else a required context named on a `# enforced-by: <context>` comment line
      in the file's head (before its first rule); else nothing.
    - Under a `check` gate, the author counts as approving a path they own —
      only where everyone who pushed to the branch owns it too (pushers read
      from the repository activity of the branch, chained `before` → `after` to
      the head; `unknown` on any gap). Where unknown pushers decide whether
      anything waits, nothing holds, as for any unknown, and as v1's worker,
      which read no pushers, did.
    - A team owner cannot be resolved without `read:org`: a team-owned path
      waits while nobody approved and is otherwise `unknown`.
    - Changed files past what was read, or a rename or copy whose old path the
      reader was not told (GraphQL names only the new path), make the answer
      `unknown` unless a path is plainly waiting.
- **Unresolved conversations**, any, where the rules require resolution. REST
  cannot tell a resolved thread from an open one, so a REST reader reports
  `unknown`, which holds nothing, as in v1; only GraphQL readers (the worker,
  the page) hold for a conversation.

The **hold**:

- `held` — waiting for an approval or a resolved conversation; the reason names
  the owners and up to two paths (`… and N more`), adds "which the author owns,
  and may not approve" when so.
- `bypass` — every waiting owner is the author and no conversation is open:
  nobody can approve, so only a ruleset bypass merges it. The reason text
  (`@x is the only owner of <paths> and its author, who may not approve it`) is
  exported for the page and the worker alike (#2757).
- none — nothing holds it, or it cannot be told (`unknown` holds nothing; the
  watch still catches a green pull request that does not merge).

## Queue standing

Where one pull request stands for the worker, the first that applies:

| standing          | when                                                                                               |
| :---------------- | :------------------------------------------------------------------------------------------------- |
| `ignore`          | not `merge-queued` (silently)                                                                      |
| `unactionable`    | queued, but a draft, a base nothing lands on, or a branch name the worker will not pass to a shell |
| `owned`           | its owner is not `worker`                                                                          |
| `stacked`         | on another open pull request                                                                       |
| `native-stack`    | not armed, and in one of GitHub's native stacks (merged by hand)                                   |
| `release-blocked` | the version pull request, while a `blocks-release` pull request other than itself is open          |
| `release-stale`   | the version pull request, built before the tip of the base                                         |
| `in-flight`       | `skip-ci` off, and `CLEAN` / `UNSTABLE` / `HAS_HOOKS` or `BLOCKED` with no check failed            |
| `waiting`         | otherwise `skip-ci` on or `BEHIND` / `DIRTY`, and a dependency is still open                       |
| `candidate`       | otherwise `skip-ci` on or `BEHIND` / `DIRTY`                                                       |
| `failing`         | `BLOCKED` with a required check failed                                                             |
| `merge-state`     | any other merge state                                                                              |

Released is `skip-ci` off, armed or not: a pull request released by hand, or
whose auto-merge a person switched off, is in flight, so the worker never
releases a second beside it; the In-flight rules (`worker.md`) put `skip-ci`
back on one that lost its auto-merge. A dependency is consulted only where it
would be picked, as in v1: one already released and in flight stays so.

Then the review: a `candidate`, or an `in-flight` that GitHub does not call
mergeable, whose hold is `held` becomes **`held`**. A `bypass` changes the
standing in nothing; the worker reads it to leave the pull request unarmed.

A standing that turns on a part that could not be read is **`unread`**, with
why, and nothing acts on it: the owner of a queued pull request, the native
stack of one not armed, the checks of one `BLOCKED`, the review a `candidate`
asks, and, for a `candidate` other than the version pull request (which inherits
nothing), what it inherits: its closing issues, the bodies and "blocked by" of
the issues it closes, and — when one of those names an open issue, or a number
that may be one because the issue lists were not read — the closing issues of
every open pull request, which say who stands for that issue. Picked without
them, it could merge before what an issue it closes waits for. **Changed in
v2**: v1 read an unread inheritance as none. A released pull request whose
review is unread stays `in-flight`, so that nothing is released beside it.

The version pull request is judged by its own rule after `release-blocked` and
`release-stale`: `candidate` if `skip-ci` is on, else by its checks.
`mergeStateStatus` does not decide whether it was rebuilt on the tip: the merge
base of its head and the base's tip does.

## Candidate order

Lowest number first, then these stable sorts, the last outermost:

1. `DIRTY` after the rest, the version pull request after that;
2. `priority:high` first, `priority:low` last — and a pull request only a bypass
   merges ranks as `priority:low` unless it carries `priority:high` alone;
3. one the worker saw green and not merging (demoted) after everything.

When queue layers are kept ahead (`worker.md` "Checking ahead"), the layered
pull requests come first in the order they were stacked, then the rest in this
order.

## Issue start states

For each open issue: what it waits for is its `Start-After:` plus "blocked by",
each once. Each named number's status: an open issue in the list is `waiting`;
otherwise from GitHub — open → `waiting`, a merged pull request or an issue
closed as completed (or with no reason) → `done`, closed otherwise →
`abandoned`, unreadable → `unknown`.

| state       | when (the first that applies)                    |
| :---------- | :----------------------------------------------- |
| `cycle`     | on a `Start-After` cycle among the listed issues |
| `blocked`   | something named is `waiting`                     |
| `attention` | something named is `abandoned` or `unknown`      |
| `ready`     | it names something, all `done`                   |
| `free`      | it names nothing                                 |

A `ready` or `free` issue shows its **progress** instead: `in-progress` when an
open pull request closes it or it is labelled `in-progress` (labels compared
case-insensitively), `planned` when labelled `planned`. **With v2, a claim that
holds counts as the label does** (#3233): a live `started` claim with no label
is `in-progress`, a live `planned` one is `planned`.

## Issue tiers

One `priority:<tier>` label per issue: `S`, `A`, `B`, `C`, `D`, `hold`,
`close`. Two or more is `several`. The order sessions start them in is `S`, `A`,
`B`, `C`, none, `D`; `hold` and `close` are not started.

## Startable issues

What `startable-issues` lists and `run-issue-resolver` hands out. An open issue
is startable when its start state is `ready` or `free` (so no live claim, no
`in-progress` or `planned` label and no open pull request closing it), and then
it is sorted into one of four:

- **foreign**: not written by one of the authors asked for (logins compared
  case-insensitively); a session acts on what the issue says with no person in
  between;
- **held**: labelled `duplicate`, `invalid`, `question`, `wontfix`, `pending`,
  `priority:hold` or `priority:close`;
- **left**: a `run-issue-resolver` session ended on it with no pull request, and
  its `updatedAt` is still what the record says (a record with no instant holds
  it until removed);
- **fresh**: the rest, by tier (above), then the lowest number.

## Issue themes

Which part of the repository an issue is about, so that one session takes
related issues together and two sessions keep apart. Two pull requests from
different sessions that conflict mostly change the same package, and their
titles name the same scope only about half the time; so a theme is read from the
title's scope and from the packages the body names by path, together.

- **Its themes**, sorted: the title's scope (`<scope>: …`, `type(<scope>): …`
  with a Conventional Commits type or `ci`, `[<scope>] …`; a comma separates
  several), plus `ci` for a `ci` type, plus every `libs/<x>`, `apps/<x>` and
  `languages/<x>/` the body names (a file directly under `libs/` or `apps/` is
  not a package), plus `strict-lib` and `repo-settings` for paths under them.
  A lower-case one-word head that is no type (`bug: …`, also `tools: …` and
  `synstate: …`) names no theme; any other head of name characters (`\w`, `@`,
  `.`, `/`, `:`, `-`) is a scope. `tools`, `tools/…` and `check:…` scopes are
  one theme, `tooling`. This grammar is v1's, quirks included; refining it moves
  some issue's themes for another, a decision of its own.
  Lower case; a leading `libs/` or `apps/` is dropped. Neither `ci` nor
  `tooling` is read from a path: nearly every issue cites a guard or a workflow.
- **Its primary themes**: the title's scopes, plus the package a body path lives
  in when a segment of the path's rest (extension dropped) is one of those
  scopes (`unblock-prs:` with `libs/pr-merge-queue/src/unblock-prs/…` gives
  `pr-merge-queue` too); with no scope in the title, all its themes. What a
  started issue holds back is these: a body names in passing the packages it
  reads, and holding all of them would leave half the issues to nobody.
- **A theme named** (`--theme`) takes itself and its family: `synstate` takes
  `synstate-dom`, not `eslint-plugin-synstate`.
- **Held themes**: the primary themes of each `in-progress` issue someone other
  than the asker is on: one whose live claim names another claimant, one with no
  claim, or one whose comments are unread (with a note: holding a theme back by
  mistake costs less than two sessions on one). With no asker, every
  `in-progress` issue holds its themes.
- **Order, no theme named**: every fresh `S` first, whatever its themes. Of the
  rest, one with a primary theme that is held is held back, named with the
  themes that hold it. The others go theme by theme: the first left is a seed,
  followed by every one with a theme among the seed's primary themes (a `D` only
  after a `D` seed), then the next seed.
- **Order, a theme named**: the fresh issues in that theme alone, in tier order,
  so its own `S` come first and another theme's `S` do not; nothing is held
  back, since the person chose the theme, but the issues another session started
  in it are named.
- **Starting together** (`run-issue-resolver`): an `S` always; any other only
  when none of its primary themes is one of those already started in the same
  pick, and none is held.
