---
'synstate-react-hooks-compat': patch
---

Say in `useObservableEffect`'s JSDoc what the README says already: on React 16.8
and 17, a value emitted in the same commit by a layout effect React runs before
the hook's reaches the previous render's callback.
