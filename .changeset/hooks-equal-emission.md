---
'synstate-react-hooks': patch
'synstate-preact-hooks': patch
---

`useObservableValue`, and the `useCurrentValue` hooks `createState`, `createReducer` and `createBooleanState` return, no longer re-render the component for an emission equal (`Object.is`) to the value it shows. The store snapshot was synstate's `Optional`, a new object on every emission; it is now the value itself.
