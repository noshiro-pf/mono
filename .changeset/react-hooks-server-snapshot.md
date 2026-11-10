---
'synstate-react-hooks': patch
---

`useObservableValue`, and the `useCurrentValue` hooks `createState` and `createReducer` return, now render on the server: they pass `getServerSnapshot` to `useSyncExternalStore`, so `renderToString` draws the observable's current value instead of throwing "Missing getServerSnapshot".
