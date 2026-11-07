# `check:root:auto-fix-contexts`

Fails when a `context` pattern in `.github/unblock-prs.json` takes no check the
pull request workflows produce.

`unblock-prs` decides what it may fix by matching a failed check's name against
`autoFix.fixers[].context`, and what to build first by
`autoFix.prepare[].context`. Those names are written in the workflows, and
nothing else compares the two. Renaming or bundling a matrix entry leaves its
fixer matching nothing, and that is silent: the failure it should have fixed is
set aside as `checks-failed`, and every check stays green.

## What it asks

- **The checks.** Every job, in a workflow a pull request runs, that hands a
  matrix entry to `pnpm run` or to `z:ci-job --command`, read through
  `tools/scripts/lib/workflow-jobs.mts` as the other workflow guards read them.
  A job whose checks it cannot name exactly is left out, with why, and the
  reasons are printed with a failure: leaving a job out can only make a pattern
  fail.
- **What a pattern takes.** `unblock-prs` answers, through what `pr-merge-queue`
  exports: `configOf` reads the file, `failedContexts` says what is read at all,
  `firstFixerOf` which fixer takes a check, and `planAutoFix` whether a
  `prepare` entry would run for it. None of those rules is restated here, so a
  change to them changes what this checks.
- **Each top-level alternative** of a pattern (`a|b`) is asked on its own, since
  one that went stale beside a live one is as silent.

## When it fails

Change the pattern to the new check name (the job's `name:` with the entry put
in, or `<job> (<entry>)`), or remove it. A pattern kept for an entry to come
goes in `KEPT_IDLE` in `main.mts`, with the reason; one listed there that starts
taking a check, or leaves the file, fails too, so the list cannot outlive its
reasons.
