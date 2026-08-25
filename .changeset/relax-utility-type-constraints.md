---
'strict-ts-lib-v5.0': minor
'strict-ts-lib-v5.1': minor
'strict-ts-lib-v5.2': minor
'strict-ts-lib-v5.3': minor
'strict-ts-lib-v5.4': minor
'strict-ts-lib-v5.5': minor
'strict-ts-lib-v5.6': minor
'strict-ts-lib-v5.7': minor
'strict-ts-lib-v5.8': minor
'strict-ts-lib-v5.9': minor
'strict-ts-lib-v6.0': minor
'strict-ts-lib-v7.0': minor
---

Leave `Exclude`, `Extract`, `Omit` and `Pick` with the constraints TypeScript
declares.

Two of them had been narrowed here — `Exclude<T, U extends T>` and
`Omit<T, K extends keyof T>`, against upstream's `Exclude<T, U>` and
`Omit<T, K extends keyof any>`. `Extract` and `Pick` already matched.

Narrowing the second argument makes a choice on the caller's behalf, and only
one of the two readings is ever right for a given call. Subtracting keys a type
may not have is a legitimate thing to write — upstream declarations do it, and
so does third-party code — and under the narrowed constraint it is a TS2344
that no amount of local rewriting fixes when the declaration is inside a
dependency. Making the choice explicit belongs in the caller's own code, which
is what `eslint-plugin-ts-type-forge`'s `prefer-strict-or-relaxed-utility-type`
does: it points at `ts-type-forge`'s `StrictOmit` / `RelaxedOmit` and the rest,
where the intent is written down rather than imposed.

This only widens what is accepted, so anything that compiled before still does.

Three workarounds the narrowing had forced on the converter go away with it:
the `RelaxedExclude` substitutions in `lib.esnext.temporal.d.ts`, in
`lib.dom.d.ts`'s `SVGElementTagNameMap` subtraction, and in the generated
`ToObjectEntries` helper.
