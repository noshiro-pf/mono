# numeric-input-utils

State for a numeric text field: the text the user is typing is kept separate
from the number it decodes to, `dirty` says whether the two have diverged, and
`submit` clamps, rounds and pushes the value back. The stepper variant adds
press-and-hold on the increment and decrement buttons.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). One of
the six utilities `event-schedule-app` needs. Published as
`@noshiro/numeric-input-utils@1.3.0`; that version stays on npm, and this copy
is private.

## What changed on the way back

- **The `useRef` holding the callbacks is gone.** It existed so that a caller
  passing `encode` / `decode` inline would not re-run the effect that resets the
  text. Reading a ref during render is what the React Compiler rejects, and the
  reset is no longer an effect, so there was nothing left for it to buy.
- **The reset is now React's "adjusting state when a prop changes" recipe** —
  comparing the previous prop during render — rather than
  `useEffect(() => setState(…), [value])`. The effect rendered once with the
  stale text and again with the new one, which is what the compiler objects to.
- `dirty` is a plain expression rather than a `useMemo`.
- `TimerId` was a global from `@noshiro/ts-type-utils`. It is
  `Parameters<typeof clearTimeout>[0]` here, which is right under both Node and
  the browser.
