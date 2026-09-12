---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

Two fixes to declarations that compiled fine and went wrong at the use site.

**`ReturnType<typeof setTimeout>` no longer comes out `unknown`.** `ReturnType`
and `InstanceType` spelled their conditional's `extends` clause
`(...args: readonly never[]) => infer R`. An overload set whose last member is
generic, with a rest parameter computed from its own type parameter, does not
match that — so the conditional took its false branch and produced `unknown`,
silently, because a false branch is a type rather than an error. `@types/node`'s
`setTimeout<TArgs extends any[]>(cb, ms?, ...args: MakeVoidParameterOptional<TArgs>)`
is exactly that shape once it merges with the DOM's `setTimeout`, so
`ReturnType<typeof setTimeout>` was `unknown` and could not be handed back to
`clearTimeout`.

The spelling is now a bare `never`, which is what the stock library itself uses
for `ThisParameterType` and `OmitThisParameter`, and which gives up none of the
`any` removal this library exists for. The type-parameter constraint is spelled
the same way, so the false branch is unreachable for any `T` the constraint
admits: "did not resolve" can no longer arrive as an `unknown` that propagates.

That `never` now has a name, `StrictLibInternals.AnyArguments`, declared in
`lib.es5.d.ts`. `any` reads two ways in a function type and only one of them is
what this library removes: `any` as a _value_ becomes `unknown` or `never` by
variance, while `any` as a _wildcard_ — the `(...args: any)` in `ReturnType` —
describes nothing at all and is there only to switch the parameter comparison
off. The stock library spells that wildcard two ways (`any` in `ReturnType`,
`never` in `ThisParameterType`); this library spells it one way, and the name
says which of the two readings is meant. Every such position uses it: the four
utility types and `ThisParameterType` in `lib.es5.d.ts`, the decorator context
type parameters in `lib.decorators.d.ts`, and `Reflect.construct`'s `newTarget`
in `lib.es2015.reflect.d.ts`. The last two were not broken; one spelling is so
that the trap cannot be re-dug, and so that grepping the name finds all of
them.

**A replacement callback's trailing arguments are `string | undefined`, not
`unknown`.** `String.prototype.replace` / `replaceAll` and the
`[Symbol.replace]` they dispatch to typed the captured groups `readonly
unknown[]`, which forced every caller to narrow with `isString` before using a
group that the pattern shows can never be absent. They are now
`readonly (string | undefined)[]` — the type of a capture group — so contextual
typing gives `string | undefined` and a `?? ''` or a `!== undefined` check is
enough. Reading the participating-group count off a regular expression literal
is not something the type system can do, so this trades a little soundness for
it: a callback may declare a parameter past the last capture as
`string | undefined` and be handed the offset instead. That is still narrower
than the `any[]` the stock library ships.
