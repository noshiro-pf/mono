Run `type-check`, `lint:fix`, and `fmt`, in that order, and fix any errors.
Avoid using `as any` or `as never`.
Avoid any casting as possible.
Avoid using `// eslint-disable-next-line` or `eslint-disable` as possible.
Don't change `expectType<A, B>("=")` to `expectType<A, B>("<=")` or `expectType<A, B>(">=")`.
