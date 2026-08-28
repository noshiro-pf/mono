# react-utils

A drawer of React hooks: debouncing, intervals, previous values, promise state,
key-event listeners, a 2D canvas context, an async reducer, a `synstate` source
tied to a component's lifetime, and two small components
(`ToggleWithoutDestroy`, `ComponentSwitcher`) that hide a subtree without
unmounting it.

Restored from `experimental/` — see
[docs/monorepo-consolidation.md](../../docs/monorepo-consolidation.md). One of
the six utilities `event-schedule-app` needs; it sits on
`better-react-use-state`. Never published to npm, so it comes back to `apps/` as
a private package.

## What changed on the way back

React 19 and the React Compiler rules account for most of it.

- **`usePrevious` no longer keeps the value in a ref.** Reading a ref during
  render is what the compiler rejects, so it holds state instead. That changes
  one thing: it returns the previous _distinct_ value rather than the value from
  the previous render.
- **Explicit type arguments on hook calls are gone** wherever the initial value
  supplies the type. The compiler rule reads `useState<T>(x)` as a reference to
  the hook rather than a call to it — a false positive, but the type argument was
  redundant in every case but one, and that one carries the suppression with a
  note.
- `useRef<T>(null)` is typed `RefObject<T | null>` in React 19; `useCanvasContext2d`
  says so.
- `DeepReadonly<{ … ReactNode }>` is `Readonly<{ … }>`: a deeply-readonly
  `ReactNode` is no longer a `ReactNode`.
- `React.Reducer` was removed from React's types; `useAsyncReducer` declares the
  one line it was.
- `getPlatform` and `PromiseState` have no successor in `ts-data-forge`;
  [`src/utils`](./src/utils) carries them, each with a note on where it came
  from.
- **`createTinyObservable` is gone: the observable is `synstate`'s.** The port
  was a 37-line multicast callback list, and `source()` is that list with a
  value and a graph around it — more than the hooks asked for, but not a
  different thing. Two of the three hooks went with it, being
  `useObservableEffect` and `useObservableValue` in `synstate-react-hooks`
  already; what is left is `useObservable`, which holds a `source` for as long
  as the component lives.
