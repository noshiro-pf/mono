# `pr-report-core-v2`

The from-scratch rebuild of [`pr-report-core`](../pr-report-core/README.md),
private until it replaces it. What it is to do, and how it is laid out, is
[`libs/pr-merge-queue-v2/spec/`](../pr-merge-queue-v2/spec/README.md).

So far it holds:

- `src/snapshot/`: the `Snapshot` type, every fact the queue's decisions read,
  before anything is decided. Each part that can fail to be read is a `Read<A>`,
  a `Result` of the facts or of why they were not read, so that a decision has
  to say what it does without it.
- `src/conventions/`: the wire formats — labels, `Merge-After:` and
  `Start-After:`, closing keywords, branch names and `Queue-Layer:`, the hidden
  comment records, instants.
- `src/decide/`: the pure decisions — check verdicts, the merge graph, set-aside
  rules, the queue owner, review holds, standings and candidate order, issue
  start states and tiers — and `decideQueue`, which composes them over one
  snapshot as the page, `pr-report` and the worker all read them.

v1's tests are ported beside each module as fixtures; where a rule changed on
purpose, the specification marks it **Changed in v2**.

## Who changes this package

It is built from the specification, not from `pr-report-core`'s code. So a fix
to `pr-report-core` or `pr-merge-queue` is not ported here as code: a fix that
changes a rule is written into the specification, with the test that shows it,
and reaches this package when that rule is built or rebuilt here. Until the
swap, only the session rebuilding the queue changes this package.
