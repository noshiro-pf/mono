# Merge queue v2 — specification and design

This directory is the specification the v2 rebuild of the merge queue is written
against: `unblock-prs` and the other `pr-merge-queue` commands, and the
decisions they share with the GitHub Pull Requests Manager page
(`pr-report-core`). It replaces neither package yet. Each v2 package lives
beside the one it replaces, under the same name with `-v2`, private, and takes
its place once it does everything listed here.

| file                                 | what it fixes                                                          |
| :----------------------------------- | :--------------------------------------------------------------------- |
| [`conventions.md`](./conventions.md) | the wire formats other tools and people rely on: labels, trailers, ... |
| [`decisions.md`](./decisions.md)     | every pure decision: check verdicts, merge order, owners, review holds |
| [`worker.md`](./worker.md)           | what `unblock-prs` does, cycle by cycle                                |
| [`commands.md`](./commands.md)       | every other command, and `.github/unblock-prs.json`                    |

A fix to v1 is not ported into a v2 package as code: a fix that changes a rule
is written into this specification, with the test that shows it, and reaches v2
when that rule is built there.

The v1 READMEs explain _why_ each rule exists, incident by incident; this
specification states _what_ the rule is. Where a rule here cites an issue, the
issue is the reason.

## What "equivalent" means

v2 is ready to replace v1 when:

1. **Every wire format in `conventions.md` is byte-compatible.** Comments v1
   wrote are read by v2 and the other way round, so the two can be swapped with
   a queue in flight, and the page reads either.
2. **Every command keeps its name, its options and its exit codes**, and
   `pr-report --format json` keeps its shape, because `CLAUDE.md`, the skills
   and the workflows call them.
3. **Every decision in `decisions.md` gives v1's answer on v1's tests**, ported
   as fixtures, except where this specification changes a rule on purpose; each
   such change is marked **Changed in v2**.
4. **The requirements of #3671 hold** (table below).

## Design

v1 grew by incident: each new failure added a module that reads a little more of
GitHub at the moment it is needed and keeps a little state of its own. v2 keeps
every rule and changes the shape around them.

### 1. Read, decide, act — in that order, every cycle

Every command, the worker included, runs the same three steps:

1. **Read** a `Snapshot`: every fact any decision needs, read before anything is
   decided. There is no "read this too and ask again" protocol (v1's
   `QueueStanding.needs`): a decision is a total function of the snapshot.
2. **Decide**, purely, in `pr-report-core-v2`: the page, `pr-report` and the
   worker call the same functions on the same snapshot type.
3. **Act** on at most what the decision says, and report what happened.

Every part is read for every open pull request, or for the runs a fixed rule on
the facts names (the annotations of a run that did not pass), never for those
the plan might need: a few GraphQL queries, one per part (§3 below), read
labels, merge state, closing issues, review threads, comments and base changes;
REST reads the branch rules once, and for each head its checks, its comparison
with the base and who pushed it. The checks are REST's for both readers: every
run of every name (`filter=all`) and the workflow runs beside them (a round a
concurrency group holds has no check run yet, #3703), which GraphQL's rollup
does not give. It costs a few requests per open pull request a cycle, which the
rate limits leave room for, against v1's lazy reads and the bugs of reading half
a picture.

**The snapshot grows with the decisions.** `pr-report-core-v2/src/snapshot/`
holds the facts the decisions built so far and those plainly needed next; a fact
a later decision needs (the tree of a rebased head the release comparison reads,
say) is added in the change that builds that decision, with its test.

### 2. The worker is a state machine, not a set of nested loops

v1's worker runs a survey loop, and inside it a watch loop that polls one pull
request for up to 90 minutes, with timers and counters kept in a dozen modules
(`unread`, `out-of-sync`, `not-started`, `demotions`, `skips`, …). v2's worker
is one loop:

```text
loop:
  snapshot = read()
  { steps, memory } = planCycle(snapshot, memory, config, now)   // pure
  for the first step: execute it, record the outcome in memory
  persist memory
  sleep(interval(memory)) unless the step changed GitHub — then read again at once
```

- **One action per cycle, then read again.** Any step that changes what a
  decision reads of a pull request — its branch, its labels, its auto-merge —
  ends the cycle, and the next one starts from a fresh snapshot. So every
  decision, above all whether to arm and release a rebased head, is made on a
  snapshot of the head it acts on (#3179). Comments (settling records,
  announcing a set-aside) change no such fact and do not end it; nor does a
  set-aside for the pull request's own failure, which says nothing about the
  next candidate (`worker.md`, "The cycle").
- **Watching is not a mode.** A released pull request is simply `in-flight` in
  every snapshot until it merges or a rule ends its turn; the timers the watch
  kept ("green for N polls", "nothing started for 5 minutes", "past 90 minutes")
  are entries in the worker's memory, judged by `planCycle`. The cycle runs at
  the poll interval while something is in flight.
- **One mechanism for "this has lasted too long".** Unread checks, a dropped
  push, checks never started, a transient failure, a re-run that stays red:
  each is a _condition_ keyed by pull request and head, with a first-seen time
  and a count, and a policy that says how many surveys or minutes turn it into a
  set-aside (#3601). One table lists them all (`worker.md`).
- **Memory survives a restart.** It is a JSON file per repository under
  `~/.local/state/unblock-prs/`, so a restart no longer forgets demotions or
  restarts every count. What other actors must see — set-asides, claims, layers
  — stays on GitHub, as in v1.

### 3. One reader for the page and the commands

`pr-report-core-v2` defines the `Snapshot` and ships the readers that build it,
with the transport injected:

- **GraphQL parts** for the page and the worker. Each part is its own query and
  decoder and fails on its own with a typed error, so the page draws
  progressively and keeps the last good answer of each part.
- **REST** for the commands a Claude Code session runs, whose proxy refuses
  GraphQL (`pr-report`, `claim-pr`, `push-fixed-pr`, `rework-pr`, `start-issue`,
  `startable-issues`, `report-unowned-prs`).

Both readers are tested to build the same snapshot from recorded answers of the
same repository state. What only REST answers — the checks with their workflow
runs and `run_started_at` (#3474), the branch rules, the comparisons, the
pushers — every reader reads over REST, the page included; so are the issues,
the merged pull requests and the queue layers, until a GraphQL part of them
earns its own query. Every list is paged to its end, or to as much as was asked
for and says whether there was more, or fails loudly; no reader reports the
first page as the whole (#3217).

### 4. Packages

```text
libs/pr-report-core-v2/src/
  conventions/   labels, trailers, comment records, branch names — the wire formats
  snapshot/      the Snapshot type: facts only, no decisions
  decide/        verdicts, graph, owner, standing, order, review hold, start states
  plan/          planCycle and the worker memory type
  read/          GraphQL parts, REST reader, transports injected
libs/pr-merge-queue-v2/src/
  github/        token, repository, fetch with proxy, rate limits, retries
  git/           worktrees, rebase, push with lease, merge-tree
  worker/        the loop and the executor of planCycle's steps
  layers/        checking ahead on queue/* branches (optional, by config)
  agent/         the unattended Claude Code loop (#3089)
  commands/      one directory per command, thin: parse, read, decide, act
  cmd/           the entry points the bins and root scripts run
```

## #3671 requirements

| #   | requirement                                                   | where it is met                                                                      |
| :-- | :------------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| 1   | act on the whole review verdict at the rebased head (#3179)   | `worker.md` "5. Execute one step" and "Picking": arm and release follow the push     |
| 2   | one transient failure does not set aside (#3601)              | `worker.md` "Conditions": counted per pull request and head, permanent ones at once  |
| 3   | checking ahead on `queue/*` layers (#3628)                    | `worker.md` "Checking ahead", each sub-requirement listed there                      |
| 4   | one unattended loop (#3089)                                   | `commands.md` "The unattended loop"                                                  |
| 5   | branch rules read in full (#3217)                             | `decisions.md` "Required contexts": every list paged                                 |
| 6   | issue claims read where labels are (#3233)                    | `decisions.md` "Issue start states"; `commands.md` `pr-report`, `run-issue-resolver` |
| 7   | decide whether sessions write against a preview stack (#3594) | open question, asked at the end; not part of the first equivalence                   |

## Migration

1. `pr-report-core-v2`: snapshot types, conventions, decisions, readers.
2. `pr-merge-queue-v2`: the read-only commands first (`pr-report`,
   `startable-issues`), then the writing ones, then the worker, then checking
   ahead and the unattended loops.
3. Run the v2 worker with `--dry-run` beside the v1 worker and compare what each
   would do, cycle by cycle, until they agree.
4. Swap: the root scripts point at v2, the v2 directories take the v1 names, the
   packages are published as the next major.
