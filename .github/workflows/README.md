# Workflows

The design the workflows in this directory share. A comment inside a workflow
says only what is particular to that workflow; whatever two or more of them
have in common is written here once, and the workflow points at the section.
`CLAUDE.md` ("CI") holds the rules a session has to follow and points here for
the reasons.

This file is beside the workflows rather than at `.github/README.md` because
GitHub shows a `.github/README.md` in place of the root one.

## Inventory

| Workflow                         | Runs on                                        | Reports a required context              |
| :------------------------------- | :--------------------------------------------- | :-------------------------------------- |
| `code-check.yml`                 | pull requests; `push` to `main` (coverage)     | `code-check-result`                     |
| `style-check.yml`                | pull requests                                  | `style-check-result`                    |
| `strict-lib-gen.yml`             | pull requests                                  | `strict-lib-gen-result`                 |
| `node-version-compatibility.yml` | pull requests                                  | `test-node-versions-result`             |
| `verify-published-packages.yml`  | pull requests                                  | `verify-published-result`               |
| `check-gates.yml`                | `workflow_call`, from the five above           | none; it is the gate the five share     |
| `skip-ci-label.yml`              | `pull_request_target`                          | the `no-skip-ci-label` commit status    |
| `lint-pull-request.yml`          | `pull_request_target`                          | its three jobs, by name                 |
| `release.yml`                    | `push` to `main`                               | none                                    |
| `pnpm-update.yml`                | schedule                                       | none; opens `chore/pnpm-update`         |
| `node-support-update.yml`        | schedule                                       | none; opens `chore/node-support-update` |
| `pr-report.yml`                  | pull request events, `push`, `workflow_run`, … | none; writes `data/pr-report`           |
| `deploy-pages.yml`               | `push` to `main`                               | none                                    |
| `synstate-benchmark.yml`         | `push` to `main`, pull requests, path-filtered | none; a measurement, not a verdict      |

The required contexts are listed in `repo-settings/rulesets/main.json`. Every
one of them is either an aggregate job (see "The aggregate job") or a job that
runs no repository code; none is a job that does the work.

## The check workflows

Five workflows check a pull request: `code-check.yml`, `style-check.yml`,
`strict-lib-gen.yml`, `node-version-compatibility.yml` and
`verify-published-packages.yml`. They have one shape:

```text
gates  (check-gates.yml, reusable)
  └─ the work: a matrix, or one job
       └─ <name>-result  (the one required context)
```

Everything in this section is that shape. A workflow that departs from it says
so in its own comments.

### Triggers

```yaml
on:
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
  verdict is what makes that affordable.
- **No `edited`, no `issue_comment`.** Such a run cancels the one in progress
  (see "Concurrency") and its skipped aggregate supersedes the last verdict.
- **No `push`, not even for `main`.** The `main` ruleset accepts changes
  through pull requests only and requires the branch to be up to date
  (`strict_required_status_checks_policy`), so the squash commit a merge makes
  has the same tree as the pull request's head, which every check has already
  run on. Running the matrix on `main` cost 108 runner-minutes per merge to
  confirm what the pull request had confirmed. The one exception is
  `code-check.yml`'s `coverage-main` job, because Codecov compares a pull
  request's coverage against the base commit's report and the base commit is
  on `main`. Nothing else runs on `main`, so after a bypass merge the
  workflows are run by hand.
- **`workflow_dispatch`** is how the checks are asked for from the Actions
  tab. Such a run is exempt from every gate: there is no pull request to be
  behind anything, and no verdict is reused.
- **No `paths` filter.** A workflow a path filter skips reports no status at
  all, and a required context that never arrives blocks the merge forever.
  The diff question is answered by the gate, after the workflow has started.
  `synstate-benchmark.yml` carries one because it reports no required
  context; a benchmark on a shared runner is a measurement, not a verdict.

### Concurrency

```yaml
concurrency:
    group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
    cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

One run per pull request: a push cancels the run still going for the previous
one, so a branch pushed to five times in a row costs one CI result rather than
five. Nothing is lost by that on a pull request branch, because the gate diffs
against `origin/main` and the newer run covers every commit the cancelled one
would have.

`cancel-in-progress` is an expression rather than `true` so that a
`workflow_dispatch` or `push` run is left alone. On `main`, `code-check.yml`'s
gate diffs against `github.event.before`, so each push's run covers only that
push; cancelling the run for X when Y lands would leave X's diff checked by
nothing. The event name in that expression has to be one the workflow
triggers on, or the expression is a constant and `cancel-in-progress` is
silently off; `pnpm run check:root:workflow-event-name` holds the two in
agreement, and a workflow whose trigger moves (`pull_request_target`) moves
the name with it.

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
- **`packages: read`** wherever `setup-node` points the `@noshiro-pf` scope at
  GitHub Packages (`registry-url` / `scope`), which the install then reaches
  with `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}`.
- **A caller's job-level `permissions` on the `gates` job** restating what
  `check-gates.yml` declares (`actions`, `contents`, `packages`: read). A
  caller's job-level `permissions` is the ceiling for the workflow it calls,
  and permissions can be reduced along the chain, never elevated, so the
  top-level `{}` would otherwise leave the called workflow unable to check
  out.
- **`permissions: {}` on the aggregate**, which reads `needs.*.result` and
  echoes.

### Checkout

```yaml
- uses: actions/checkout@…
  with:
      ref: ${{ github.event.pull_request.head.sha || github.sha }}
```

The branch tip, not the merge commit GitHub synthesises for a `pull_request`
event. The checks assert properties of the branch itself, the merge ref does
not even exist while the pull request has a conflict, and the gate's diff has
to be the diff the checks then run against. On a `push` or
`workflow_dispatch` run this falls back to the event's own commit.

### Setup

Every job that runs repository code has the same four steps: checkout,
`pnpm/action-setup`, `actions/setup-node` with
`node-version-file: 'package.json'` and `cache: 'pnpm'`, and
`pnpm install --frozen-lockfile`. The Node version is therefore `volta.node`,
which `check:root:node-support` holds equal to `targets.current` in
`tools/configs/node-support.json`; the two workflows that pin another version
(`node-version-compatibility.yml`, `node-support-update.yml`) resolve it from
that file rather than writing it into the workflow.

### The gate: `check-gates.yml`

The two questions each check workflow has to answer before it is worth booting
a matrix: is the pull request's branch up to date with the base branch, and
does its diff touch anything the workflow reads? A third follows from the
first: has an earlier run already reached a verdict on this head commit? One
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
        packages: read
    with:
        diff-scope: code # or style, strict-lib, none
        result-job: code-check-result

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
  labelled pull request boots no runner anywhere. Being a draft is
  deliberately not one of these states.
- **A branch behind `main`**, the state the pull request page calls "This
  branch is out-of-date with the base branch". Such a branch cannot be
  merged: the ruleset's `strict_required_status_checks_policy` requires the
  checks to pass on a head that already contains `main`'s tip, and updating
  the branch fires `synchronize` and runs everything again on the commit that
  will actually be merged. A run before that update is a run whose result
  nothing can use. Only the default branch carries the strict policy, so a
  pull request onto any other branch is checked as it is.
- **A diff that touches nothing the workflow reads**, decided by
  `check-should-run` from `ts-repo-utils` against one of the three
  `z:check-should-run:*` ignore lists in the root `package.json`.
- **A verdict already reached on this head commit**, which the work would
  only repeat.

The skipped conclusion satisfies a required status check in every case, so
each needs something else to hold the merge, and each has one. Behind:
the ruleset. `skip-ci`: the `no-skip-ci-label` status. Nothing relevant in
the diff: nothing would have read those paths anyway, which is the one case
where "not checked" is the right answer. A reused verdict: the aggregate
reports that verdict rather than `skipped`.

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

The three lists are JSON in the root `package.json` and can carry no comment
of their own, so what they mean is here:

- **A path goes on a list only when no command that workflow runs reads it.**
  `articles/` is not on the style list because Prettier formats it; `**.md`
  is not on the strict-lib list because the changelogs are copied into the
  bundles. Adding a path wrongly fails nothing; it makes the workflow skip a
  diff it was the one thing meant to judge.
- **`code`** (`code-check.yml`, `node-version-compatibility.yml`) drops
  `experimental/`, `docs/`, `**.md`, `**.txt` and the style tools'
  configuration.
- **`style`** (`style-check.yml`) drops `experimental/` and nothing else:
  three matrix entries check markdown, `ws:doc` regenerates the package
  READMEs, and `ws:check:ext` globs every file under the directories it is
  given, so `code` would skip that workflow exactly when it should fail. This
  is why a guard whose input is a document is a `check:prose:*` script run
  there, and a `check:root:*` script, run in `code-check.yml`, is skipped by
  the very diff it judges (see "Commands" in `CLAUDE.md`).
- **`strict-lib`** (`strict-lib-gen.yml`) is a list of its own; the workflow
  explains each entry.
- **`none`** (`verify-published-packages.yml`) skips the diff question
  altogether, for a workflow that gates itself in shell; the gate then costs
  one API call and no checkout.

#### Reusing a verdict

Every check job reads the pull request's head commit and nothing else, so a
second run on the same head can only repeat the first one's verdict, pass or
fail. Such runs are common: any label event (`merge-queued`, `bug`, …),
`reopened`, and a `skip-ci` taken off a commit that was checked before it went
on. So when an earlier run of the calling workflow on this head reached a
verdict, its aggregate job's conclusion is handed back as `reused_result`, the
caller skips its work, and its aggregate reports that conclusion, green or
red, never skipped.

What makes "same head" enough is the branch question: the lookup only happens
on an up-to-date branch of the default branch, where the commit that would be
merged has the head's tree, workflow files included. Deliberately not reused:
a cancelled run (its aggregate runs under `always()` and reads red, but says
nothing about the commit); a skipped aggregate; anything when this is a re-run
(`run_attempt` > 1) or not a `pull_request` event. "Re-run all jobs" and
`workflow_dispatch` are how a person asks for the checks to actually run.
"Re-run failed jobs" is not enough after a reused failure: it keeps the gate's
outputs from the first attempt. Where several earlier runs have a verdict,
the one whose aggregate completed last wins, so a flake re-run to green
supersedes the red a later run reused from it.

#### Why a workflow of its own

The answers need `pnpm install` (the gate is a program, not a glob match), so
they cannot live in a job-level `if`, which GitHub evaluates from the event
payload alone; hence a job that computes them and a caller that reads its
outputs. `workflow_call` rather than the same shell copied into each
workflow, because there is one answer to give and one place to change it.

This used to be a step inside every job, which meant each of the 22 matrix
runners across three workflows booted, checked out and installed dependencies
(about 45 seconds apiece) before finding out it had nothing to do. It could
only move to job level once the `*-result` aggregates became the required
contexts: a skipped matrix job produces one check run named after the job,
never the matrix contexts, and while those were required a job-level skip
would have left them "Expected", blocking forever.

### The aggregate job

```yaml
<name>-result:
    needs: [gates, the-work]
    if: >-
        always() &&
        (github.event_name != 'pull_request' || !contains(github.event.pull_request.labels.*.name, 'skip-ci')) &&
        needs.gates.outputs.branch_up_to_date != 'false' &&
        needs.gates.outputs.should_run != 'false'
    permissions: {}
```

The one required status check of each check workflow. The jobs that do the
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

The clauses after `always()` are the skips that are not failures, and they are
job-level on purpose: the aggregate then reports `skipped` for them, grey and
satisfying the required check, rather than red. Something else holds the merge
in each case (see "The gate"). `should_run` is among them only in the
workflows that ask the diff question.

The step itself reads `REUSED_RESULT` first (`success` passes, `failure`
fails and says to use "Re-run all jobs"), then `RESULT`. A red aggregate does
not name what failed; open the run.

### The work

- **`fail-fast: false`** on every matrix. The entries are independent checks;
  letting one cancel the others hides their results, and the aggregate
  reports the cancelled ones as a failure, so the pull request would be
  blocked on an unrelated failure with nothing to read.
- **`pnpm run z:assert-repo-is-clean`** after the command. For a `fix:` or
  `gen:` entry that is the check: the command rewrites, and a dirty tree is
  the failure.
- **A matrix entry is `pnpm run <script>`.** `pnpm run check:root:ci-commands`
  asks whether any entry duplicates another and whether any check script runs
  nowhere. What a script body cannot show is declared in `DECLARED_COVERAGE`;
  `UNCOVERED_BY_DESIGN` is a list of claims, each with a reason, not a
  silencer.
- **`timeout-minutes` is for a command that hangs, not a slow runner.** The
  matrix jobs of `code-check.yml` and `style-check.yml` are at 25; a 10-minute
  cap was spent once by a `pnpm/action-setup` step that took three minutes
  instead of its usual few seconds, cancelling `ws:doc` before it ran.

### The `dist/` artifact

`code-check.yml` and `release.yml` build once and hand `dist/` to the jobs
that need it, as one tarball:

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

Two workflows deliberately keep building per job. In
`node-version-compatibility.yml`, building on each Node version is the
check. In `style-check.yml` only two of the nine entries build at all, so a
job to serve them would cost more than it saves.

## `skip-ci` and `no-skip-ci-label`

`skip-ci` on a pull request skips the five check workflows and the three
`lint-pull-request.yml` jobs; every gated job carries the label condition and
boots no runner. GitHub has no label-based merge block, so on its own the
label would leave a pull request that nothing checked looking exactly like one
that passed. The block is `skip-ci-label.yml`: it writes a required commit
status, `no-skip-ci-label`, on every head commit, `pending` while the label is
on and `success` without it.

- **It is the only thing that holds a labelled pull request.** The
  aggregates deliberately report `skipped` while the label is on (a pull
  request nobody is checking yet should read grey, not broken), and a skipped
  required check is satisfied. Removing the workflow, or its context from
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
- **Taking the label off fires `unlabeled`**, which is what starts the checks
  on a commit already pushed. `unblock-prs` takes it off only from a pull
  request labelled `merge-queued`, after rebasing, so the matrix runs once on
  the head that will merge.
- `skip-ci`, `merge-queued` and `blocks-release` exist only on GitHub; the
  strings are in the workflows and `tools/scripts/cmd/unblock-prs/`. Change
  them everywhere or nowhere.

## `pull_request_target`

Three workflows run on `pull_request_target` rather than `pull_request`:
`skip-ci-label.yml`, `lint-pull-request.yml` and `pr-report.yml`. It runs the
workflow file as it exists on the base branch, and its token is the base
repository's whatever the head is. Under `pull_request` the file that runs is
the one on the pull request's own head, so the branch a check is deciding
about would be the branch supplying the decision; and a run from a fork gets a
read-only token whatever `permissions:` says.

The usual hazard, a writable token in a job that runs the branch's code, is
answered the same way in all three: **the job checks nothing out from the
pull request and executes nothing from its tree.** It reads the pull request
from the event payload or through the API, and runs only its own `run:`
blocks, which the event resolved from the base branch. `pr-report.yml` does
check out and install, and pins the checkout to the default branch for that
reason. A step added to any of them keeps to this.

## Jobs that hold a key

Four workflows push, open pull requests or publish: `pnpm-update.yml`,
`node-support-update.yml`, `release.yml`, `pr-report.yml`. Each runs
third-party code somewhere in the same run (`pnpm install` and every `tsx`
invocation execute the dependency tree; `allowBuilds` gates install scripts,
not the import-time code of the toolchain), and each holds a key that can
write. Three rules, and the shapes below are made of them:

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
`persist-credentials: false` on its checkout, so no token is in the git
config either), and the job that holds the key installs nothing and runs
nothing out of the working tree. `pnpm-update.yml` crosses a patch,
`release.yml` a `dist/` tarball, `pr-report.yml` the report files.
`node-support-update.yml` is the one that is not split, and says why.

### Pushing a branch and opening a pull request

The two update workflows push through a GitHub App installation token
(`actions/create-github-app-token`, narrowed with `permission-*` inputs, which
can only narrow what the App already holds), so that the push triggers the
`pull_request` workflows and the repository owner can auto-merge. Both:

- **Reuse one fixed branch name** (`chore/pnpm-update`,
  `chore/node-support-update`), rebuilt from `main` and force-pushed every
  run, so a run that lands no update leaves no stale pull request behind and
  there is only ever one open.
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
  `pnpm run open-pr` leaves a session's pull request. `release.yml` puts
  `skip-ci` on the version pull request on every run. Which label a bot opens
  with is the whole statement of whether it is queued.

## Adding or changing a workflow

- **A new job or workflow that should block a merge** needs its aggregate
  context added to `repo-settings/rulesets/main.json`, or it runs and blocks
  nothing; a new matrix entry needs nothing. `repo-settings/README.md` has
  that, renaming a context, and the bypass.
- **A workflow behind a required context** is also named in the
  `workflow_run` list of `pr-report.yml`, or its result reaches the report
  late; `pnpm run check:root:workflow-run-names` checks that every name there
  is a workflow that exists.
- **A check workflow calls `check-gates.yml`** with the caller shape above,
  picks its `diff-scope`, and ends in an aggregate.
- **Local guards that read this directory**: `check:root:ci-commands`,
  `check:root:workflow-event-name`, `check:root:workflow-run-names`,
  `check:root:node-support`. `fmt` and `check:cspell` read it too; CI itself
  runs nothing on a workflow change until the pull request runs.
- **`.github/workflows/` is owned in `.github/CODEOWNERS`**, so a change here
  waits for the owner's review, and a bot's pull request that touches it does
  not auto-merge. The action pins are the one thing a bot writes here.
- **Action pins are SHAs with a version comment**, moved by `update-actions`
  within their major; a major waits for a human (see "Dependencies" in
  `CLAUDE.md`).
