# Workflows

The design the workflows in this directory share. A comment inside a workflow
says only what is particular to that workflow; whatever two or more of them
have in common is written here once, and the workflow points at the section.
`CLAUDE.md` ("CI") holds the rules a session has to follow and points here for
the reasons.

<!-- doc-paths-ignore: .github/README.md -->

This file is beside the workflows rather than at `.github/README.md` because
GitHub shows a `.github/README.md` in place of the root one.

## Inventory

| Workflow                         | Runs on                                | Reports a required context                     |
| :------------------------------- | :------------------------------------- | :--------------------------------------------- |
| `code-check.yml`                 | pull requests; `push` to `main`        | `code-check-result / result`                   |
| `style-check.yml`                | pull requests; `push` to `main`        | `style-check-result / result`                  |
| `strict-lib-gen.yml`             | pull requests; `push` to `main`        | `strict-lib-gen-result / result`               |
| `node-version-compatibility.yml` | pull requests; `push` to `main`        | `test-node-versions-result / result`           |
| `verify-published-packages.yml`  | pull requests; `push` to `main`        | `verify-published-result / result`             |
| `synstate-benchmark.yml`         | pull requests; `push` to `main`        | `synstate-benchmark-result / result`           |
| `check-gates.yml`                | `workflow_call`, from the six above    | none; it is the gate the six share             |
| `check-result.yml`               | `workflow_call`, from the six above    | the six above; it is their aggregate           |
| `skip-ci-label.yml`              | `pull_request_target`                  | the `no-skip-ci-label` commit status           |
| `lint-pull-request.yml`          | `pull_request_target`                  | its four jobs, by name                         |
| `verify-lockfile.yml`            | pull requests; `push` to `main`        | `verify-lockfile`, its one job                 |
| `release.yml`                    | `push` to `main`                       | none                                           |
| `pnpm-update.yml`                | schedule                               | none; opens/closes `chore/pnpm-update`         |
| `node-support-update.yml`        | schedule                               | none; opens/closes `chore/node-support-update` |
| `deploy-pages.yml`               | `push` to `main`                       | none                                           |
| `deploy-firestore.yml`           | `push` to `main`; `workflow_dispatch`  | none                                           |
| `deploy-event-schedule-app.yml`  | `push` to `main`; `workflow_dispatch`  | none                                           |
| `restart-unblock-prs.yml`        | `push` to `main`                       | none; files the author's restart TODO          |
| `issue-closed-labels.yml`        | `issues` closed                        | none; releases the closed issue's start        |
| `link-check.yml`                 | pull requests, path-filtered; schedule | none; other people's servers decide it         |
| `e2e-production.yml`             | schedule; `workflow_dispatch`          | none; the live sites decide it                 |

The required contexts are listed in `repo-settings/rulesets/main.json`. Every
one of them is either an aggregate job (see "The aggregate job") or a job that
runs no repository code; none is a job that does the work.

## The check workflows

Six workflows check a pull request: `code-check.yml`, `style-check.yml`,
`strict-lib-gen.yml`, `node-version-compatibility.yml`,
`verify-published-packages.yml` and `synstate-benchmark.yml`. They have one
shape:

```text
gates  (check-gates.yml, reusable)
  └─ the work: a matrix, or one job
       └─ <name>-result  (check-result.yml, reusable;
                          the one required context, `<name>-result / result`)
```

Everything in this section is that shape. A workflow that departs from it says
so in its own comments.

### Triggers

```yaml
on:
    push:
        branches: [main]
    pull_request:
        types: [opened, synchronize, reopened, labeled, unlabeled]
    workflow_dispatch:
```

- **`synchronize`** fires on every push to the branch, so these five types
  cover the whole life of a pull request, a draft included. A draft is
  checked like anything else: work in progress is exactly where a CI result
  is worth having, and the gate is what keeps that cheap. No
  `ready_for_review`: marking a draft ready changes nothing about the commit,
  and a run for it would re-check the same head with the same result.
- **`labeled` / `unlabeled`** are what let `skip-ci` stop the checks and
  taking it off start them again (see "`skip-ci` and `no-skip-ci-label`").
  Any label event re-runs the workflow; the gate's reuse of an earlier
  verdict is what makes that affordable. While `skip-ci` is on, a label event
  reports nothing at all (see "A label event under `skip-ci`").
- **No `edited`, no `issue_comment`.** Such a run cancels the one in progress
  (see "Concurrency") and its skipped aggregate supersedes the last verdict.
- **`push` to `main`**, where the gate asks whether the pushed tree already has
  a verdict (see "Reusing a verdict"). A merge of an up-to-date branch is a
  squash whose tree is the pull request's head's, so it normally does, and the
  push costs the gate job and nothing else; running the whole matrix there
  instead once cost 108 runner-minutes per merge to confirm what the pull
  request had confirmed. A merge the ruleset was bypassed for (out of date,
  `skip-ci` still on, red) may land a tree that has no verdict, and then the
  checks run on `main` in full. Nothing has to tell the two apart, and nobody
  has to remember to run anything by hand. `code-check.yml`'s `coverage-main`
  job runs on `main` whatever the verdict, because Codecov compares a pull
  request's coverage against the base commit's report and the base commit is on
  `main`; so does `synstate-benchmark.yml`'s `benchmark`, which stores the
  baseline the next pull request is compared with. Both take what the pull
  request's run already made of the tree (see "Reusing what a pull request
  produced"). On `main` the aggregate holds no merge; it is what a later run on
  the same tree reuses, and a red one is the signal that a bypass merge landed
  something broken.
- **`workflow_dispatch`** is how the checks are asked for from the Actions tab.
  Such a run is exempt from every gate: there is no pull request to be behind
  anything, and no verdict is reused. A queue that checks pull requests ahead of
  their turn (`unblock-prs`'s `speculate`) stacks them on `main`, one commit
  each, each layer on a branch of its own, and dispatches the check workflows on
  each layer. Such a run diffs against `origin/main`, as a pull request's does,
  so that its verdict is a whole one about the layer's tree, reused by the pull
  request whose rebased head has the same tree (see "Reusing a verdict"),
  whatever becomes of the layers below. A branch per layer, named `queue/*`,
  because a dispatch's concurrency group is its ref: a second dispatch on one
  branch cancels the first. The prefix is reserved for the queue by
  `repo-settings/rulesets/queue-branches.json` (and kept free of tags by
  `queue-tags.json`). The check workflows take no input
  (`check:root:dispatch-inputs`). The gate diffs a manual run as it always has:
  on `main` it runs everything, elsewhere against `origin/main`. On a `queue/*`
  branch the codemod and the `check:prose` guards diff against `origin/main`
  too, as for a pull request; on any other manual run the codemod runs in full
  and the guards compare the tree with itself, so such a run leaves no verdict
  to reuse (see "Reusing a verdict").
- **No `paths` filter.** A workflow a path filter skips reports no status at
  all, and a required context that never arrives blocks the merge forever.
  The diff question is answered by the gate, after the workflow has started.
  `link-check.yml` carries one because it reports no required context:
  whether an external URL answers is not a property of the tree.

### Concurrency

```yaml
concurrency:
    group: ${{ github.workflow }}-${{ case(github.event_name == 'pull_request', github.event.pull_request.number, github.event_name == 'push', github.sha, github.ref) }}
    cancel-in-progress: true
```

One run per pull request: a push cancels the run still going for the previous
one, so a branch pushed to five times in a row costs one CI result rather than
five. Nothing is lost by that on a pull request branch, because the gate diffs
against `origin/main` and the newer run covers every commit the cancelled one
would have.

On `main` it is the group, not `cancel-in-progress`, that keeps a run alive.
The gate there diffs against `github.event.before`, so each push's run covers
only that push, and a push run that is cancelled leaves its diff checked by
nothing. Cancelling one while it runs is only half of that: GitHub also
replaces a run _waiting_ in a group with the next one to arrive, whatever
`cancel-in-progress` says. So each push to `main` has a group of its own,
keyed on the pushed commit, and no two push runs ever share one. That leaves
nothing for `cancel-in-progress` to spare, and it is a plain `true`.

`workflow_dispatch` keeps the ref as its group, so a second dispatch on a
branch cancels the first; the commit the first was for keeps its push run's
result. Keying it on the commit instead would put it in that push run's
group, and a dispatch would then cancel the push run's `coverage-main`, the
Codecov base report for that commit.

`queue: max`, which lets up to 100 runs wait in a group, is not a substitute
for the group per commit. It takes a literal rather than an expression, so it
would apply to pull request runs as well, and GitHub rejects it alongside
`cancel-in-progress: true`, the one thing a pull request's group needs.
Queued rather than parallel is also nothing a push run needs: each reads only
its own tree and its own `github.event.before`.

Two workflows outside this shape, `skip-ci-label.yml` and
`lint-pull-request.yml`, do write
`cancel-in-progress: ${{ github.event_name == '…' }}`, so that a run of their
other triggers is left alone. The event name in that expression has to be one
the workflow triggers on, or the expression is a constant and
`cancel-in-progress` is silently off; `pnpm run check:root:workflow-event-name`
holds the two in agreement, and a workflow whose trigger moves
(`pull_request_target`) moves the name with it.

### Permissions

```yaml
permissions: {}
```

Deny by default; each job grants back exactly what it needs.

The repository's own default is "read and write"
(`GET /repos/{owner}/{repo}/actions/permissions/workflow`), and without a
`permissions` key every job inherits it. Every check job runs the branch's own
code: the `prepare` script during `pnpm install`, `ws:build`,
`eslint.config.mts`, the vitest configs. So the default hands a write-capable
`GITHUB_TOKEN` to whatever the branch happens to contain. A fork's pull
request is capped at read-only by GitHub whatever this says, but a branch in
this repository is not, and `chore/pnpm-update` is exactly that: a branch
whose contents are whatever the registry served that morning, opened and
auto-merged with no human in between.

This stays the deny-all form in each workflow rather than a repository-wide
setting: a setting is one switch for every workflow at once, and
`repo-settings/actions-settings/` does not model it, so a change there would
not be noticed by the settings drift check, which runs from the private
`noshiro-pf/mono-security` (see "Security findings" in `CLAUDE.md`).

Grants that recur:

- **`contents: read`** for a checkout.
- **A caller's job-level `permissions` on the `gates` job** restating what
  `check-gates.yml` declares (`actions`, `contents`, `pull-requests`: read). A
  caller's job-level `permissions` is the ceiling for the workflow it calls,
  and permissions can be reduced along the chain, never elevated, so the
  top-level `{}` would otherwise leave the called workflow unable to check
  out.
- **`permissions: {}` on the aggregate** (`check-result.yml`), which reads
  the `needs` it is handed and echoes.

### Checkout

```yaml
- uses: actions/checkout@…
  with:
      ref: ${{ case(github.event_name == 'pull_request', github.event.pull_request.head.sha, github.sha) }}
```

The branch tip, not the merge commit GitHub synthesises for a `pull_request`
event. The checks assert properties of the branch itself, the merge ref does
not even exist while the pull request has a conflict, and the gate's diff has
to be the diff the checks then run against. On a `push` or
`workflow_dispatch` run this falls back to the event's own commit.

### Setup

```yaml
- name: Checkout
  uses: actions/checkout@…

- name: Set up pnpm, Node.js and the dependencies
  uses: $/.github/actions/setup
```

Every job that runs repository code starts with these two steps. The second is
the composite action `.github/actions/setup/action.yml`:
`pnpm/action-setup`, `actions/setup-node` with
`node-version-file: 'package.json'` and `cache: 'pnpm'` (unless the caller
passes `cache: false`), and `pnpm install --frozen-lockfile`. It is the one
place those action pins are written, rather than every job that takes the steps.

- **The Node version is `volta.node`**, which `check:root:node-support` holds
  equal to `targets.current` in `tools/configs/node-support.json`. The two
  workflows that run another version (`node-version-compatibility.yml`,
  `node-support-update.yml`) resolve it from that file in a step before this
  one and pass it as `node-version`, rather than writing it into the
  workflow.
- **The inputs are the callers' real differences, and each caller says why**:
  `engine-strict` in `node-version-compatibility.yml` and deliberately not in
  `node-support-update.yml`'s canary, `ignore-scripts` and `cache: false` in
  `release.yml`'s publishing job, `install: false` in `pnpm-update.yml`, which
  changes pnpm before it installs anything, and in `deploy-firestore.yml`'s
  deploy job, `deploy-event-schedule-app.yml`'s deploy job and
  `e2e-production.yml`, which install one app rather than the workspace, and
  `pnpm: false` in `check-gates.yml`, whose diff check runs on Node.js alone.
- **The checkout stays in the caller.** The action itself needs none — a `$/`
  action is this repository's at the running commit, not a path in the workspace
  — but its install step runs a script from the checked-out tree.
- **A composite action is named `$/…`, never `./…`.** A `./` action is read from
  the workspace when its step starts, after anything that ran earlier could have
  rewritten it, and the lockfile cannot cover the actions it uses (see "Action
  pins and the lockfile"), so `gh actions-lock` refuses one that uses any. A
  `$/` one is read at the commit the workflow runs from, and its own pins are
  locked like a workflow's.
- **The install is `tools/scripts/cmd/workflow-steps.mts install`**, which
  also checks that each boolean input is `true` or `false`: a misspelt one
  would otherwise read as `false`. The script is read later still, after
  `setup-node` has run pnpm for its cache, and that is safe for a different
  reason: the step goes on to run `pnpm install`, so whatever could have
  rewritten the script runs there anyway, with the same reach. The same
  script's `check-diff` is `check-gates.yml`'s diff step, for the same
  reason. A step that must not trust the tree, such as the path check in
  `pnpm-update.yml`'s `commit` job, stays inline; the script's header says
  which steps may move there, and on which Node it has to run.
- **The install reuses pnpm's lockfile verification.** pnpm verifies the
  lockfile against the supply-chain policies of `pnpm-workspace.yaml` and
  records the result on the machine; the action caches that record (unless the
  caller passes `cache: false`, which skips it and the warning below), keyed on
  the pnpm version, the lockfile and `pnpm-workspace.yaml`. A job skips the
  verification only when a job that finished before it started saved the record
  under that key; jobs that start together, such as the matrix entries of the
  check workflows, each verify. `gates` installs nothing (`pnpm: false`). A
  cache is read only from the ref that saved it, a pull request's base branch
  and `main`, so a pull request that changes the lockfile verifies in the first
  jobs of its first run and reuses the record from then on, and other pull
  requests reuse it once a run on `main` after the merge has saved it there. A
  pull request that changes none of the key's three inputs reuses `main`'s from
  its first job. pnpm accepts a record only for the same lockfile hash under
  policies at least as strict, so a restored one skips nothing that has not
  passed. The install warns when pnpm wrote no record where the action looks,
  because the cache would then save nothing and fail nothing.
- **A composite action cannot read `secrets`.** None is needed: nothing
  installs from GitHub Packages any more, so no job points `setup-node` at it
  or passes `NODE_AUTH_TOKEN` to the install.
- **Composite actions live under `.github/actions/`**, which is where
  `update-actions` reads pins besides the workflows, and the only other path
  under `.github/` that `pnpm-update.yml`'s `commit` job accepts in its patch
  (outside it, the manifests, `pnpm-lock.yaml`, `actions.lock`, a changeset and
  `tools/configs/release-binaries.json`). An action anywhere else keeps its pins
  where they are, and nothing reports it.

### The gate: `check-gates.yml`

The two questions each check workflow has to answer before it is worth booting
a matrix: is the pull request's branch up to date with the base branch, and
does its diff touch anything the workflow reads? A third follows from the
first: has an earlier run already reached a verdict on this tree? One
reusable job answers all three, once per workflow run, and the caller turns
the answers into job-level `if`s, the only thing that skips a job before a
runner boots.

The caller's side:

```yaml
gates:
    if: >-
        github.event_name != 'pull_request' ||
        !contains(github.event.pull_request.labels.*.name, 'skip-ci')
    uses: ./.github/workflows/check-gates.yml
    permissions:
        actions: read
        contents: read
        pull-requests: read
    with:
        diff-scope: code # or runtime, style, strict-lib, none
        result-job: code-check-result / result

the-work:
    needs: gates
    if: >-
        !cancelled() &&
        (github.event_name != 'pull_request' || !contains(github.event.pull_request.labels.*.name, 'skip-ci')) &&
        needs.gates.outputs.branch_up_to_date != 'false' &&
        needs.gates.outputs.should_run != 'false' &&
        needs.gates.outputs.reused_result == ''
```

Four states skip the work, and each skips the whole job before a runner is
booted, since a job-level `if` is evaluated by GitHub itself:

- **`skip-ci` on the pull request.** The label arrives in the event payload,
  so this costs nothing, and it is on the `gates` job as well so that a
  labelled pull request boots no runner in a check workflow. Being a draft is
  deliberately not one of these states.
- **A branch behind `main`**, the state the pull request page calls "This
  branch is out-of-date with the base branch". Such a branch cannot be
  merged: the ruleset's `strict_required_status_checks_policy` requires the
  checks to pass on a head that already contains `main`'s tip, and updating
  the branch fires `synchronize` and runs everything again on the commit that
  will actually be merged. A run before that update is a run whose result
  nothing can use. Only the default branch carries the strict policy. The one
  other base treated alike is a **stacked** pull request's: the branch of
  another open pull request here. Behind it, the layer's diff carries the old
  commits of the one below, and the run that counts comes when it is
  restacked (`unblock-prs` does it when it moves the layer below) or moved
  onto `main` when that layer merges. A pull request onto any other branch is
  checked as it is.
- **A diff that touches nothing the workflow reads**, decided by
  `workflow-steps.mts check-diff` against one of the three ignore lists in
  `tools/configs/gate-ignore-lists.json`, which it reads with Node.js alone, so
  that the job needs nothing installed. A list holds patterns of the shapes
  `matchesGatePattern` names, and the step fails on a file of any other shape
  rather than reading it some way of its own. `check-changed` reads the `code`
  list from the same file. `pnpm run z:check-should-run --scope <list>` on a
  branch up to date with its base gives the gate's answer.
  A deleted file counts, and a renamed one by both names, so that a diff that
  only deletes code, or moves it onto a pattern, still runs the checks. The diff
  is against the pull request's own base, so a stacked layer is judged on its
  own changes; the layers below are judged on their own pull requests, and once
  they merge the layer's diff against `main` is the same set of changes.
- **A verdict already reached on this tree**, which the work would only
  repeat.

The skipped conclusion satisfies a required status check in every case, so
each needs something else to hold the merge, and each has one. Behind:
the ruleset. `skip-ci`: the `no-skip-ci-label` status, and, in the seconds
before it turns `pending`, the verdict the label event leaves in place (see
"A label event under `skip-ci`"). Nothing relevant in
the diff: nothing would have read those paths anyway, which is the one case
where "not checked" is the right answer. A reused verdict: the aggregate
reports that verdict rather than `skipped`.

A stacked pull request is the exception, and on purpose: no ruleset covers
its base, so nothing its checks report holds anything, skipped or not. What
keeps a layer from merging into the one below is that nothing arms it —
`open-pr` arms nothing, and `unblock-prs` arms a pull request only when it
picks it, which a layer is only once GitHub has moved it onto `main`, where
the ruleset applies. A ruleset for stacked bases
would not do better: its required checks and its pull request rule both apply
to pushes, and a layer's branch is force-pushed every time it is amended or
restacked. `repo-settings/README.md` records the same decision.

**A job downstream of a gate reads `!cancelled()` and `!= 'false'`, never
`== 'true'`.** A gate that failed to answer leaves its output empty and then
fails open: the work runs, which costs a CI run, where failing closed would
skip every check on the pull request while reporting the required ones as
satisfied. `!cancelled()` is also what lets a job follow a `needs` that did
not succeed, since without it the job is skipped whenever any job it needs
did not.

**A gate is a job-level `if`**, so a step added inside a gated job needs no
condition of its own.

#### The ignore lists

The lists are JSON (`tools/configs/gate-ignore-lists.json`) and can carry no
comment of their own, so what they mean is here:

- **A path goes on a list only when no command that workflow runs reads it.**
  `articles/` is not on the style list because Prettier formats it; `**.md`
  is not on the strict-lib list because the changelogs are copied into the
  bundles. Adding a path wrongly fails nothing; it makes the workflow skip a
  diff it was the one thing meant to judge.
- **An entry after a `!` is an exception**: a file it matches counts, whatever
  other entry of the same list matches it, and wherever in the list it stands.
  Unlike a `.gitignore`, order means nothing.
- **`code`** (`code-check.yml`) drops `experimental/`, `docs/`, `**.md`,
  `**.txt` and the style tools' configuration, except under `apps/*/src/`
  (`!apps/*/src/`). A page there is what an app builds, and its e2e checks (that
  a Japanese table fits as its English one does, say) run in `code-check.yml`
  alone, so a diff touching only that page is the one they judge.
- **`runtime`** (`node-version-compatibility.yml`, `synstate-benchmark.yml`)
  ignores what `code` does, with exceptions of its own. Those workflows run the
  packages' code on each Node.js and measure it. An app's page goes through that
  app's build, which `ws:build` runs there too, but nothing in it depends on the
  Node.js version and `code-check.yml` builds it, so `runtime` does not take
  `apps/*/src/` back. It takes back `apps/synstate-docs/src/data/` alone:
  the benchmark judges the tables there against its baseline, so a diff of the
  tables alone is one it has to see. The ignore entries are written out in both
  lists, and `workflow-steps.test.mts` fails when they differ, so an entry added
  to one goes in the other.
- **`style`** (`style-check.yml`) drops `experimental/` and nothing else: its
  matrix checks markdown, `ws:doc` regenerates the package READMEs, and
  `ws:check:ext` globs every file under the directories it is given, so `code`
  would skip that workflow exactly when it should fail. This is why a guard
  whose input is a document is a `check:prose:*` script run there, and a
  `check:root:*` script, run in `code-check.yml`, is skipped by the very diff it
  judges (see "Commands" in `CLAUDE.md`).
- **`strict-lib`** (`strict-lib-gen.yml`) is a list of its own; the workflow
  explains each entry.
- **`none`** (`verify-published-packages.yml`) skips the diff question
  altogether, for a workflow that gates itself in shell; the gate then costs
  a few API calls and no checkout. That workflow's own "nothing relevant"
  has to skip its aggregate as `should_run: false` does, which its job's
  `no_verdict` output does (see "Reusing a verdict" and "The aggregate
  job").

#### Reusing a verdict

A _verdict_ is what a run's aggregate job concluded: `success` or `failure`.
A skipped aggregate is not one, and neither is a cancelled run's.

Every check job checks out one commit (the pull request's head, or the pushed
commit) and reads its tree and nothing else, workflow files included. So a
second run on the same tree can only repeat the first one's verdict, pass or
fail. When an earlier run of the calling workflow on this tree reached a
verdict, its aggregate's conclusion is handed back as `reused_result`, the
caller skips its work, and its aggregate reports that conclusion, green or
red, never skipped.

**The key is the tree, not the commit**, because the commit changes where the
content does not. Such runs are common:

- any label event (`merge-queued`, `bug`, …), `reopened`, and a `skip-ci`
  taken off a commit that was checked before it went on;
- a rebase that changes no content: `unblock-prs` rebases each queued pull
  request onto `main` as the one before it merges, and a branch that already
  contained the merged commits comes out with a new head and the same tree;
- the squash commit a merge makes on `main`, whose tree is the up-to-date
  head's (see "Triggers").

The lookup happens on a `pull_request` onto the default branch whose branch is
up to date with it (an earlier run made while the branch was behind has a
skipped aggregate and is not a verdict), and on a `push` to the default branch.
The candidates are runs of every event, since a pull request's verdict is what a
push to `main` reuses, and a dispatched queue layer's is what the pull request
rebased onto `main` reuses: the calling workflow's latest 100 completed runs, a
few days here, matched on the runs API's `head_commit.tree_id`. A matching run
further back is not found and the checks simply run, as they do the first time a
tree is seen.

A check inside a workflow that runs and reads only the diff —
`fix:codemod:affected`, and the `check:prose` guards that read a change
(`markdown-wrap`, `next-major`) — judges the tree only as far as its base lets
it. A manual run on a branch other than a queue layer's compares the guards'
tree with itself, so they pass whatever changed, and the gate records its
verdict as not reusable. A queue layer's runs diff against `origin/main`, as a
pull request's do, so its verdicts need no such care, and the queue deletes none
of them (`unblock-prs`, step 3b in
`libs/pr-merge-queue/src/unblock-prs/README.md`).

**A verdict has to be a function of the tree.** That is what makes reusing it
by tree sound, and it is why a job whose result also depends on what it was
compared with must not leave a verdict for that case.
`verify-published-packages.yml` verifies only when the pins differ from its
base, so "the pins did not move" skips its aggregate, the same answer the
gate's `should_run: false` gives. A `success` there would say "nothing to
verify against this base", and handed to a tree whose base differs — a revert
back to older pins, say — it would pass pins nobody verified.

Deliberately not reused:

- a cancelled run: its aggregate runs under `always()` and reads red, but
  says nothing about the tree;
- a skipped aggregate;
- a run on a fork's branch: with the tree as the key a verdict travels to
  other pull requests and to `main`, and one reached on a branch outside
  this repository is not one to hand on;
- a run of a pull request onto a branch other than the default one. Such a
  run executes the workflow files of its head merged into that base, and
  the gate lets it run while behind, so its verdict is not one about the
  head's tree. What the base was is recorded when the run happens, in the
  name of the gate's first step (`Verdict reusable by tree: true|false`),
  which the lookup reads back from the run's jobs; the runs API's
  `pull_requests` cannot say it, since it describes the pull requests open
  on that head now, after any retargeting, and is empty once they close. A
  run from before the step existed recorded nothing and is not reused;
- a manual run on any branch but a queue layer's `queue/*`, `main` included:
  its `check:prose` guards compare the tree with itself, so its green is not a
  whole verdict. The same step name records it;
- anything when this is a re-run (`run_attempt` > 1) or a
  `workflow_dispatch`. "Re-run all jobs" and `workflow_dispatch` are how a
  person asks for the checks to actually run. "Re-run failed jobs" is not
  enough after a reused failure: it keeps the gate's outputs from the first
  attempt.

Where several earlier runs have a verdict, the one whose aggregate completed
last wins, so a flake re-run to green supersedes the red a later run reused
from it. A verdict that was itself reused is a verdict like any other; its
`reused_from` names the run it came from, so the original is one link further
on each time.

#### Reusing what a pull request produced

Two jobs run on a push to `main` even when the verdict is reused, because what
they produce is not a verdict: `coverage-main` uploads the base commit's
coverage report to Codecov, and `benchmark` stores the baseline the next pull
request's measurement is compared with. Both are a function of the tree, so the
pull request's run of the same tree already made them, and producing them again
cost a merge about eleven runner-minutes and one runner for ten minutes, while
the next pull request in the queue was starting its checks. So the pull
request's run keeps them as artifacts (`coverage-<index>`,
`synstate-benchmark-<run id>`), and the push takes them instead.

The lookup is `.github/actions/find-run-of-tree`: the newest completed run of
the same workflow on the checked-out commit's tree, from this repository's own
branches, whose gate recorded its verdict as one about the tree, and that still
holds a matching artifact. By the tree, as a verdict is, and not by
`reused_from`, because the run whose verdict was reused may itself have reused
one and then holds nothing. A fork's run is never taken: its artifacts come from
workflow files the fork wrote. `coverage-main` takes only a successful run,
since a failed one kept no reports; `benchmark` takes a failed one too, because
what fails there is the committed tables, not the measurement.

Where no run of the tree holds the artifact — it expired, or the merge bypassed
the checks — the job produces it as it used to, so the lookup can only save
work, never skip it.

A pull request's own run takes the coverage reports the same way when it reused
a passing verdict, which is the usual case for a queued one: its queue layer ran
the coverage and uploaded it for the layer's commit, so without `coverage-pr`
its head would have no report and Codecov would write neither its statuses nor
its comment. `coverage-pr` uploads each `coverage-<index>` artifact on its own,
as the matrix entries did, because Codecov waits for as many uploads as there
are `coverage: true` entries (`after_n_builds`; one today), and with more than
one, a merged upload, as `coverage-main` makes, would not do. Where no run of
the tree kept them it uploads nothing rather than running the coverage again:
the statuses are informational, and that would cost what the reuse saved.
`check:root:codecov-builds` holds its `artifact` list to the `coverage: true`
entries.

#### Why a workflow of its own

The answers need a checkout (the gate is a program, not a glob match), so they
cannot live in a job-level `if`, which GitHub evaluates from the event payload
alone; hence a job that computes them and a caller that reads its outputs.
`workflow_call` rather than the same shell copied into each workflow, because
there is one answer to give and one place to change it.

This used to be a step inside every job, which meant every matrix runner in
every check workflow booted, checked out and installed dependencies (about 45
seconds apiece) before finding out it had nothing to do. It could
only move to job level once the `*-result` aggregates became the required
contexts: a skipped matrix job produces one check run named after the job,
never the matrix contexts, and while those were required a job-level skip
would have left them "Expected", blocking forever.

### The aggregate job

```yaml
<name>-result:
    needs: [gates, the-work]
    if: always()
    uses: ./.github/workflows/check-result.yml
    with:
        needs: ${{ toJSON(needs) }}
```

The one required status check of each check workflow, reported as
`<name>-result / result`: a job in a called workflow reports its check run
as `<calling job> / <called job>`. The jobs that do the
work still report their own check runs and are still worth reading, but none
of them is required, because a required context can be satisfied by a run
that never happened. Two ways, both measured on this repository:

- A job GitHub skips produces exactly one check run, named after the job
  (`code-check`), never the matrix contexts (`code-check (check:root)`, …).
  Those contexts are not superseded, so they keep whatever they last said on
  that commit: a green from an earlier run stays green, and the pull request
  reads as fully checked while nothing ran.
- A skipped job whose check run name is the required context (a job with no
  matrix) reports `skipped`, and GitHub counts a skipped required check as
  satisfied.

The aggregate closes both. Its name does not depend on a matrix, so every run
supersedes the last, and `always()` means a failed or cancelled matrix still
gets a verdict rather than leaving this job skipped along with the work.

Every aggregate is the same job, so it is one reusable workflow and the caller
hands it `toJSON(needs)`: the gate's outputs and every other job's `result`
are in it, and `skip-ci` is in the event, which the called workflow reads as
its own.

**The skips are on the called job, never on the calling one.** A calling job
that GitHub skips reports one check run under its own name, `<name>-result`,
and the required `<name>-result / result` would never arrive: "Expected —
waiting", blocking forever. So the caller carries `if: always()` and nothing
else, and `check-result.yml`'s job-level `if` holds the skips that are not
failures: `skip-ci`, a branch behind `main`, `should_run: false`, and any need
that outputs `no_verdict: 'true'` (`verify-published-packages.yml`, whose job
answers the diff question itself). They are job-level on purpose: the
aggregate then reports `skipped`, grey and satisfying the required check,
rather than red, and boots no runner. Something else holds the merge in each
case (see "The gate"). That `if` starts with `always()` too, because a called
job with no status function carries an implicit `success()`, and a cancelled
run would then read `skipped` rather than red.

The one skip on the calling job is deliberate: a `labeled` or `unlabeled`
event while `skip-ci` is on. There, leaving `<name>-result / result` as it was
is the point, and it never blocks forever — a commit that reached such an
event has had its aggregate reported by the event that brought it, and taking
the label off reports a new one. "A label event under `skip-ci`" says why.

The step reads the gate's `reused_result` first (`success` passes, `failure`
fails and says to use "Re-run all jobs"), then requires every need but
`gates` to have succeeded, and a red aggregate names the jobs that did not,
with their results. `gates` is left out because a gate that fails to answer
fails open. The need has to be named `gates`, and a caller that names no
other job fails rather than passes.

`check-gates.yml` finds an earlier verdict by the aggregate's job name, so
each caller passes it as `result-job: <name>-result / result`.

### The work

- **`fail-fast: false`** on every matrix. The entries are independent checks;
  letting one cancel the others hides their results, and the aggregate
  reports the cancelled ones as a failure, so the pull request would be
  blocked on an unrelated failure with nothing to read.
- **A matrix job of `code-check.yml` and `style-check.yml` is one
  `pnpm run z:ci-job --build <build> --command <entry>`**
  (`tools/scripts/cmd/ci-job.mts`): what the entry reads is built, the entry
  runs, and a step that changed the tree fails the job, naming itself and the
  files. For a `fix:` or `gen:` entry that is the check: the command rewrites,
  and a dirty tree is the failure. `pnpm run check-all` runs the same entries,
  read from these workflows, through the same runner. `strict-lib-gen.yml` still
  ends in `pnpm run z:assert-repo-is-clean`.
- **A matrix entry is a root script.** `pnpm run check:root:ci-commands` asks
  whether any entry duplicates another and whether any check script runs
  nowhere. What a script body cannot show is declared in `DECLARED_COVERAGE`;
  `UNCOVERED_BY_DESIGN` is a list of claims, each with a reason, not a silencer.
- **`timeout-minutes` is for a command that hangs, not a slow runner.** It is 15
  or less (`pnpm run check:root:workflow-timeouts`), and a check job is kept
  below about 12 minutes at p90 (see the next point), so that a slow runner does
  not reach it; a 10-minute cap was spent once by a `pnpm/action-setup` step
  that took three minutes instead of its usual few seconds. A job whose usual
  length leaves too little of 15 to spare is named in that check with its
  reason, and may declare more.
- **A pull request's checks are few and long, because runner-minutes are what
  the queue spends.** The account runs twenty GitHub-hosted jobs at once, across
  every workflow; above twenty a job waits, and which one is GitHub's choice.
  With `speculate` in `.github/unblock-prs.json` the queue checks the next pull
  requests ahead of their turn, each on its own queue layer ("Triggers" says
  how), so the runners carry several pull requests' jobs at once, and how many
  pull requests merge in an hour is the runners divided by the runner-minutes
  one pull request costs. Every job pays its own setup and build — about 40
  seconds of setup, then about 45 for `ws:build:deps` or 105 for `ws:build` — so
  a job split in two costs that once more and buys nothing but a shorter wait
  for a pull request checked alone, which happens only when the queue is empty.
  So the check workflows run thirteen jobs a pull request (code-check's seven,
  style-check's two, node-version-compatibility's two, strict-lib-gen's two; the
  benchmark's job, about a minute when its baseline hits, is one more): a short
  check rides along with a longer one rather than taking a runner of its own,
  and a job is split only when its p90 comes near the timeout. The longest,
  `ws:fix:lint`, is estimated at about ten minutes, twelve at p90, from the two
  halves it used to be. A new check joins an existing entry; the matrix comment
  in `code-check.yml` has the arithmetic.

### When a check fails

A matrix job of `code-check.yml` or `style-check.yml` whose command or
clean-tree check fails on a pull request, or on a queue layer (where a queued
pull request is checked, diffing against `origin/main`), writes to its job
summary which of its entry's commands `check-changed` would have run for the
same diff (`pnpm run z:check-changed-gap`; its header in
`tools/scripts/cmd/check-changed-gap.mts` says how to read it): planned (the
difference is in how the two ran it), planned over the diff only, left to CI by
design (`CI_ONLY` in `tools/scripts/cmd/check-changed/reach.mts`), in a package
whose code the diff does not touch (a dependent it broke), or not planned for
this diff (the rule in `check-changed/plan.mts` is too narrow). It is a report:
the step runs only after that failure, with `continue-on-error`, and fetches the
base it diffs against itself. `check:root:check-changed-reach` asks the other
half, whether some diff's plan reaches every command CI runs.

A step or job of a check workflow that runs only on a pull request is skipped on
the queue layer as well as on the pull request's own run, which reuses the
layer's verdict, so it runs nowhere: `check:root:queue-layer-conditions` reports
an `if:` that reads `github.event_name == 'pull_request'` and no test that holds
on every layer branch (`startsWith(github.ref, 'refs/heads/queue/')`), unless
the guard lists it with its reason.

### The `dist/` artifact

`release.yml` builds once and hands `dist/` to the job that publishes, as one
tarball:

```bash
find libs apps tools languages -maxdepth 3 -type d -name dist \
  -not -path '*/node_modules/*' -print0 |
  tar --null --files-from - -czf "${RUNNER_TEMP}/dist.tar.gz"
```

One tarball rather than the 3,875 files themselves: the archive is 7 MB
where the tree is 42 MB, and one file is one upload rather than a per-file
walk at both ends. `find` rather than a shell glob, so that a workspace
directory with nothing built leaves `tar` holding no unexpanded pattern. The
depth covers `libs/<name>/dist` and `languages/<language>/<name>/dist` alike,
and `node_modules` is pruned because a dependency's own `dist` is not ours to
carry. `retention-days: 1`, because it is read minutes later and by nothing
else.

The check workflows build in every job instead, each what it reads:
`ws:build:deps` (about 45 seconds) for every check behind
`assert-deps-built --workspace`, and `ws:build` (about 105) for what reads a
package's own `dist/` (`ws:check:dist`, `verify:npm-packages`, `doc`, and an
end-to-end suite run against a site's production build).
`code-check.yml` used to build once and hand its matrix the tarball, which saved
runner time and cost the critical path about three minutes — the gate, then the
build job's setup and build, then each entry's setup and download — while ten
runners waited. That was weighed when the queue checked one pull request at a
time; with the queue checking ahead, runner-minutes are what it spends (see "A
pull request's checks are few and long" under "The work"), so the trade-off
needs measuring again. In `node-version-compatibility.yml`, building on each
Node version is the check itself.

## `skip-ci` and `no-skip-ci-label`

`skip-ci` on a pull request skips the six check workflows; every gated job
carries the label condition and boots no runner. The four
`lint-pull-request.yml` jobs and `verify-lockfile` run regardless (see "A label
event under `skip-ci`"). GitHub has no label-based merge block, so on its own
the label would leave a pull request that nothing checked looking exactly like
one that passed. The block is `skip-ci-label.yml`: it writes a required commit
status, `no-skip-ci-label`, on every head commit, `pending` while the label is
on and `success` without it.

- **It is what holds a labelled pull request.** The aggregates report
  `skipped` on a commit pushed while the label is on (a pull request nobody
  is checking yet should read grey, not broken), and a skipped required check
  is satisfied. Removing the workflow, or its context from
  `repo-settings/rulesets/main.json`, leaves `skip-ci` skipping every check
  with nothing holding the merge.
- **A commit status, not a job's check run.** A check run concludes the way
  the job ends, and none of those is right: skipped and success satisfy the
  check, and failure says something false (a red cross, a `fail` in
  `gh pr checks`, a "workflow run failed" mail on every push). `pending` means
  what is meant: the required check is simply not there yet. It is written
  with `GITHUB_TOKEN`, so it is attributed to the GitHub Actions app, the
  `integration_id` the ruleset pins the context to.
- **Written on every event, label or no label**, because a head commit
  without the status reads "Expected — waiting for status to be reported",
  which blocks forever. For the same reason the workflow has no `branches:`
  filter.
- **Taking the label off fires `unlabeled`**, which is what starts the checks on
  a commit already pushed. `unblock-prs` takes it off only from a pull request
  labelled `merge-queued`, after rebasing, so the matrix runs at most once on
  the head that will merge. Where it checked the pull request ahead of its turn
  on a queue layer, that head has the layer's tree, and the run reuses the
  layer's verdict instead of running the matrix (see "Triggers").
- `skip-ci`, `merge-queued`, `blocks-release` and `auto-rebase` exist only
  on GitHub; the
  strings are in the workflows and `libs/pr-report-core/src/labels.mts`.
  Change them everywhere or nowhere.

### A label event under `skip-ci`

`no-skip-ci-label` is written by a job, so it turns `pending` only once a
runner has booted, tens of seconds after the label goes on; a gated job's
`if` is answered at once. If the `labeled` run reported `skipped`, the label
would replace whatever verdict the aggregates had, red included, with a
satisfied one while `no-skip-ci-label` still said `success` from before it.
For those seconds every required context is met, and a pull request with
auto-merge armed merges. #2141 merged red that way: `unblock-prs` paused it
while the bot that opened it had armed it.

So on a `labeled` or `unlabeled` event while `skip-ci` is on, each check
workflow skips the job that calls its aggregate. A skipped caller reports a
check run under its own name (`code-check-result`) and leaves the required
`code-check-result / result` as it was. Putting the label on, or another
label while it is on, then changes no verdict; only `no-skip-ci-label` moves,
and only towards holding. A run the label event cancels still ends red, since
the aggregate is `always()`, so a pull request whose checks were in flight is
held as well. The other events under the label (`synchronize`, `reopened`)
still report `skipped`: a new head has no verdict to keep, and has no
`no-skip-ci-label` either until one is written, which holds it meanwhile.

What it costs: the red the `opened` run leaves when `open-pr`'s label
cancels it now stays until the label comes off, where the `labeled` run used
to replace it with `skipped`. `pr-report` reads both the same way: `paused`,
its red marked stale.

`lint-pull-request.yml`'s four jobs are their own required contexts, with no
caller to skip, so they carry no `skip-ci` condition and run on every event.
They read the API for seconds, and a job still queued or running is `pending`,
which holds the merge as well. `verify-lockfile.yml`'s one job is the same kind
of context for the same reasons, and does not run on label events at all, so
taking `skip-ci` off would not bring back a run it had skipped.

## `pull_request_target`

Two workflows run on `pull_request_target` rather than `pull_request`:
`skip-ci-label.yml` and `lint-pull-request.yml`. It runs the
workflow file as it exists on the base branch, and its token is the base
repository's whatever the head is. Under `pull_request` the file that runs is
the one on the pull request's own head, so the branch a check is deciding
about would be the branch supplying the decision; and a run from a fork gets a
read-only token whatever `permissions:` says.

The usual hazard, a writable token in a job that runs the branch's code, is
answered the same way in both: **the job checks nothing out from the pull
request and executes nothing from its tree.** It reads the pull request from
the event payload or through the API, and runs only its own `run:` blocks,
which the event resolved from the base branch. A step added to either keeps
to this.

## Jobs that hold a key

Five workflows push, open pull requests, publish or deploy: `pnpm-update.yml`,
`node-support-update.yml`, `release.yml`, `deploy-firestore.yml`,
`deploy-event-schedule-app.yml`. Each runs third-party code somewhere in the
same run (`pnpm install` and every `tsx` invocation execute the dependency tree;
`allowBuilds` gates install scripts, not the import-time code of the toolchain),
and each holds a key that can write. Three rules, and the shapes below are made
of them:

- **A `run:` block is the definition GitHub resolved** when the run started.
  A file in the tree is read at invocation instead, after anything that ran
  earlier could have rewritten it. So a step that must not trust the tree
  stays inline, and uses `git` / `gh` only.
- **Work that needs no token goes before `Generate Token`.** A step placed
  before `pnpm install` runs its script with `node`, never `pnpm run`, which
  installs first.
- **`git config core.hooksPath /dev/null` before committing on a runner.** An
  install script can leave a `.git/hooks/pre-commit` behind, and `git commit`
  would run it with the token already in the step's environment.

The Actions cache is shared by every workflow on a branch, and a key is saved by
whichever job misses it first, which is usually one that has just run the
dependency tree. What a job restores from it is that job's output, crossing the
job boundary as files rather than as an artifact the receiving job only unpacks.
So `release.yml`'s publishing job, which installs the packages it then runs with
`id-token: write`, sets up with `cache: false`.

### The job split

The split is the only thing that actually contains a compromised dependency
rather than raising the bar for it. Anything that runs in a job can rewrite a
file a later step would execute, or append to `$GITHUB_PATH` so that a later
step's `git` or `gh` is something else; `$GITHUB_ENV` / `$GITHUB_PATH` apply
to every later step of the same job. Both reach across steps. Neither reaches
across jobs: the second job gets a fresh runner, a fresh checkout and a fresh
environment, and the only thing that crosses is an artifact, which it applies
or unpacks rather than executes.

So the job that runs the dependency tree holds nothing (`contents: read`,
`persist-credentials: false` on its checkout, so no token is in the git config
either), and the job that holds the key installs nothing and runs nothing out of
the working tree. `pnpm-update.yml` crosses a patch, `release.yml` a `dist/`
tarball.
`node-support-update.yml` is the one that is not split, and says why.
`deploy-firestore.yml` holds a Google Cloud credential. Its rules tests, which
install and build the workspace, run in a job of their own that holds no key,
before the deploy; what crosses is a job output, the names of the apps that
passed, which a deploy job reads as data and only to stand down, so it can
narrow the plan job's matrix but never add to it. The deploy job installs one
app with `--ignore-scripts`, and the one third-party tree it runs is
firebase-tools, the tool that uses the credential.
`deploy-event-schedule-app.yml` does build, so it is split: `build` crosses the
Hosting and Functions output as tarballs, which `deploy` checks before it
unpacks them, and the functions' discovery manifest, so that firebase-tools does
not start the functions with the credential in hand.

### Pushing a branch and opening a pull request

The two update workflows push through a GitHub App installation token
(`actions/create-github-app-token`, narrowed with `permission-*` inputs, which
can only narrow what the App already holds), so that the push triggers the
`pull_request` workflows and the repository owner can auto-merge. Both:

- **Reuse one fixed branch name** (`chore/pnpm-update`,
  `chore/node-support-update`), rebuilt from `main` and force-pushed every run
  that has an update, so there is only ever one open. A run of either that finds
  nothing to change pushes nothing, and closes the open pull request instead
  (`close-obsolete`), since `main` already has what it carries.
- **Authenticate the push inline** (`https://x-access-token:${GH_TOKEN}@…`),
  so the token is never written to git config.
- **Name the lease.** `--force-with-lease` with no value compares against the
  remote-tracking ref, and `actions/checkout` configures a fetch refspec for
  the default branch alone, so the branch has none and the push is rejected
  as "stale info" every run after the first. `git ls-remote` supplies the
  expected value; an empty one means "expect it not to exist". Two steps
  rather than a pipeline, so that a failed `ls-remote` stops the job instead
  of yielding an empty lease.
- **Ask `gh pr view` for an `OPEN` pull request** before creating one. By
  branch name alone it also finds a merged one, and the branch is recreated
  every run.
- **Say which label they open with.** `pnpm-update.yml` opens with
  `merge-queued` and arms auto-merge: nobody reviews it, and `unblock-prs`
  rebases it when `main` moves. `node-support-update.yml` opens with
  `skip-ci` and arms auto-merge: held until a person adds `merge-queued`, as
  `pnpm run open-pr` leaves a session's pull request (unarmed — `unblock-prs`
  arms that one when it picks it). `release.yml` puts
  `skip-ci` on the version pull request on every run. Which label a bot opens
  with is the whole statement of whether it is queued.

## Action pins and the lockfile

**A `uses:` names a full version (`actions/checkout@v7.0.1`), and
`.github/workflows/actions.lock` records the commit it ran as.** The lockfile is
GitHub's (`gh actions-lock`, github/gh-actions-lock): it holds, per workflow,
every action the workflow uses, directly or through a composite action, and per
action the commit, the ref it was resolved from, and the owner and repository
ids. The runner checks each step's action against it at job start, so a tag
moved upstream, a commit no longer reachable from its tag, or a repository that
changed hands fails the job rather than running what nobody reviewed. That is
what the SHA in each `uses:` used to do, and the reason the repository's
"Require actions to be pinned to a full-length commit SHA"
(`repo-settings/actions-settings/`) still holds: GitHub counts the lockfile as
the pin for a workflow it covers. Never edit it by hand.

- **A change to any `uses:`, a new workflow or a new composite action is
  followed by `gh actions-lock`** (the extension, installed at the release
  `.github/actions/install-gh-actions-lock` names), and the lockfile is
  committed with it. `verify-lockfile.yml` runs `gh actions-lock --verify` on
  every pull request and fails, naming the workflow, when the two disagree;
  `gh actions-lock --verify-local` is the offline half of it.
- **`update-actions` moves the versions within their major** and regenerates the
  lockfile in the same run; a major waits for a human (see "Dependencies" in
  `CLAUDE.md`). A pin the setup action already carries belongs there, not in a
  workflow (see "Setup").
- **A local action is `$/…`** (see "Setup"); a reusable workflow of this
  repository stays `./.github/workflows/…`, which the lockfile covers as a
  workflow of its own. A reusable workflow of another repository is not locked;
  none is used.
- **The extension's own version moves by hand**: no scheduled job reads its
  releases. Take a release older than `minimumReleaseAge`, as everything else
  here is held to.
- **The lockfile is owned in `.github/CODEOWNERS`** through
  `.github/workflows/`, which is what GitHub's guidance asks: a changed commit
  is code the workflows will run.

## Expressions

**`&&` and `||` join booleans, and nothing else.** An expression that
chooses a value is `case(pred1, val1, …, default)`, not
`cond && a || b`, which silently yields `b` whenever `a` is empty, `0` or
`false`. The same goes for the fallback that `a || b` reads as:

- **Choose by the event** when the value depends on it:
  `case(github.event_name == 'pull_request', github.event.pull_request.head.sha, github.sha)`.
  The event name has to be one the workflow triggers on, or the predicate
  is a constant; `check:root:workflow-event-name` holds every such
  comparison to the triggers (see "Concurrency").
- **Test a value that may be missing with `!= ''`**:
  `case(github.event.repository.default_branch != '', github.event.repository.default_branch, 'main')`.
  A missing property is `null`, and `null != ''` is `false`, because a
  comparison between a string and `null` converts both to numbers, and both
  convert to `0`.

Nothing checks this; a review does.

## Adding or changing a workflow

- **A new job or workflow that should block a merge** needs its aggregate
  context added to `repo-settings/rulesets/main.json`, or it runs and blocks
  nothing; a new matrix entry needs nothing. `repo-settings/README.md` has
  that, renaming a context, and the bypass.
- **A check workflow calls `check-gates.yml`** with the caller shape above,
  picks its `diff-scope`, and ends in a call to `check-result.yml` (see "The
  aggregate job"). Its verdict is reused by tree, so a result that depends on
  anything else must skip the aggregate with `no_verdict` rather than
  conclude (see "Reusing a verdict").
- **Local guards that read this directory**: `check:root:actionlint`,
  `check:root:ci-commands`, `check:root:workflow-event-name`,
  `check:root:node-support`, `check:root:restart-unblock-prs-paths`,
  `check:root:dispatch-inputs`. `fmt` and `check:cspell` read it too; CI itself
  runs nothing on a workflow change until the pull request runs.
  `check:root:actionlint` also lints the composite actions' steps, which
  actionlint does not read on its own, and reads a `$/` action as `./`, the only
  form the pinned actionlint knows. It downloads the actionlint and shellcheck
  that `tools/configs/release-binaries.json` pins, so it needs nothing
  installed; `pnpm-update.yml` moves those pins.
- **`.github/workflows/` and `.github/actions/` are owned in
  `.github/CODEOWNERS`**, which `lint-pull-request.yml`'s `code-owners` job
  enforces in the ruleset's place: a change there by anyone but the owner waits
  for the owner's approval, so a bot's pull request that touches either does not
  auto-merge, while the owner's own needs no bypass — unless someone else pushed
  to its branch, which the job reads from the repository's activity. The action
  pins and the lockfile are the one thing a bot writes there.
- **A changed `uses:` is followed by `gh actions-lock`** (see "Action pins and
  the lockfile").
