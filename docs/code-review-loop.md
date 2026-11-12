# The review loop

`CLAUDE.md` ("Commits and pull requests") says a pull request is reviewed with
`/code-review` before it is opened and before any later amend is pushed. This
file is the procedure: what to do before the first round so that it finds
little, how each round is run, when the loop ends, and the few points at which
it is put to the user.

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
  makes every earlier round wasted work. A design the user has to choose is
  put to them as [`presenting-choices.md`](./presenting-choices.md) says:
  each option tried first, as throwaway code rather than the change.
- **Write down what is out of scope before the first round.** Start the pull
  request description draft with what the change deliberately leaves alone:
  existing behavior it keeps, cases it does not cover, follow-ups that are
  their own issue. Reviews keep raising "this predates the change", and the
  answer is the same every time.

## Before the first round

1. Run `pnpm run check-changed` (`CLAUDE.md`, "Commands"), which runs the
   checks the diff touches, and fix what it reports. A review is the most
   expensive way to learn that a barrel, a generated README or a codemod
   result is stale.
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
- **After each round's fixes, run `check-changed` again** — the fixes are
  code, and with `skip-ci` on the local checks are the only ones the branch
  gets.
- **Keep a ledger.** The description draft lists each finding as fixed,
  dismissed with its reason, or deferred, a security finding dismissed or
  deferred aside (the end of this file). A finding a later round raises again
  that the ledger already dismisses is not a new finding: do not investigate it
  again. If its reason belongs at the site and is not there yet (below), write
  it there, unless the round ends the loop, checking only that the reason still
  describes the code; a reason that no longer does makes the finding a new one.
  A later round cannot tell whether a fix broke what a dismissal relied on, so
  check that when writing the fix, widen the next round if it did, and correct
  or remove a comment at the site that no longer holds. A comment written for a
  dismissal or a deferral goes in with a round's fixes, so the next round reads
  it; the round that ends the loop writes none ("When the loop ends").
    - **A reason about the code goes at the site too.** No reviewer reads the
      ledger, so a dismissal written there alone is raised again by any later
      round that reads the code, which spends its reading on it and makes the
      loop look as if it does not converge. When a finding is dismissed because
      the code is meant to be as it is — a design chosen on purpose, a
      trade-off, a known limit — write the reason as a plain comment, not JSDoc
      or other documentation that ships with the code, at the code the finding
      names, its declaration or the statement it is about, with that round's
      fixes, and let the ledger entry name the site. The comment states the
      reason as a property of the code, for someone who never saw the review;
      "dismissed in review" or a pull request number is not a reason. A comment
      at the site reaches the next round, the next session and whoever edits it,
      as `CLAUDE.md` ("What belongs in this file") says of any rule.
      If the comment is awkward to write because the reason does not hold up
      once written down beside the code, fix the finding instead.
    - **So does a deferred finding, stated as a limit of the code.** A finding
      deferred to an issue is raised again by every round that reads its code,
      until a comment there says the limit is known. Write what the code does
      not handle yet and why that is acceptable until it does, as a plain
      comment at the site; the issue, filed once the pull request exists, names
      that comment, so whoever fixes the issue removes it. "Left for a
      follow-up" is no more a reason than "dismissed in review". The places the
      next bullet names, which take no comment, keep it in the ledger alone.
    - **A trivial finding is dismissed, and its reason goes to the site once it
      comes back.** A preference — a name, an equivalent way to write the same
      thing, hardening against input the types already rule out — is dismissed
      with its reason in the ledger rather than fixed: a fix for a preference is
      itself read by the next round, which may prefer something else. When a
      later round raises one again, in the same words or new ones, write its
      reason at the site as above.
    - **The ledger alone keeps a reason about scope, or one with no site to
      carry it.** A finding dismissed as out of scope and not worth fixing at
      all says nothing about the code: a comment would state it of this pull
      request and leave it stale once it merges. Prose — Markdown, MDX, a
      changeset — has no comment that is safe everywhere: a changeset's is
      copied into the changelog, and MDX takes no HTML comment. A file whose
      parser takes no comments, such as `package.json` or the JSON under
      `repo-settings/`, has nowhere to put the reason. A generated file, such as
      a `gen:index` barrel or `strict-lib/` output, loses it to the next
      generation. A comment in a file the change does not touch, of any kind,
      would pull that file into the diff.
    - **A dismissed security finding is in neither.** It goes to `mono-security`
      alone, as "Security findings" in `CLAUDE.md` and the end of this file say:
      a comment or a ledger entry stating why a weakness stays would publish it.
- **Fix it here unless it is out of scope.** A finding is fixed in this pull
  request, whatever round raised it and however many lines the fix takes, when
  it is about code or prose the change adds or alters, or about what the change
  set out to do. A defect in the change's own new code is never deferred. Defer,
  with an issue, only a finding that is out of scope and still worth fixing on
  its own; one out of scope that is not worth fixing at all is dismissed with
  that reason. Say which way a deferred one is out of scope, as the tag its
  bullet under **Deferred** opens with:
    - `(predates)` — the problem was there before the change, in code the change
      does not otherwise need to touch;
    - `(another change)` — fixing it pursues a different goal, or reaches
      packages or files the change has no reason to touch;
    - `(too large)` — the fix would make the pull request several times its
      size, such as a check or rule over the whole repository.

    A question of what the change should do is asked in the thread, not
    deferred. Splitting work that belongs together gains nothing: it is reviewed
    and checked twice. `pr-description` and `open-pr --body-file` refuse an item
    under **Deferred** with no tag; `review-findings-digest` counts deferrals by
    tag, and one written in any other shape as one with none.

- **Ask what would have caught it**
  ([`checks-over-fixes.md`](./checks-over-fixes.md)) for each finding that could
  recur, and add the check or say why there is none.

## When the loop ends

The loop ends at the first round that leaves nothing to do: every finding it
raises, if it raises any, can be left as it is. The session judges that, finding
by finding, and does not put it to the user. A finding can be left as it is when
it is:

- dismissed, newly or because the ledger already dismisses it — a design chosen
  on purpose, a known limit, or a trivial preference as "Keep a ledger"
  describes;
- deferred as out of scope and worth fixing on its own, as "Fix it here unless
  it is out of scope" says;
- wording whose fix is mechanical — a typo, notation, how a comment is laid out.
  A claim that is wrong is not wording, wherever it is written: a false sentence
  in a README is a finding like any other.

Any other finding — a defect real input reaches, a false claim, a check that
does not check what it says — is fixed, and the next round reads the fix,
however late it is raised. A security finding is handled as the end of this file
says.

**The round that ends the loop changes nothing but its wording.** Its mechanical
wording fixes are made and not reviewed again. Its dismissals and deferrals go
to the ledger alone, even where "Keep a ledger" would put a comment at the site:
a comment is a change, and a change after the last round is one no round reads.
Where a reason must reach whoever edits the code next, because without it the
next edit would undo a deliberate choice, write the comment and run one more
round, which reads only that comment. A round with anything to fix ends nothing:
its wording fixes go in with the rest and are read by the next round.

Ending the loop is never a reason to defer a finding. One in scope is fixed here
and read by the next round, however late it is raised: an issue split off to end
the loop is a second change reviewed and checked from the start.

**The loop runs to its end without asking whether to go on.** The user can
rarely judge that better than the session, which has read every round, so do not
stop after the fourth round, or any other, to ask. A round that is not widened
reads only the previous round's fixes, so each should find less than the one
before; when rounds stop shrinking, act on the cause:

- **A finding that comes back** — dismissed or deferred, or a preference raised
  again in new words — has no comment at its site yet. In a round that has
  something else to fix, write it, as "Keep a ledger" says, so the next round
  reads that the code is as intended; a round with nothing else to fix ends the
  loop instead.
- **Fixes that break what they touch** were too narrow: widen the next round to
  the whole diff, and fix the cause rather than each symptom a round names.
- **A finding about what the change should do** is asked in the thread, as "Fix
  it here unless it is out of scope" says — the choice of design is the user's.
  It usually means the design was not settled before the code (see "Before
  writing code").

**A loop stops at its twentieth round.** Rounds are numbered within their loop,
a widened round included. The limit comes from the record: of the 290 pull
requests with a `## Review` section among the last 300 merged up to 2026-11-12,
half took 3 rounds or fewer, 95% took 9 or fewer and all but three took 19 or
fewer, counting every loop each ran (`pnpm run review-findings-digest -- --last
300`). Revise it from the same digest when the record moves. When the twentieth
round still has a finding that cannot be left, do not make its fixes — no round
would read them — and neither open the pull request nor push the amend: put the
findings left to the user, each with the fix you would make, and ask whether to
go on, split the change or rework it. Go on, and the loop keeps its numbering up
to the limit the user gives; split, and each part is a pull request with a loop
of its own; rework, and a new loop reads the whole diff.

## What counts as a round

The rounds belong to one loop over one version of the change. What starts
another, or needs none:

- **A rework** — the change sent back to another approach, by the user or by a
  finding about what the change should do, so that the code the rounds read is
  mostly gone — starts a new loop over the whole diff. A second rework is put to
  the user before its loop starts. A fix inside a loop that changes a design is
  not a rework: it widens the next round, as "To widen a round" above says, and
  that round keeps its place in the loop's numbering.
- **An amend to an open pull request** is a loop of its own, over the amend.
- **A rebase or restack that changes nothing in this layer** needs no review.
- **A rebase that resolves a conflict** is a loop of its own, given the
  resolution alone, at the level its diff calls for ("Level" above). Its rounds
  are not in the description's total (below).

Anything else — a fix, a test added, a comment reworded — is part of the loop it
is made in, and that loop's next round reads it, unless it is a wording fix that
ends the loop.

## What the description records

The `## Review` section opens with one line stating the level and the total
number of rounds, in digits and in one of these forms — `/code-review`, another
review mechanism (`AGENTS.md`, "Codex adaptations"), or a self-review when there
was none:

```md
`/code-review high`, 3 rounds.
Review at `high`, 2 rounds.
Self-review at `high`, 1 round.
```

The total counts the rounds of every loop but a conflict resolution's. More than
one loop, or more than one level, is still one total; the next sentence says how
it divides. The line may go on after a period, comma, semicolon or colon.
`pr-description` and `open-pr --body-file` refuse a section that opens any other
way, and `review-findings-digest` reads the total from it. A description written
before this form changes the opening in both halves, or in the original alone
with `pr-description push --wording-only`.

The section then lists the findings under **Fixed**, **Dismissed** (each with
its reason, naming the site that carries it when it is about the code) and
**Deferred** (each a bullet opening with its tag and naming its issue,
`- (predates) … (#123)`; with nothing deferred, the label is left out or reads
`**Deferred**: none.`). Keep that shape: it is what a reader, and anything that
later mines the descriptions for recurring findings, can parse.
The Japanese half of the description (`CLAUDE.md`, "Japanese text")
carries the section under `### レビュー`, never a second `## Review`: the
digest reads the first `## Review` alone, and only the English one parses.

A security finding is the exception, as "Security findings" in `CLAUDE.md`
says: one dismissed or deferred goes to `mono-security` and is not listed
here, and one fixed is described no further than that section allows.
