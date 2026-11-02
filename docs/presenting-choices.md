# Presenting choices

`CLAUDE.md`, "Session rules", says a session tries each option before asking
the user to choose between them, and says how sure it is of each. This file is
the procedure: when it applies, how far to take each option, when not to try
one, and what the numbers mean.

A question asked before the options have been tried is a question about what
the options are, and the user has to work that out to answer it. Asked after,
it is about the trade-off alone, which is the part only the user can decide.
An option that falls apart on the first attempt is the commonest thing a
premature question gets wrong: the user picks it, and the session comes back
with the same question one option shorter.

## When it applies

To every choice put to the user between ways of doing the work — "A
(recommended), B or C?" — whether it is asked with `AskUserQuestion`, in the
closing question of a turn, or in plain text. A choice with a conventional
default is not put to the user at all: pick it, say so, and proceed.

## How far to take each option

Far enough to state, for each option:

- **what it changes** — the files, roughly how much, and which packages,
  generators and checks it reaches;
- **that its hardest part works** — the type that has to compile, the test
  that has to pass, the API or option that has to exist — attempted, not
  assumed;
- **what it costs afterwards** — a dependency, a rule someone has to remember,
  a check it adds or has to bypass, a migration;
- **what is still unknown**, and why the attempt stopped short of it.

Stop when more work would no longer change the ranking, not when the option is
finished. An option that fails while being tried is not offered as an equal:
drop it, or list it as tried and rejected with the reason.

The attempts are throwaway. Keep each in the session's worktree as a commit of
its own on a branch named `<session branch>--<option>` (branches and
`git stash` are shared by every worktree, and git refuses `<session branch>/a`
beside `<session branch>`), push none of them, and run only the check that
settles the hard part. Once the user has answered, bring the chosen attempt
onto the session's own branch, delete every option branch, and from there on
it is ordinary work: `check-changed` and the rest apply as usual.

## When not to try

Ask first, and mark the option untried, when trying it would:

- **reach outside the working tree** — push, open or comment on a pull request
  or issue, run `repo-settings:apply`, publish, send a message, delete data;
- **cost more than finishing the option that looks likeliest would**;
- **settle nothing**, because the choice is one of taste — a name, a wording,
  which of two equivalent call shapes reads better. Show the candidates side
  by side instead; that is the attempt.

Also when the user has asked to be asked first.

## The numbers

Each option carries two percentages, in multiples of 5:

- **Pick** — how likely it is that this is the option you would still choose
  once the work is finished and reviewed. The options' Pick values add up to
  100%, and the recommended option has the highest.
- **Works** — how likely it is that the option, as described, can be finished
  without a change of design: through `check-changed` and `/code-review`.

Each is followed by its basis, one line of what the attempt showed ("compiles;
two of three tests pass, the third needs the parser to keep comments"), and
the question ends with **what would flip it**: the one fact the user may know
that would change the recommendation.

Read 80% as "wrong about one time in five". An option left untried because
trying would cost too much rarely deserves a Works above 70%; write "untried"
beside it. A top Pick under 50% means the options are close and the user's
preference should decide, and the question says so. A top Pick of 90% or
more is usually not a choice: proceed with it and mention the alternative,
unless it is hard to undo.

In a Japanese reply, Pick is 推奨度 and Works is 実現度.

## Shape

```markdown
| Option             | Pick | Works | Basis                                    |
| ------------------ | ---- | ----- | ---------------------------------------- |
| A: guard in tools/ | 70%  | 90%   | written; catches both existing cases     |
| B: ESLint rule     | 25%  | 75%   | rule compiles; misses `satisfies` so far |
| C: comment only    | 5%   | 95%   | trivial; stops nobody who skips it       |

Flips to B if the pattern also appears outside this repository.
```

With `AskUserQuestion`, the recommended option comes first with
`(Recommended)` in its label, and each option's description starts with its
numbers: `Pick 70% · Works 90% — written; catches both existing cases`.
