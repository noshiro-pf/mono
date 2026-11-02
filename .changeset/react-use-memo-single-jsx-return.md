---
'eslint-config-typed': minor
---

Add two rules to `react-coding-style`, both on in `eslintConfigForReact`. `react-coding-style/require-use-memo` reports a value declared directly in a React component or custom hook body that is computed again on every render: anything but a primitive O(1) expression (property access, operators, template literals, hook calls, and calls of `Math.*`, `Number`, `Number.*`, `String`, `Boolean`, `Object.is`, `*.toFixed` and `*.toString`; more through `allowedCalls`) must be wrapped in `React.useMemo` / `React.useCallback` or moved out of the component. `react-coding-style/single-jsx-return` reports a function that returns JSX, or a component, with more than one `return` statement; branch inside the one returned expression instead. The cases of a final `switch` count as one return. Both take `componentWrappers` for higher order components such as `memoNamed`, which the preset sets.
