---
'synstate': patch
---

`TimerId` is `ReturnType<typeof setTimeout>` again.

It became `NonNullable<Parameters<typeof clearTimeout>[0]>` only because the
strict standard library resolved `ReturnType<typeof setTimeout>` to `unknown`,
which `clearTimeout` would not accept. That is fixed in the library, so the type
goes back to being defined by what produces the handle rather than by what
consumes it — which is what it was for the whole of this package's history until
then.

Under `@types/node` this narrows the alias from
`string | number | NodeJS.Timeout` to `NodeJS.Timeout`. Every value of this type
comes out of `setTimeout` / `setInterval`, so nothing that stored a handle is
affected; code that put a bare `number` into a `TimerId` on Node is.
