---
'ts-codemod-lib': minor
'ts-codemod-cli': minor
---

New `enableNoUncheckedIndexedAccessTransformer`, available from the CLI as
`--transformer enable-no-unchecked-indexed-access`: it appends `!` to the index
accesses that turning on `noUncheckedIndexedAccess` would turn into type
errors, as a stopgap while the option is being enabled on an existing codebase.

The rewrite is driven by the type checker rather than by syntax. Each file is
checked twice, once with `noUncheckedIndexedAccess` off and once with it on,
and `!` is appended only where the option is what added `undefined` to the
expression's type — so an index whose presence the type already guarantees
keeps its access as it is (`[T, T][1]`, `[T, T, ...T[]][0]`, `({ a: T })['a']`),
as does an element type that contained `undefined` to begin with, and so does
an access a preceding guard has already narrowed.

Positions where an assertion would be invalid or would defeat a check are left
alone: assignment targets (`xs[0] = 1`, `xs[0]++`, `delete rec['a']`), accesses
that already account for `undefined` (`xs[0]!`, `xs[0] as T`, `xs[0]?.foo`,
`xs[0] ?? d`), and the places that read a value precisely to find out whether
it is there (`typeof`, `!x`, `=== undefined`, conditions, `switch` subjects).
The new `applyLevel` option (`'all'` by default) can be set to
`'avoidWhereUndefinedIsAllowed'` to additionally skip the reads whose
contextual type already accepts `undefined`.

Destructuring (`const [head] = xs;`) and compound assignment (`xs[0] += 1`) are
the two cases it cannot fix, since `!` has nowhere to go in either.

The result is a stopgap and wants reviewing. Each file is transformed on its
own, as it is by every transformer here, so a narrowing that depends on an
imported type guard is invisible and produces an assertion the whole-program
check does not need; `eslint --fix` takes most of those back out through
`@typescript-eslint/no-unnecessary-type-assertion`.
