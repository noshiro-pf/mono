# lambda-calculus-interpreter-synstate-dom

The synstate-dom front end for `lambda-calculus-interpreter-core`: enter a
lambda term and watch it reduce.

<https://noshiro-pf.github.io/mono/lambda-calculus-interpreter-synstate-dom/>

It draws the same screen as `lambda-calculus-interpreter-react` and
`lambda-calculus-interpreter-preact`, so that the three can be read side by side
as one UI written in three frameworks. Each app keeps its own copy of
`src/state.mts` and `e2e/main-page.spec.mts`, and nothing keeps the copies in
step. They are meant to be short-lived: framework comparisons are to move to a
larger sample app with routing, and the React and Preact versions are deleted
then.

## Running it

```sh
pnpm run dev      # Vite dev server
pnpm run build    # production build
pnpm run preview  # serve that build
```
