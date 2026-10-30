# `review-findings-digest`

Prints a digest of the `## Review` sections of merged pull requests: how many
`/code-review` rounds each one ran, and its findings counted by class, with
the pull requests in each class. It is the input for looking across pull
requests at which findings recur, so that a recurring class gets a check
rather than another round of review (`docs/checks-over-fixes.md`).

```sh
pnpm run review-findings-digest                      # merged in the last 30 days
pnpm run review-findings-digest -- --since 2026-09-01
pnpm run review-findings-digest -- --last 50 --format json
```

`--format md` (the default) prints a rounds-per-pull-request table with each
one's diff size, the classes with their counts by disposition (fixed,
dismissed, deferred, unstated), the deferred findings with the issues they
went to, and every finding no class matched, verbatim. `--format json` prints
the same data. Progress goes to stderr.

It reads the REST API only, because a Claude Code session's proxy refuses
GraphQL, with the token and repository resolution of `pr-merge-queue`
(`GH_TOKEN`, then `GITHUB_TOKEN`, then `gh auth token`; `--repo`, else
`origin`, else the root `package.json`).

## Files

- `main.mts` reads the options and prints.
- `github.mts` pages through the closed pull requests, newest update first,
  until no later page can hold one in range, and fetches the diff size of
  those with a `## Review` section.
- `parse.mts` reads one description: the section, the levels, the stated
  round count, and the findings with their disposition.
- `classify.mts` is the table of classes, one keyword pattern each.
- `digest.mts` counts and renders.

## Reading the result

**A heuristic for a reader, not a gate.** The sections are free prose, and
the parser knows the shapes they have taken: bullets under a `Fixed:` /
`Dismissed:` / `Deferred to #N:` paragraph or bold label, bullets that carry
their own label, and `Fixed: a, b, and c.` sentences. Anything else is read
as well as it can be. A round count is "?" when the section states none
("for several rounds"). The classes are keyword matches, so they over- and
under-count; the pull request numbers beside each are there to go and read.

**A new class shows up first under "Other".** When the same kind of finding
appears there across pull requests, add a row to `CATEGORIES` in
`classify.mts`, with a test in `classify.test.mts`.
