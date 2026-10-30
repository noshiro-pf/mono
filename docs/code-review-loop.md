# The review loop

`CLAUDE.md` ("Commits and pull requests") says a pull request is reviewed with
`/code-review` before it is opened and before any later amend is pushed. This
file is the procedure: what to do before the first round so that it finds
little, how each round is run, and when the loop ends.

Every round is a full review of whatever it is given. The loop is cheapest
when the first round finds little and each later round is given little: a
small change reviewed once costs less than a large one reviewed over and over,
and a late round that only rephrases comments, or raises again what an earlier
round dismissed, costs as much as the first.

## Before writing code

- **Split the change.** A pull request that does one thing is reviewed in one
  or two rounds; one that does three is reviewed three times over, every round.
  Stack the parts (`main <- A <- B`) as "Commits and pull requests" in
  `CLAUDE.md` describes.
- **Review a plan, not code, for a design question.** When the change chooses
  between designs (a data shape, which component owns what, how a feature
  behaves at its edges), write the plan first — what changes, what does not,
  the edge cases from [`review-checklists.md`](./review-checklists.md) that
  apply — and settle it before writing code. A design changed in round five
  makes every earlier round wasted work.
- **Write down what is out of scope before the first round.** Start the pull
  request description draft with what the change deliberately leaves alone:
  existing behavior it keeps, cases it does not cover, follow-ups that are
  their own issue. Reviews keep raising "this predates the change", and the
  answer is the same every time.

## Before the first round

1. Run the checks the diff touches (`CLAUDE.md`, "Commands") and fix what
   they report. A review is the most expensive way to learn that a barrel,
   a generated README or a codemod result is stale.
2. Read the diff once yourself, with the sections of
   [`review-checklists.md`](./review-checklists.md) that apply. You already
   have the context; a reviewer has to rebuild it.

## Each round

- **Level.** `high` for a diff with code. `medium` for a diff that is only
  prose — Markdown, comments, a changeset — and has no README fence or
  `@example` in it, since those are samples that are embedded and run.
- **What `/code-review` reads.** Given no target, it reviews
  `@{upstream}...HEAD` plus the uncommitted changes (`git diff HEAD`), so the
  branch's upstream decides how much a round reads. The base below is the
  layer below for a stacked branch, `origin/<branch>` once the pull request is
  open, and `origin/main` otherwise.
    - **The first round reads the whole diff from the base**, generated output
      aside. Set the upstream to the base first, whatever the branch was made
      from — a worktree's branch often has none, and a review then falls back
      to a local `main` that may be far behind:
      `git branch --set-upstream-to=<base>`.
    - **A later round reads only what the previous round changed.** Before
      fixing, amend what the round reviewed into the branch's commit, mark it,
      and make the fixes as uncommitted changes on top:
      `git branch -f "review-base/$(git branch --show-current)" HEAD && git branch --set-upstream-to="review-base/$(git branch --show-current)"`.
      Repeat that before each later round. Branches are shared by every
      worktree, so the marker's name carries the branch's own; on a detached
      HEAD, name it yourself.
    - **To widen a round back to the whole diff** — when a fix changed a design
      rather than a line, or touched code the rest of the diff or a dismissal
      in the ledger relies on — set the upstream to the base again.
    - **When the loop ends**, put the upstream back on the base and delete the
      marker:
      `git branch --set-upstream-to=<base> && git branch -D "review-base/$(git branch --show-current)"`.
    - **An amend to an open pull request** is reviewed against the pushed
      branch: an amend kept uncommitted until it has been reviewed is what the
      review reads. If the pushed branch has moved (`auto-rebase`), bring the
      local branch onto it first — `git fetch`, then
      `git rebase --onto origin/<branch> <the head you knew>` — or the review
      reads the whole commit again.
- **After each round's fixes, rerun the checks they touch** — the fixes are
  code, and with `skip-ci` on the local checks are the only ones the branch
  gets.
- **Keep a ledger.** The description draft lists each finding as fixed,
  dismissed with its reason, or deferred. A finding a later round raises again
  that the ledger already dismisses is not a new finding: do not investigate
  it again. A later round cannot tell whether a fix broke what a dismissal
  relied on, so check that when writing the fix, and widen the next round if
  it did.
- **Ask what would have caught it** ([`checks-over-fixes.md`](./checks-over-fixes.md)) for each finding
  that could recur, and add the check or say why there is none.

## When the loop ends

The loop ends at the first of:

- a round with no findings;
- a round whose findings are wording only — phrasing, typos, how a comment is
  laid out — fix them and do not review again. A claim that is wrong is not
  wording, wherever it is written: a false sentence in a README is a finding
  like any other;
- a round that raises only findings the ledger already dismisses;
- the third round. What it finds is fixed here only when the fix is local
  and the checks it touches cover it; anything larger is deferred to an
  issue, or asked in the thread when it is a question of what the change
  should do. Do not start a fourth round to make it go away.

## What the description records

The `## Review` section says the level and the number of rounds, then lists
the findings under **Fixed**, **Dismissed** (each with its reason) and
**Deferred** (each with its issue). Keep that shape: it is what a reader, and
anything that later mines the descriptions for recurring findings, can parse.

A security finding is the exception, as "Security findings" in `CLAUDE.md`
says: one dismissed or deferred goes to `mono-security` and is not listed
here, and one fixed is described no further than that section allows.
