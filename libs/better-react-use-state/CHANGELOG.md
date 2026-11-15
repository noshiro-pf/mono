# better-react-use-state

## 1.0.4

### Patch Changes

- cdab38f: Publish the changes listed under 1.0.1 and 1.0.2 below, which never reached npm: npm already held 1.0.1 and 1.0.3 from hand publishes, and 1.0.2 had been published and withdrawn, so its number cannot be reused. Upgrading from npm's 1.0.3 brings both: the build with the native TypeScript compiler, and `resetState` resetting to the mount-time initial state with a stable identity. This is also the package's first publish through npm trusted publishing.

## 1.0.2

### Patch Changes

- 1e77f1c: `resetState` resets to the value the state was created with — the first render's `initialState`, as `useState` reads it — rather than the latest render's argument, and keeps its identity across renders. It changed identity whenever the argument did, so `useState({ name: '' })` gave a new `resetState` on every render, and an effect depending on it re-ran after every render.

## 1.0.1

### Patch Changes

- 30de8fa: Build with the native TypeScript compiler and drop Rollup. Each module in `dist/` is emitted by `tsc` as written, then the type tests, the in-source tests, the identity casts and the comments are removed from it. The declarations are unchanged, every module exports the same names as before, and the JavaScript is smaller: 1437 KB across these packages before, 1041 KB after.

    Two things change in the published JavaScript. `export` declarations appear inline rather than in a trailing `export { ... }` list, and the line structure is the source's rather than a bundler's, so a stack trace or a source map lands where the code was written.

    `github-settings-as-code` was already compiled by `tsc`; what it gains here is the removal pass, so its `dist/` no longer carries `expectType(...)` calls.
