---
'eslint-config-typed': patch
---

`react-coding-style/use-memo-hooks-style` reads the values a `useMemo` factory returns, from an expression body or from the factory's own `return` statements, and reports an assertion that decides their type: on the value, under `!`, `satisfies` or `await`, on a branch of `? :`, of `||` / `??` or the right side of `&&`, or the last expression of a sequence. It now reports such an assertion in a block-bodied factory and in a non-generator `function` factory (and a `function` factory's return type), which it missed. An assertion inside the value, such as `!(x as boolean)`, `f(x as T)`, the left side of `&&` or one in the body of a function the factory returns, is no longer reported: it either does not decide the memoized type or may be a cast `useMemo<T>` could not replace.
