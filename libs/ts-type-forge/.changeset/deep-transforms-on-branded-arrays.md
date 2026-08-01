---
'ts-type-forge': minor
---

**Fix: `DeepReadonly` / `DeepMutable` / `DeepPartial` / `DeepRequired` no longer
turn a length-constrained array into a non-array object.**

All four transforms end in a homomorphic mapped type over `keyof T`. A
length-constrained array is an intersection of a tuple and a brand object, which
TypeScript does not treat as an array type, so that mapping walked `length`,
every `Array.prototype` method and the brand keys and produced an object with
those as ordinary properties:

```ts
type Broken = DeepReadonly<MinLengthArray<3, { a: number[] }>>;
// { readonly length: number;
//   readonly map: <U>(cb: (v: { a: number[] }, …) => U, …) => U[];
//   readonly concat: …; readonly filter: …; … }
```

The result was not an array, could not be indexed or iterated, and the damage
nested — `DeepReadonly<{ xs: MinLengthArray<2, number> }>` corrupted `xs` the
same way. This is the same failure `ChangeArrayElement` was introduced to avoid,
reached through a different door; it needs no tuple intersection and reproduces
on a bare `MinLengthArray`.

Each transform now recognizes an array carrying keys beyond the array members
and rebuilds one, carrying the brand across:

```ts
type Fixed = DeepReadonly<MinLengthArray<3, { a: number[] }>>;
// readonly { readonly a: readonly number[] }[] & <brand>

MinLengthOf<Fixed>; // 3
HasLengthConstraint<Fixed>; // true
```

A plain array or tuple is untouched — it still maps element-wise, so
`DeepReadonly<readonly [{ a: number[] }, { b: string[] }]>` keeps its two
positions distinct exactly as before.

The rebuild deliberately stops short of restoring the structural
minimum-length prefix, so the result is strictly **wider** than the matching
family member: `MinLengthArray<3, DeepReadonly<E>>` is assignable to it, not the
other way round, and indexed access needs a guard again. Restoring the prefix
means recovering the bounds, which costs one instantiation per unit of the
bound — affordable for a single array, but not for every array an already deeply
recursive transform reaches. Paying it was enough to push this package's own
`DeepReadonly<ExecOptions>` assertion over the instantiation-depth limit and
surface TS2589 in unrelated modules. Call `ChangeArrayElement` directly when one
array needs its exact shape back.

`DeepMutable` is the one member that cannot fully deliver on its name here. The
family's structural part is a readonly tuple, so a mutable array carrying a
length-constraint brand is not expressible with these types at all; it
deep-mutates the element type and leaves the array itself readonly and branded.

Cost across this package's own suite: **+80.8k instantiations, about 5.1%**
(1,658,120 against a 1,577,296 baseline) — the price of testing every array for
extra keys.

**Fix: `HasLengthConstraint` and `ChangeArrayElement` no longer treat a mutable
array as brand-carrying.**

Both read the brand by subtracting the array's own keys from `keyof Ar`, but
subtracted only `keyof (readonly unknown[])`. A mutable array also carries
`push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill` and
`copyWithin`, none of which the readonly key set mentions, so all nine survived
the subtraction and were read as brand keys:

```ts
HasLengthConstraint<number[]>; // was true, now false
ChangeArrayElement<number[], string>;
// was: readonly string[] & Pick<number[], 'push' | 'pop' | 'splice' | …>
// now: readonly string[]
```

Every caller so far passed a readonly array, which is why this stayed latent;
the deep transforms above are the first to hit it, since a mutable array is the
ordinary input to `DeepReadonly`. Both key sets are subtracted now.
