# ts-std-forge-keys

The keys of the type-only properties of [ts-std-forge](https://github.com/noshiro-pf/mono/tree/main/libs/ts-std-forge)'s `Optional`. You do not install this package yourself: ts-std-forge depends on it, at one exact version.

## Why a package of its own

At runtime a `Some` is the value it holds and `None` is a reserved string, so the properties that tell `Some<S>` from `None` exist in the type alone. Their keys are `unique symbol`s that are declared and never defined: no code names them by accident, so an object literal that writes them out cannot pass for an Optional and a property access cannot read a `Some`'s value past `Optional.unwrap`.

A `unique symbol` declared inside ts-std-forge would make the `Optional` of each copy of ts-std-forge a type of its own, and an Optional made by one copy (say, the one a dependency brought) would not be accepted by another. Declared here, the keys are the same in every copy: TypeScript treats two copies of one package at one version as one package, so every ts-std-forge that depends on the same version of this package declares the same `Optional`.

## Versioning

The version of this package is the version of the runtime encoding of an Optional (`ts-std-forge/src/functional/optional/impl/encoding.mts`). It changes when, and only when, an Optional made by one version of ts-std-forge would be read wrongly by another, so that the two `Optional` types stop being assignable to each other exactly then, and the compiler reports where they meet. `libs/ts-std-forge/test/optional-encoding-by-keys-major.json` records what the encoding writes under each major of this package; ts-std-forge's encoding test fails when the encoding is not the newest entry's. That entry's major is this package's version, or the one above it while a changeset raises it; the test checks that it is one of the two, and which one it should be takes the changesets, which it does not read.

The version is always a major alone (`1.0.0`, `2.0.0`), never a minor, a patch or a prerelease: any other version would change the type of every Optional without a change of encoding, and changesets' pre mode is not used for it. What a version declares never changes either: a change of declarations goes with a change of encoding, under the new major. This README, published with each version, is corrected with the next major too.

## Exports

- `optionalVariant`: the key of the discriminant of `Some` (`'some'`) and `None` (`'none'`).
- `optionalValue`: the key of the value of `Some`.

Both are declared and never defined, and exported as types only (`export type`), so they can key a type but no code can hold them as values; the package has no runtime code.
