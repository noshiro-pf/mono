# Checks over fixes

When a problem could happen again, fixing the one instance in front of you is
not the end of the work. **Prefer the check that prevents the whole class**,
and make the instance fix part of it. The rule is in `CLAUDE.md`, "Session
rules"; this file is the procedure.

A fix removes one instance, and only for as long as nobody repeats the
mistake. A check removes the class for good, for everyone — including the
people and sessions who never read a rule written in prose. Prose in
`CLAUDE.md` or a README is the last resort: it reaches only those who read it,
at the moment they read it. It is the test "What belongs in this file" in
CLAUDE.md applies to a rule, turned to the problem behind the rule.

## When to ask

Ask **"what would have caught this mechanically?"** whenever a problem
surfaces, however it surfaced:

- a `/code-review` finding;
- a CI failure, or a bug found after merge;
- a review comment, especially one made before on another pull request;
- a mistake you notice while working, including one you almost made;
- a manual step someone has to remember (keeping two declarations in sync,
  regenerating a file, registering something in a list).

## Where to look, cheapest first

1. **A check that exists but does not run.** Run it; if CI does not run it,
   wire it in — a `check:root:*` or `check:prose:*` script is in CI with no
   other wiring.
2. **A check that exists but does not see this code.** Extend it: widen its
   input, or register the new case where the check collects its inputs.
3. **An option or rule that exists but is off**: a stricter `tsconfig` flag,
   a rule `eslint-config-typed` already ships that is off for this package.
4. **A type that makes the wrong state unrepresentable**: a branded type
   (`Int`, `Uint32`) instead of `number`, a discriminated union instead of
   optional flags, `match` or a `switch` with every case
   (`switch-exhaustiveness-check`).
5. **A new check**: a guard in `tools/scripts/cmd/` (its namespace chosen by
   what it reads — "Commands" in CLAUDE.md), a lint rule
   (`docs/writing-lint-rules.md`), a codemod, a test that parses or validates
   (a schema, an embedded query, generated output).

## What to do

| answer                                                 | what to do                                                                                                                      |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| a check can catch the class                            | add it in the same pull request as the fix                                                                                      |
| a check can, but it is too large for this pull request | defer it to an issue, filed once the pull request exists, ending with `Start-After:` naming it, and linked from the description |
| no mechanical check is practical                       | fix the instance, and say in one line of the description why no check was added                                                 |

**Search for other instances before fixing.** A check added in the same pull
request lists them for you; one deferred to an issue does not, so search by
hand. When turning a check on reports many existing violations, fix them if
they are few; otherwise scope it to what the change touches and leave the
rest to the deferred issue — a check with a deliberate scope is better than
none.

A check added this way is part of the fix, not unrelated work: it is what
keeps the fix fixed.

**A security finding is the exception.** As "Security findings" in CLAUDE.md
says, it is never described here: the deferred check, or the reason there is
none, goes to `mono-security` with the finding, and a check added here must
not read as steps that work any more than the fix may.

## In the description

For each fixed problem that could recur, the description names the check
added, the issue that will add it, or why none is practical. "Fixed" alone is
the answer this procedure exists to rule out.

## Examples

- **A string the tools cannot read.** A query `unblock-prs` sends to GitHub
  left a selection open and reached `main`: to `tsc` and ESLint a GraphQL
  query is a string, and once GitHub rejected it — answering with an error
  and no data — the command reported "could not read …" and went on. #2561 fixed
  the brace and added a test counting that query's braces — a check for the
  instance. #2563 closed the class by validating every query the PR tools
  send against GitHub's schema (`github-graphql.test.mts` in
  `libs/pr-merge-queue`, where a function that sends a new query joins
  `sendEveryQuery`, and in `apps/pr-manager`, where a new query joins
  `QUERIES`). That registration was itself a step someone had to remember,
  until the fix for #2642 added a second test to each, which fails on a query
  written in the source that none of the validated ones contains. SQL, HTML or a shell
  command in a string ask the same question.
- **A discipline that did not hold.** `CLAUDE.md` states its own admission
  test, and the file still had to be cut back from four digits. What was
  missing was a moment at which growth is noticed;
  `check:prose:claude-md-size` is that moment.
- **Prose that a guard made unnecessary.** CLAUDE.md once said that
  parentheses around Japanese text are fullwidth.
  `check:prose:japanese-parentheses` names the fix wherever the mistake is
  made, so #2638 dropped the sentence.
