# `pr-report-core`

What this repository decides about its open pull requests, in one place for
the two things that report them:

| reader               | reads GitHub through | runs in                    |
| :------------------- | :------------------- | :------------------------- |
| `pnpm run pr-report` | REST                 | a terminal, or an agent    |
| `pr-manager-app`     | GraphQL              | the browser, on every read |

Each side reads GitHub its own way — the command over REST, because a Claude
Code session's proxy refuses GraphQL; the page over GraphQL, because REST
would spend its budget in minutes — and hands what it read to the same
functions here. So the verdict on a pull request, its place in the merge
order and the counts a report leads with cannot differ between the two.

## What is here

- **`checks.mts`** — the verdict over the contexts the ruleset requires, from
  the check runs and commit statuses on a head commit. Which of two runs of
  one name counts, and why it is the later suite rather than the later run,
  is written there.
- **`merge-after.mts`** — reading the `Merge-After:` trailers out of a body,
  and finding the cycles in them. `unblock-prs` reads the same declarations
  to decide what it may pick.
- **`stack.mts`** — which pull request is stacked on which: one onto another
  open pull request's branch waits for it as if it had declared
  `Merge-After:` on it. `unblock-prs` reads the same stacks to decide what it
  may pick and what it carries along.
- **`tree.mts`** and **`report.mts`** — the declarations and the stacks as the
  forest they describe, and everything read arranged into a report.
- **`summarize.mts`** — the counts a report leads with.
- **`ruleset.mts`** — what `repo-settings/rulesets/main.json` requires: the
  contexts, and whether code owners have to approve. Parsed from its text,
  because the command reads it from the checkout and the page from the
  default branch.
- **`set-aside.mts`** — the commit status `unblock-prs` leaves on a pull
  request it passes over: its context, the description it writes and the page
  reads back, and how long it applies.
- **`labels.mts`** — `skip-ci`, `merge-queued` and `blocks-release`. They
  exist only on GitHub, so these strings and the ones in
  `.github/workflows/` are the whole of their declaration.

Nothing here talks to GitHub, which is what lets all of it be tested against
a handful of literals.

## Checks

```sh
pnpm run check:test
pnpm run check:types
pnpm run check:lint
```
