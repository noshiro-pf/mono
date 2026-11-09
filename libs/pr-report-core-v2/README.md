# `pr-report-core-v2`

The from-scratch rebuild of [`pr-report-core`](../pr-report-core/README.md),
private until it replaces it. What it is to do, and how it is laid out, is
[`libs/pr-merge-queue-v2/spec/`](../pr-merge-queue-v2/spec/README.md).

So far it holds the `Snapshot` type (`src/snapshot/`): every fact the queue's
decisions read, before anything is decided. Each part that can fail to be read
is a `Read<A>`, a `Result` of the facts or of why they were not read, so that a
decision has to say what it does without it.

## Who changes this package

It is built from the specification, not from `pr-report-core`'s code. So a fix
to `pr-report-core` or `pr-merge-queue` is not ported here as code: a fix that
changes a rule is written into the specification, with the test that shows it,
and reaches this package when that rule is built or rebuilt here. Until the
swap, only the session rebuilding the queue changes this package.
