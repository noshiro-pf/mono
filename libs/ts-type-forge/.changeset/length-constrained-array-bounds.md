---
'ts-type-forge': minor
---

**New: the bounds of a length-constrained array type can now be read back, and
its element type can be replaced while keeping the constraint.**

The `*LengthArray` family encodes its bounds in a brand shaped for _subtyping_
rather than for retrieval — `MinLengthTuple<MinLength, 0>` and
`UintRangeInclusive<0, MaxLength>` — so a consumer had no way to get the numbers
out, and no way to build "the same constraint with a different element type".

| type                          | purpose                                                                  |
| :---------------------------- | :----------------------------------------------------------------------- |
| `MinLengthOf<Ar>`             | the minimum length the brand guarantees (`0` when it has no lower bound) |
| `MaxLengthOf<Ar>`             | the maximum length the brand allows (`never` when it has no upper bound) |
| `HasLengthConstraint<Ar>`     | whether `Ar` carries a length-constraint brand at all                    |
| `LengthConstraintBrandOf<Ar>` | the brand itself, as an object type (`{}` for a plain array or tuple)    |
| `ChangeArrayElement<Ar, Elm>` | `Ar` with its element type replaced by `Elm`, constraint kept            |

```ts
type A = MinLengthOf<BoundedLengthArray<2, 5, string>>; // 2
type B = MaxLengthOf<BoundedLengthArray<2, 5, string>>; // 5

type C = ChangeArrayElement<MinLengthArray<3, number>, string>;
// MinLengthArray<3, string>
```

Both bounds are recovered from the brand by counting it back, so nothing extra
is instantiated: `MinLengthOf` peels the encoded tuple's fixed prefix, and
`MaxLengthOf` walks up from `0` testing membership of the encoded range, which
it leaves intact (rebuilding a smaller union with `Exclude` at every step would
make the walk quadratic in the bound). Both are one cheap step per unit of the
bound, which keeps them well inside TypeScript's instantiation-depth limit for
realistic bounds but makes them unsuitable for bounds in the thousands.

`ChangeArrayElement` exists because the obvious homomorphic mapped type cannot
do the job: a length-constrained array is an intersection of a tuple and the
brand object, which TypeScript does not treat as an array type, so
`Readonly<{ [K in keyof Ar]: Elm }>` maps `length`, the array methods and the
brand keys to `Elm` as well and yields a non-array object. For a plain array or
tuple `ChangeArrayElement` _is_ that homomorphic mapping, so tuples keep mapping
element-wise and plain arrays stay plain arrays.
