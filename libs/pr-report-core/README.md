# `pr-report-core`

What a merge queue run by labels and `Merge-After:` trailers decides about a
repository's open pull requests: whether each one's checks pass by what the
branch requires, the order they may merge in, which is stacked on which, and
who moves each one next. Nothing here talks to GitHub; a reader fetches what
these functions need, its own way, and hands it over.

```sh
npm add pr-report-core
```

Two readers share it, so they cannot disagree:

| reader                                                                              | reads GitHub through | runs in                    |
| :---------------------------------------------------------------------------------- | :------------------- | :------------------------- |
| [GitHub Pull Requests Manager](https://noshiro-pf.github.io/mono/pr-manager/)       | GraphQL              | the browser, on every read |
| `unblock-prs`, `open-pr` and `pr-report` (`noshiro-pf/mono`'s `tools/scripts/cmd/`) | REST and GraphQL     | a terminal, or an agent    |

## Example

```ts
import { findMergeAfterCycles, parseMergeAfter } from 'pr-report-core';

const body = [
    'Adds the second half of the parser.',
    '',
    'Merge-After: #12, #14',
].join('\n');

assert.deepStrictEqual(parseMergeAfter(body), [12, 14]);

// #12 waits for #14 and #14 for #12: neither can ever merge first.
const cycles = findMergeAfterCycles(
    new Map([
        [12, [14]],
        [14, [12]],
    ]),
);

assert.deepStrictEqual(cycles, [[12, 14]]);
```

## What is here

- **`checks.mts`** — the verdict over the contexts the branch requires, from
  the check runs and commit statuses on a head commit. Which of two runs of
  one name counts, and why it is the later suite rather than the later run,
  is written there.
- **`merge-after.mts`**, **`start-after.mts`** — reading the `Merge-After:`
  trailers out of a pull request's body and `Start-After:` out of an issue's,
  and finding the cycles in them.
- **`stack.mts`** — which pull request is stacked on which: one opened onto
  another open pull request's branch waits for it as if it had declared
  `Merge-After:` on it.
- **`tree.mts`** and **`report.mts`** — the declarations and the stacks as the
  forest they describe, and everything read arranged into a report.
- **`summarize.mts`** — the counts a report leads with.
- **`ruleset.mts`** — what a ruleset requires: the contexts, and whether code
  owners have to approve. **`code-owners.mts`**, **`review-hold.mts`** — who
  owns a change, and whether a review holds a pull request.
- **`queue-owner.mts`**, **`queue-order.mts`** — who moves each queued pull
  request next, and the order the queue picks them in.
- **`set-aside.mts`**, **`claim.mts`** — the comments `unblock-prs` and a
  session leave on a pull request: the hidden record each starts with, read
  back by the worker and the page.
- **`labels.mts`** — `skip-ci`, `merge-queued`, `blocks-release`,
  `auto-rebase`, `pending` and the `priority:*` labels.

The conventions themselves — what to write, and what the page shows for it —
are in the
[GitHub Pull Requests Manager's README](https://github.com/noshiro-pf/mono/tree/main/apps/pr-manager-app#what-your-repository-can-add).
