# Review checklists

What `/code-review` kept finding in this repository, by area, so that a
session can look for it before the first round
([`code-review-loop.md`](./code-review-loop.md)). Read the sections the diff
touches; none of this is a rule beyond what `CLAUDE.md` and the linked
documents already say.

An item here is a stopgap. When a check can catch it, the check is the fix and
the item goes ([`checks-over-fixes.md`](./checks-over-fixes.md)).

## Every change

- Each new branch has a test, failure paths included; a test's title says what
  its assertions check.
- Every comment, doc comment, README and `docs/` page that names what changed
  still reads true: search for the old name, the old count, the old behavior.
- File order follows "Coding style" in `CLAUDE.md`: exported functions, then
  types, constants, helpers (a lower-level one before its caller), and
  utilities last.
- The description says what was checked and what was not.

## Applications (`apps/*`)

- Every control is reachable and operable by keyboard: a native element
  (`<button>`, a radio in a `<label>`) rather than a `<div onClick>`, with a
  visible focus ring.
- Light and dark, forced colors, and a phone width where the layout changes.
- Text input survives an IME: Enter while composing does not submit, and Safari
  is no exception.
- Every language the app ships (the Japanese and the English strings, the
  fonts) and long or empty text.
- Touch targets, overflow and scrolling on a short screen.
- State kept in the URL: encoding (`%2F`), repeated parameters, an invalid or
  hand-written value, and `replaceState` refusing a write.

## Stores and asynchronous code

- Nothing subscribes or starts work on import; `start`, `stop` and `start`
  again all behave.
- A request in flight when the store stops does not write its result after.
- What a `debounce`, `skip` or `throttle` drops at the start.
- Errors reach the user or the log; a cancelled popup or request does not
  leave a spinner on.

## Dates, times and numbers

- The time zone of the writer and of the reader, and days whose midnight the
  clocks skip or repeat.
- The edges of the range: zero, the largest value, year 9999, `NaN`.
- Rounding at a boundary (`99.95` shown as `100.0`), and the same rounding in
  every place that shows the number.

## Firestore

- The first snapshot may come from the device's cache; offline writes wait.
- Document size, field and index limits, and ids Firestore refuses.
- Writes that must land in order, and what a failure halfway leaves behind.

## Lint rules, codemods and fixers

- The wrappers `writing-lint-rules.md` lists (`as`, `satisfies`, `!`, `<T>`,
  parentheses) around the pattern.
- A comment inside the range a fix replaces, which the fix would drop.
- A name a fix writes: is it imported, is the import type-only, does an
  inserted import land before a leading directive (`'use client';`).
- A fix that is applied alone (an editor quick fix), and one that needs a
  second `--fix` pass to settle.

## Prose

- Each claim checked against the code, the data or the commit it describes; a
  number derived from the data rather than typed in.
- The Japanese and the English pages say the same thing.
- A rewording keeps the meaning: no hedge the tables contradict, no causal
  link the source does not make.

## Workflows and repository settings

`.github/workflows/README.md` and `repo-settings/README.md`.
