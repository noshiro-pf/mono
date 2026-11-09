<!-- cspell:ignore unlabel -->

# `unblock-prs` — the worker

Takes the `merge-queued` pull requests forward **one at a time**, in the order
they declare, until stopped. Merging one moves `main` and puts every other
branch behind, so releasing two at once runs a matrix that is thrown away.

**It never** merges (auto-merge does), adds `merge-queued`, approves a review,
or fixes a failing check — except a failure that is only a configured fixer's
diff ("Auto-fix") and a conflict only in generated files ("Regenerate"). It
works in throwaway worktrees under `~/.local/state/unblock-prs/`; the checkout
it runs from is never touched.

## Invariants

- **At most one released pull request at a time.** _Released_ is `merge-queued`
  without `skip-ci`. The worker releases one only when none is in flight, and
  puts `skip-ci` on a pull request only to (a) give back the label it has just
  taken off, when another released in the same moment comes first in the release
  order, or (b) take it off again at once from a released one GitHub started no
  check workflow for (a label event). It pauses nothing a person or a bot
  released.
- **Only the worker arms auto-merge**, and only on a `merge-queued` pull request
  onto the default branch, when it picks it. `merge-queued` is the only
  permission it reads; one that lost its auto-merge is armed again when picked.
  A stacked pull request is never armed; nor one only a bypass merges.
- **The version pull request is never rebased**; taking `skip-ci` off is all it
  gets.
- **A fork's branch is never pushed to.**
- **Every push is leased** (`--force-with-lease=<branch>:<head the snapshot
saw>`), so another writer's push is never overwritten.

## The cycle

```text
read snapshot → settle comments → plan → execute one step → remember → (read again | sleep)
```

### 1. Read

The snapshot (`decisions.md` gives what each fact feeds):

- every open pull request: number, title, body, author, draft, labels,
  auto-merge, head and base branch and SHA, fork, merge state, changed files
  (and whether complete), latest review per login, unresolved conversations,
  this account's comments (set-aside and claim records), closing issues;
- the issues they close, and those issues' `Start-After:` and "blocked by";
- the tip of the default branch, by its full ref name `refs/heads/main`
  (`git ls-remote origin main` matches the tail and lists
  `changeset-release/main` first);
- the branch rules and `CODEOWNERS`;
- for every open pull request: its checks and the rounds they belong to, its
  native stack, its comparison with its base, and its timeline's base changes;
  the annotation titles of each check run that completed without passing;
- the `queue/*` layer branches and their commits, where checking ahead is on.
- the branch tips (`git ls-remote --heads origin`);
- the pull requests memory follows that are no longer open (the one in flight,
  the ones acted on last cycle): merged or closed.

**`UNKNOWN` merge state.** While an armed pull request reads `UNKNOWN`, the list
is read again, up to 6 times 10 seconds apart. A pull request whose branch tip
(one `git ls-remote --heads origin`) is not the head GitHub shows, where the
previous snapshot saw the same mismatch, is not waited on: GitHub dropped the
push ("Conditions").

A part that fails to be read is handed to the plan as unread, which says what
each decision does without it ("Conditions" counts the ones that matter). An
unread list of open pull requests plans nothing, and a tip of the default branch
that cannot be read leaves no snapshot at all: either way the cycle logs it and
sleeps.

### 2. Settle comments

For each pull request with a set-aside comment of this account (`settleSkips`):

- a record that no longer applies (`setAsideApplies` false) is rewritten as
  resolved — except a `rebase-failed` whose base moved but which still conflicts
  by `git merge-tree` replay of its own commits onto the new tip:
  then only its recorded base is moved, and it stays the skill's;
- a ticked retry box is rewritten as resolved, and the pull request is treated
  as never set aside this cycle;
- a set-aside the worker decided but whose comment write failed is written again
  (`unannouncedSkips`): otherwise the worker holds it while the skill reads it
  as the worker's.

Claims that hold keep their pull request out of every action.

### 3. Restack layers GitHub moved

For each open pull request onto `main`, not `merge-queued`, that GitHub moved
off a merged pull request's branch (its `mergedParent`, read from the timeline's
`baseChanges` as every part is, so a restart loses nothing): if it still
contains the head its parent merged at, rebase it `--onto` the parent's squash
commit from that head, push leased, and carry along the layers above it. One no
longer containing that head is passed over silently; one that cannot be
restacked (conflict, fork) is logged and left. A restack changes no tree, so it
costs no CI. Labels and auto-merge are left alone.

GitHub's native stacks are not landed: a pull request in one is a `note`, to be
merged by hand.

### 4. Plan

`planCycle(snapshot, memory, config, now)` decides each pull request's standing
(`decisions.md`) and the cycle's one step, the first that applies:

1. **Something is in flight → watch it** ("In flight" below). It is not armed
   here: the worker arms only what it picks, and auto-merge switched off on a
   pull request in flight puts `skip-ci` back on it, so it is picked again
   rather than left released and unwatched. Nothing else is rebased or released.
2. **A candidate → pick the first** in the release order and take its next step
   ("Picking").
3. **Nothing to pick → keep waiting pull requests on the tip** ("Keeping on the
   tip").
4. **Nothing at all → sleep.**

Before step 1, checking ahead may build or dispatch layers ("Checking ahead").

The plan also yields the report the worker logs: every queued pull request's
standing with its reason (`note`s for the unactionable, waiting, held, owned,
release-blocked, cycles named), and the release blockers by number on every
cycle.

### 5. Execute one step

A step that changes a pull request's branch, labels or auto-merge ends the
cycle, and the next cycle reads again at once. This is what makes each decision
one about the state it acts on. Three things do not end it, because they change
nothing a later decision this cycle reads:

- writing comments (settling records in step 2, announcing a set-aside);
- a set-aside for the pull request's own failure while picking (below): the next
  candidate is decided on the same snapshot, which says nothing of it that has
  changed;
- restacking the layers GitHub moved (step 3), a batch of pushes to branches no
  decision this cycle reads; once any moved, the cycle reads again before
  planning.

## Picking

A candidate goes through these steps, **one per cycle**, each re-deciding from a
fresh snapshot:

1. **Rebase** — unless it is the version pull request, or its head already
   contains the tip: in a worktree, `git rebase origin/main` (`--onto` the
   squash commit from the head the merged parent merged at, for a pull request
   moved off a stack that still contains it); push leased. Then carry along the
   layers stacked on it, lowest first, each `rebase --onto <new> <old>` and
   pushed; a layer that cannot move is logged and left.
2. **Arm** — on a `merge-queued` pull request onto `main` that is not armed,
   whose review at **this head** holds nothing and which is not bypass-only:
   re-read that it is still open, onto `main`, at the pushed head and queued,
   and arm it. Before `skip-ci` comes off, so the label holds the merge.
3. **Release** — take `skip-ci` off, after re-reading that it is open, at the
   pushed head and still labelled. This fires `unlabeled` and runs the matrix
   once, on the head that will merge.
4. **Yield** — on the cycle after a release, before anything is watched: when
   the snapshot shows the pull request the worker released last cycle and
   another the worker owns both released, the second not released when the
   release was decided, and the second first in the release order, put `skip-ci`
   back on **its own** and read again. A set-aside or claimed one does not
   count. This is the one case the plan takes ahead of "something is in flight".

**Changed in v2** (#3179): a rebased head is a new snapshot before anything is
armed or released, so the whole review verdict at that head decides: `held`
keeps `skip-ci` on and arms nothing; a newly bypass-only head is not armed, and
one armed already is disarmed.

A rebase that changes nothing on a pull request with nothing to take off means
GitHub's merge state was stale: wait 30 seconds and read again.

### Failures while picking

| failure                                                                | outcome                                                      |
| :--------------------------------------------------------------------- | :----------------------------------------------------------- |
| the pull request's own: a conflict, own commits not told, nothing left | set aside; **the next candidate is tried this cycle**        |
| a branch that moved under it: a lease or a re-read finds another head  | nothing recorded; read again (another writer is at work)     |
| anything GitHub may have caused: fetch or push refused, arm, unlabel   | counted ("Conditions"); **this cycle releases nothing else** |

A conflict whose every file matches a `regenerate` generator is not a failure of
the pull request's: see "Regenerate".

## In flight

A released pull request is watched across cycles at `--poll-interval`. Each
cycle tests, in order, and the first that matches ends its turn:

| condition                                                    | outcome                                                    |
| :----------------------------------------------------------- | :--------------------------------------------------------- |
| merged                                                       | logged as merged                                           |
| closed                                                       | logged as closed                                           |
| auto-merge switched off (not read for a bypass-only one)     | `skip-ci` put back on; a candidate, armed when next picked |
| `skip-ci` back on                                            | its turn ends                                              |
| head is not the pushed one                                   | its turn ends                                              |
| `BEHIND` / `DIRTY`                                           | its turn ends; it is a candidate again                     |
| a required check failed                                      | Auto-fix, else set aside `checks-failed`                   |
| green, and only a bypass merges it                           | set aside `awaiting-bypass`                                |
| green for the budget, `BLOCKED`, and its review now holds it | its turn ends; `held` (no record)                          |
| green for the budget, otherwise                              | set aside `not-merging`, and demoted                       |
| a required context unreported and nothing running            | "Conditions": `checks-not-started`                         |
| past `--watch-timeout` (90 minutes) since released           | set aside `watch-timeout`                                  |
| its checks cannot be read                                    | "Conditions": `read-failed`                                |

**Changed in v2**: v1 ended the turn of a pull request whose auto-merge was
switched off and left it released, to be armed when next picked, which a
released pull request never is; v2 puts `skip-ci` back on, so it is picked,
armed and released again on its own turn.

- **Green** is every required context met **and nothing on the head still
  running**, required or not (`decisions.md` "Check verdicts").
- **The budget**: 2 consecutive green cycles where GitHub calls it mergeable, 5
  while it reads `BLOCKED` (a superseded check run looks like that for a
  moment).
- **A code-owner check that stays red after an approval** (a `check` gate):
  the check does not run on the review event, so a failing pull request whose
  only red is that check has its review read; still waiting → `held`; approved
  since → the failed jobs of that check's run are re-run, at most twice per pull
  request and head; `unknown` → `held` for a person to re-run. While the re-run
  runs, nothing else is released.

**Demotion.** A pull request set aside `not-merging` goes last in the order from
then on — after the version pull request, `priority:high` included — until
someone else pushes to it. **Changed in v2**: kept in the persisted memory, so a
restart keeps it.

## Auto-fix

When a watched pull request's checks fail, the failed jobs under the aggregates
are read. With `autoFix` configured (`commands.md`), it is fixed when **every**
failed context, past `ignore`, matches a fixer, none of their check runs carries
an annotation titled `notFixableAnnotation`, at any level, and the branch is one
commit:

1. in a worktree: `before` commands, then each matching `prepare` once, then the
   fixers' `run` by `stage` (lowest first), then by command, then `after`;
2. if anything changed, amend it onto the one commit and push leased against the
   failed head;
3. watch the new head; **the next pull request is not picked**.

Declined, and set aside `checks-failed` as usual, when: no `autoFix`; any failed
job matches no fixer; a job's check run says its command failed; not one commit;
a command failed; nothing changed; the fixed head failed again (once per watch).
`--no-auto-fix` turns it off, with "Regenerate".

## Regenerate

When the rebase of a `merge-queued` pull request (picking it, or keeping it on
the tip) conflicts **only** in files matching a `regenerate.generators[].path`:
take the base's side of each, continue the rebase, run `before` and each
matching generator's `run` (`$1`–`$9` are `path`'s capture groups), amend what
they wrote onto the one commit, and push. Set aside `rebase-failed` as usual
when: a conflicted file matches no generator (the comment names the ones that
could have been regenerated); a generator leaves a file the pull request changed
as the base has it; the pull request is `auto-rebase` without `merge-queued`
(this runs the branch's own code). A failed `before` is not the pull request's
(no set-aside; this cycle releases nothing else).

`generatedBranches`: a `rebase-failed` on one of these branches is not rebased
by the skill; it runs the branch's `rebuild`.

## Keeping on the tip

Only when there is nothing in flight and no candidate: for each pull request
that is `skip-ci` **and** (`auto-rebase` or `merge-queued`), open, not a draft,
not a fork's, onto `main`, not the version pull request, and owned by `worker` —
and behind, by `git merge-base --is-ancestor` (the merge state says nothing
under `skip-ci`): rebase onto `main`, push leased, carry the layers above.
A conflict is a set-aside (`rebase-failed`), announced and not tried again until
the head or `main` moves or the retry box is ticked; a refused push is counted
like any push ("Conditions"). One per cycle, then read again.

## Conditions

**New in v2** (#3601): every "this has gone on too long" rule is one mechanism.
A condition is keyed by pull request, head and kind; it records the first time
and the number of times it was met. Two sorts clear differently:

- **observed** (unreadable checks, a head off its branch tip, checks never
  started): met by a snapshot, and cleared by the first snapshot that does not
  meet it;
- **attempted** (a push, arm, unlabel, review read or re-run request that
  failed): met by a failed attempt, and cleared only by the same attempt
  succeeding or the head moving; a snapshot in which nothing was attempted
  leaves it as it is.

The policy:

| kind                                         | turns into                                                        | after                                                                                 |
| :------------------------------------------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| released, checks unreadable                  | `read-failed`                                                     | 5 snapshots, unless the same read on `main` fails too (GitHub's outage: keep waiting) |
| head ≠ branch tip                            | `head-out-of-sync`                                                | 10 minutes (`merge-queued` only)                                                      |
| required context unreported, nothing running | one label event (`skip-ci` on and off), then `checks-not-started` | 5 minutes, then 5 more                                                                |
| review read failed                           | `read-failed`                                                     | 5 snapshots                                                                           |
| re-run request failed                        | `read-failed`                                                     | 5 snapshots; a permanent error (no run, past the re-run window) at once               |
| fetch or push / arm / unlabel failed         | `push-failed` / `arm-failed` / `unlabel-failed`                   | 3 cycles; one pull request at most per cycle                                          |
| re-run of the code-owner check still red     | `checks-failed`                                                   | 2 re-runs                                                                             |
| re-run not finished                          | `checks-failed`                                                   | 40 minutes (`RUN_TIMEOUT_MS`)                                                         |

**Changed in v2**: v1 set aside at once on one failed push, arm or unlabel; v2
counts them like any transient read, since GitHub may have caused them.

## Checking ahead (`queue/*` layers)

With `speculate` configured (`workflows`, `depth`): up to `depth` leading
candidates are checked ahead of their turn.

- **Layers.** Each candidate's commits since its merge base with `main` are
  squashed into one commit on the layer below (`main` for the first), with the
  `Queue-Layer:` trailer, and pushed to `queue/pr-<N>`. Nothing is remembered:
  the next snapshot reads which layers are valid from the branches, their
  trailers and their trees.
- **Dispatch.** The configured workflows are dispatched on each layer, diffing
  against `main` as a pull request's run does. A layer is dispatched only once
  every layer below has passed its gate and started every job, and never on a
  red layer.
- **Order.** The layered pull requests are released first, in the order stacked;
  the rest follow in the queue's order. A new candidate or a new `priority:high`
  reorders only what is not yet stacked (#3628). The kept stack follows the
  layers up from `main`'s tree while each pull request is still a candidate at
  the head its layer was built from, stops at one demoted, at the version pull
  request, at one only a bypass merges, at a fork's, and at one that conflicts
  with the layer below. Of two stacks on one tree the one built last is kept
  (the longer, on a tie).
- **Release.** The first candidate is released once its layer is green; its
  rebased head has the layer's tree, so the gate reuses the verdict. **New in
  v2** (#3628): the rebased head's tree is compared with the layer's before
  `skip-ci` comes off; a mismatch releases it without reuse.
- **A red first layer** sets its pull request aside `checks-failed`, after its
  runs finish (#3628: so the comment links a finished run with every failure);
  its branch goes then. When only fixable jobs failed, the layer goes and the
  pull request is released so that "Auto-fix" can act on its own run.
- **A red layer above the first** waits until it is first (its layers below
  merged) or is rebuilt (they left the queue). Nothing is built on it.
- **Cleanup.** A layer no longer valid (head moved, set aside, merged, left the
  queue, a layer below rebuilt) has its unfinished runs cancelled — except one
  set aside for a failure at its built head, whose runs finish — and its branch
  deleted after the cancels are asked for. Also when the queue has drained.
- **Fallback.** A cycle whose layer reads, pushes or dispatches fail, a first
  layer over 90 minutes from a dispatch still waiting for a runner, a job
  running over 40 minutes, or a workflow cancelled three times on the first
  layer, releases the first candidate as without layers.
- **New in v2** (#3628): one function decides whether a run is a layer run
  (`isQueueLayerRun`); the verdict lookup pages past layer runs so pull request
  and `main` verdicts are not lost; a candidate that conflicts only with a lower
  layer stays stackable above `main`; bypass-only pull requests are stacked
  among themselves.

## Memory

**Changed in v2**: one JSON file per repository,
`~/.local/state/unblock-prs/worker/<owner>/<name>.json`, written after every
cycle (write to a temporary file, then rename):

- the conditions, with first-seen and counts;
- the demotions;
- set-asides decided but not yet announced;
- the pull request in flight: its pushed head, when released, green count, and
  whether Auto-fix has already pushed during this watch;
- the pull requests acted on last cycle, for `followed`;
- when the release was decided, the order it was decided in and which pull
  requests were paused (`skip-ci`) then, for "Yield";
- a fingerprint of the last snapshot — the open pull requests (head, merge
  state, labels, auto-merge, draft, body), the review holds and the tip — for
  "Intervals";
- per pull request, how many code-owner re-runs were asked;
- the idle count: how many snapshots in a row the fingerprint has held.

A file that cannot be read is logged and replaced with an empty memory, which is
what a first run starts from. Nothing it held is a permission — arming and
releasing are decided from the snapshot alone — but losing it repeats work: a
demoted pull request is picked ahead again and may run a matrix to be set aside
once more, a set-aside not yet announced is decided again, a code-owner check
may be re-run twice more, and every count starts again.

## Intervals

`--active-interval` (60 s) between cycles until `--idle-after` (5) snapshots in
a row have seen the same open pull requests (head, merge state, labels,
auto-merge, draft, body), the same review holds and the same tip; then
`--idle-interval` (300 s). Anything changed brings back the short interval. A
pull request in flight, or a layer being waited for, keeps it at
`--poll-interval` (60 s).

## Options

| option                    | default | meaning                                             |
| :------------------------ | ------: | :-------------------------------------------------- |
| `--once`                  |         | run one cycle and exit                              |
| `--dry-run`               |         | read and plan, change nothing, say what it would do |
| `--active-interval <sec>` |      60 | wait between cycles while the list moves            |
| `--idle-after <n>`        |       5 | unchanged snapshots before the long wait            |
| `--idle-interval <sec>`   |     300 | wait once it has sat still                          |
| `--poll-interval <sec>`   |      60 | wait while one is in flight                         |
| `--watch-timeout <min>`   |      90 | give up on one in flight after this                 |
| `--no-auto-fix`           |         | skip Auto-fix and Regenerate                        |
| `--repo <owner/name>`     |         | the repository, when `origin` is not it             |

Token: `GH_TOKEN`, then `GITHUB_TOKEN`, then `gh auth token`. Repository:
`--repo`, else `origin`, else the root `package.json`'s `repository`. The first
SIGINT / SIGTERM finishes the current step and exits; a second exits at once.
Every log line starts with the local time and its UTC offset
(`[2026-09-27T21:03:04.500+09:00]`).

## The set-aside comment's prose

After the record line (`conventions.md`): the reason's sentence — the failed
checks with a link to each run for `checks-failed`, the conflicting files for
`rebase-failed` (and which could have been regenerated), what holds it for
`not-merging`, what it still waited on for `watch-timeout` — the last 60 lines
of a failed command in `<details>`, what will clear it, then the retry box. It
is written once when a pull request is newly set aside, never under `--dry-run`,
as the token's account (so the author of a pull request that account opened is
not notified, and a subscribed session is woken).
