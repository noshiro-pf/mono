# `pr-merge-queue`

A merge queue run by labels and `Merge-After:` trailers, as command-line
tools: open a pull request into the queue, land the queued ones one at a time,
and report where every open one stands. What the queue decides is
[`pr-report-core`](../pr-report-core/README.md); this package reads GitHub,
runs git and acts on it.

```sh
npm add --save-dev pr-merge-queue
```

The commands read the repository from `origin` in the current directory and
authenticate with `GH_TOKEN` or `GITHUB_TOKEN`, falling back to `gh auth token`
when neither is set.

| command                 | what it does                                                                         |
| :---------------------- | :----------------------------------------------------------------------------------- |
| `open-pr`               | pushes the current branch and opens its pull request, held by `skip-ci`              |
| `unblock-prs`           | lands the `merge-queued` pull requests one at a time, in the order they declare      |
| `pr-report`             | reports every open pull request: merge order, required checks, how far behind        |
| `claim-pr`              | claims a pull request `unblock-prs` set aside, so that nothing else touches it       |
| `push-fixed-pr`         | pushes the fix to a pull request you claimed and hands it back to the queue          |
| `report-unowned-prs`    | files an issue for each queued pull request that everyone is waiting on others for   |
| `start-issue`           | labels an issue `in-progress` before work starts, refusing one someone is already on |
| `run-unblock-prs-skill` | runs the `unblock-prs` skill without a person, on the Claude API, when it has work   |

Each one prints its options with `--help`. How the queue reads a pull request
(the labels, `Merge-After:`, stacks) and what `unblock-prs` does at each step
are in [`src/unblock-prs/README.md`](./src/unblock-prs/README.md);
`open-pr` and `pr-report` have their own in
[`src/open-pr/README.md`](./src/open-pr/README.md) and
[`src/pr-report/README.md`](./src/pr-report/README.md).

## Setting up a repository

### What the repository needs

- **Labels.** `merge-queued` (queue this pull request), `skip-ci` (run no
  checks on it yet) and `auto-rebase` (keep it on the default branch while it
  waits). `blocks-release` is needed only with a changesets version pull
  request: the release waits for every open pull request carrying it.
  `priority:high` and `priority:low` order the queue and are optional.
  `in-progress` and `planned`, which `start-issue` puts on and takes off,
  are optional too: they mark an issue as started, or as meant to be next.
- **Merging.** Squash merging and auto-merge allowed in the repository's
  settings, and a ruleset (or branch protection rule) on the default branch
  that requires status checks with "Require branches to be up to date before
  merging". The queue rebases each pull request onto the tip, arms its
  auto-merge, and lets GitHub merge it once those checks pass; it never
  merges by itself.
- **Workflows that `skip-ci` holds.** Every workflow that runs a check skips
  its jobs while the pull request carries `skip-ci`
  (`!contains(github.event.pull_request.labels.*.name, 'skip-ci')`) and
  triggers on `labeled` and `unlabeled`, so taking the label off is what
  starts them. A skipped job satisfies a required check, so something has to
  hold the merge while the label is on: a required commit status that is
  `pending` while the label is there, as this repository's
  [`skip-ci-label.yml`](https://github.com/noshiro-pf/mono/blob/main/.github/workflows/skip-ci-label.yml) writes.
- **A token** whose account can push to the repository, label and comment on
  pull requests, file issues and re-run workflows, in `GH_TOKEN` or
  `GITHUB_TOKEN` (or `gh auth token`). As a fine-grained token, that is
  read and write on **Contents**, **Pull requests**, **Issues** and
  **Actions**, and on **Workflows** too when the pull requests it rebases
  change `.github/workflows/`; as a classic token, `repo` and `workflow`.
  **The worker and the skill use the same account**: who owns a pull request
  and who claimed it are read from the comments that account wrote, so a
  token of another account sees nothing to do.
- **Optionally, `.github/unblock-prs.json`**, which tells `unblock-prs`
  which failing checks it may fix by itself, and how: the commands that
  regenerate or reformat what a check found stale, run and pushed without a
  person. Its schema is
  [`src/unblock-prs/config.schema.json`](./src/unblock-prs/config.schema.json).
  Without it, every failing check is set aside for the skill or a person.
  This repository's own
  [`.github/unblock-prs.json`](https://github.com/noshiro-pf/mono/blob/main/.github/unblock-prs.json)
  is an example.
- **Optionally, `.github/unblock-prs.md`**, the guide the skill reads (see
  "The Claude Code plugin").

The checks a pull request has to pass are what GitHub's rules require on the
default branch, or what `repo-settings/rulesets/main.json` declares where a
repository keeps its rulesets as code.

### How a pull request goes through

1. **`open-pr`** pushes the branch and opens the pull request ready for
   review, with `skip-ci` and `auto-rebase` on. `--base <branch>` stacks it
   on another open pull request; `--merge-after <n>` writes `Merge-After: #n`
   into the description. While `skip-ci` is on, the checks you ran locally
   are the only ones it gets, so say in the description which.
2. **`merge-queued`**, added by whoever decides it is ready, queues it.
3. **`unblock-prs`**, left running, picks one queued pull request at a time
   in the declared order: rebases it onto the tip, arms auto-merge, takes
   `skip-ci` off so the checks run once, and watches them. GitHub merges it
   when they pass. A failure it cannot fix by itself — or a rebase that
   conflicts — is **set aside** with a comment saying why, and the queue
   moves on.
4. **The skill** (below) or a person fixes what was set aside: `claim-pr`
   first, then `push-fixed-pr`, which hands it back to the queue.

### Running the worker

`unblock-prs` is meant to be left running, in a terminal of its own, on a
machine with a clone of the repository and the token. Run it from the
repository's root, through its package manager:

```sh
npx unblock-prs --dry-run --once   # what it would do, changing nothing
npx unblock-prs                    # run until Ctrl+C
```

It rebases and fixes in throwaway `git worktree`s, so the checkout it runs
from is never touched and you can keep working in it. It surveys every 30 seconds while the queue
moves and every 5 minutes once it sits still; one Ctrl+C finishes the
current step and stops. It arms auto-merge through GitHub's GraphQL API, so
run it where that is reachable. `--help` lists the options;
[`src/unblock-prs/README.md`](./src/unblock-prs/README.md), "Options", says
what each does.

[GitHub Pull Requests Manager](https://noshiro-pf.github.io/mono/pr-manager/)
shows all of it on one page, on any repository that has a `merge-queued`
label: the queue in its order, what was set aside and why, who claimed what,
and whose turn each pull request is. `pr-report --format json` prints the same
in a terminal.

## The Claude Code plugin

`unblock-prs` sets aside what it cannot land by itself — a failing check, a
rebase that conflicted — for the `unblock-prs` skill to fix. The skill ships as
a Claude Code plugin from this repository's marketplace:

```text
/plugin marketplace add noshiro-pf/mono
/plugin install pr-merge-queue@noshiro-pf
```

Then, in a Claude Code session in a clone of the repository, run
`/pr-merge-queue:unblock-prs` for one round, or
`/loop /pr-merge-queue:unblock-prs` to keep it going beside the worker. The
session needs what the worker needs: the package installed in the
repository, since the skill runs its commands (`npx claim-pr …`, or the
repository's own scripts for them), and the worker's token in `GH_TOKEN`. The
skill does not use the `gh` CLI.

The skill reads the repository's own instructions first (`CLAUDE.md`,
`AGENTS.md`), and `.github/unblock-prs.md` if there is one. Write there what
the skill cannot guess:

- how each required check is reproduced locally, and what has to run first
  (an install, a build);
- how a fix is committed (an amend onto one commit, a formatter to run);
- which branches are generated rather than written, such as a dependency
  update, and how one is generated again after a conflict.

This repository's
[`.github/unblock-prs.md`](https://github.com/noshiro-pf/mono/blob/main/.github/unblock-prs.md)
is an example.

### Without a session, on the Claude API

`/loop` needs a Claude Code session left open, and spends a turn of the model
on every look at the queue. `run-unblock-prs-skill` runs the same skill from
a terminal beside the worker, billed to an API key:

```sh
export ANTHROPIC_API_KEY=…     # a key of its own, in a workspace with a spend limit
npx run-unblock-prs-skill --max-budget-usd 5 --dry-run --once  # what it would run
npx run-unblock-prs-skill --max-budget-usd 5                   # run until Ctrl+C
```

It reads the queue the way step 1 of the skill does, with no model, and
starts `claude -p` on the skill only when a pull request is the skill's and
nobody has claimed it: one pull request per session, in the skill's order,
the next as soon as one ends, and another look every 10 minutes
(`--interval-min`) once there is none. It tells the session which pull
request, the claimant to use, and a directory for its worktrees under
`~/.local/state/unblock-prs`, where the worker puts its own.
It files the pull requests nobody owns with `report-unowned-prs` itself. A
pull request a session ended on without fixing — given up, out of budget,
failed or stopped after spending — is not handed to another until its head
or the reason it was set aside changes, so none is paid for twice as it
stands; restarting the command tries it once more. A session whose result
says it failed before spending anything is tried again on the next look
(the first one failing that way stops the command, since the key is the
likeliest cause); one that ended with no result counts as tried, since what
it spent is unknown.

- **It runs only on the API key.** It refuses to start without
  `ANTHROPIC_API_KEY`. It leaves out of the session's environment what Claude
  Code would use before the key: `ANTHROPIC_AUTH_TOKEN`,
  `CLAUDE_CODE_OAUTH_TOKEN`, and the switches to Bedrock, Vertex and Foundry,
  and blanks them in settings of its own as well, in case a settings file's
  `env` sets one. It also stops the session at its first event if Claude
  Code reports any other credential, or does not know the skill.
- **`--max-budget-usd` is required.** It caps each session, which is one
  pull request, and is passed to `claude --max-budget-usd`. At most three
  sessions run on one pull request while the command runs — a fix that is
  pushed and fails again starts another. After that it is not handed on
  again until the command restarts; its log says so, and nothing else
  does. `--model` picks the model.
- **Nobody is asked anything, and nothing is approved.** The session runs
  with `--permission-mode dontAsk`, may read and edit files and run any
  `Bash`, and has the worker's token and the API key in its environment. It
  reads text other people wrote — diffs, CI logs, comments — and acts on it
  with no person in between. Its denial of `gh` and `git push` is a prefix
  rule against a slip, not a boundary (`git -C <dir> push` passes it). What
  bounds it is the token's permissions, the key's workspace spend limit, and
  the machine it runs on: give it a token with no more than the worker
  needs, a key of its own, and a machine or container with nothing else
  worth reaching. Rules under `deny` in the repository's
  `.claude/settings.json` still apply, once the folder has been trusted in an
  interactive session; Claude Code ignores that file otherwise.
- It needs what the session would: `claude` on `PATH`, the package
  installed, the worker's token in `GH_TOKEN`, and the skill. It uses
  `unblock-prs` when `.claude/skills/unblock-prs/` exists, and the plugin's
  `pr-merge-queue:unblock-prs` otherwise; `--skill` names another.
- Each session's cost and id are logged; `claude --resume <id>` opens it
  afterwards. A SIGTERM is passed on to the running session; Ctrl+C reaches
  it from the terminal. A
  claim the session left standing, because it ran out of budget or was
  stopped, is released when it ends — unless a second signal stops this
  command at once, as it does the worker, when the claim lapses after two
  hours instead.

The plugin's version is the package's, so the skill matches the commands of
the same version. When you update the package, update the plugin too:
`/plugin marketplace update noshiro-pf`, then `/plugin` to see the installed
version.

## As a library

What the commands share is exported too, for scripts that talk to the same
repository the same way.

```ts
import { sh } from 'pr-merge-queue';

// Every branch name and path the commands hand to git is quoted for a
// POSIX shell, a single quote included.
assert.strictEqual(sh("it's"), String.raw`'it'\''s'`);
```

## License

Apache-2.0
