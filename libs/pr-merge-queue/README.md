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

| command              | what it does                                                                       |
| :------------------- | :--------------------------------------------------------------------------------- |
| `open-pr`            | pushes the current branch and opens its pull request, held by `skip-ci`            |
| `unblock-prs`        | lands the `merge-queued` pull requests one at a time, in the order they declare    |
| `pr-report`          | reports every open pull request: merge order, required checks, how far behind      |
| `claim-pr`           | claims a pull request `unblock-prs` set aside, so that nothing else touches it     |
| `push-fixed-pr`      | pushes the fix to a pull request you claimed and hands it back to the queue        |
| `report-unowned-prs` | files an issue for each queued pull request that everyone is waiting on others for |

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
  `GITHUB_TOKEN` (or `gh auth token`). `unblock-prs` arms auto-merge through
  GitHub's GraphQL API, so run it where that is reachable.
- **Optionally, `.github/unblock-prs.json`**, which tells `unblock-prs`
  which failing checks it may fix by itself, and how: the commands that
  regenerate or reformat what a check found stale, run and pushed without a
  person. Its schema is
  [`src/unblock-prs/config.schema.json`](./src/unblock-prs/config.schema.json).
  Without it, every failing check is set aside for the skill or a person.

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

Then run `/pr-merge-queue:unblock-prs` beside the worker, or under `/loop`.
The skill reads the repository's own instructions first, and
`.github/unblock-prs.md` if there is one: how its checks are reproduced, and
which branches it generates rather than writes. The plugin's version is the
package's, so the skill matches the commands of the same version.

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
