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

## Configuration

`unblock-prs` reads `.github/unblock-prs.json` at the root of the repository,
if there is one; its schema is
[`src/unblock-prs/config.schema.json`](./src/unblock-prs/config.schema.json).
The checks a pull request has to pass are what GitHub's rules require on the
default branch, or what `repo-settings/rulesets/main.json` declares where a
repository keeps its rulesets as code.

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
