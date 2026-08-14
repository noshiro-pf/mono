# better-react-use-state

`useState` that hands back the setters it always takes a `useCallback` to write
by hand: `updateState` for the functional form, `resetState`, and — for
booleans — `setTrue`, `setFalse`, `toggleState`.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). It is
one of the six utilities `event-schedule-app` needs, restored ahead of it in
dependency order. It is published from `libs/`, so the rest of the restoration
can depend on it the same way anything outside this repository would.

## What changed on the way back

- The `// eslint-disable-next-line react-hooks/exhaustive-deps` comments are
  gone. The dependencies they suppressed are stable — React's own setter, and a
  `useCallback` with an empty dependency list — so naming them costs nothing and
  says what is true.
- `useState<boolean>(initialState)` lost its type argument, which `initialState`
  supplies anyway. The React Compiler rule reads an explicit type argument on a
  custom hook as a reference to the hook rather than a call to it, and rejects
  it.
- The returned tuples label every element, not only the first.
