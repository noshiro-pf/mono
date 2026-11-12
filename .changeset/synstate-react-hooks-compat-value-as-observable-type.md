---
'synstate-react-hooks-compat': patch
---

`useValueAsObservable` is typed as returning `InitializedObservable<A>`, which the observable it returns always was: it starts from the first render's `input`. What is derived from it keeps the initial value in its type, so `useObservableValue(useValueAsObservable(n).pipe(map(f)))` is no longer `B | undefined`.
