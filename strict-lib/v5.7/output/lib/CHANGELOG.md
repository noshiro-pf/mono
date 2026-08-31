# strict-ts-lib-v5.7

## 0.6.1

### Patch Changes

- c5853e4: Spell numeric argument ranges with `UintRangeInclusive` instead of `UintRange`: `toFixed(fractionDigits?: UintRangeInclusive<0, 100>)` now names its bounds the way the docs do ("0 – 100, inclusive") rather than with an exclusive upper bound (`UintRange<0, 101>`). Applied to every converted range — `toString` radix, `toPrecision`, JSON `space`, `BigInt.asIntN/asUintN` bits, and the `Intl` digit options. The expanded literal-union types are unchanged; this is purely a notation change in the emitted declarations.

## 0.6.0

### Minor Changes

- ac290c1: Leave `Exclude`, `Extract`, `Omit` and `Pick` with the constraints TypeScript
  declares, and widen `strict-ts-lib-v7.0`'s `typescript` peer range to
  `>=6.0.0 <8.0.0`.

    Both landed on main in #1672 and #1673 but shipped no release: those changesets
    named the bundle packages (`strict-ts-lib-v7.0` and friends) rather than the
    `-source` harnesses this repository versions. `changeset version` bumped the
    bundle manifests, and `strict-lib:gen:packages` — which runs next and stamps
    each bundle with its harness's version — wrote 0.5.1 straight back over them,
    the harnesses never having been bumped at all. Nothing errored; the version
    simply did not move.

    All twelve harnesses are named. The `fixed` group in `.changeset/config.json`
    would align the versions from a single name, but a changeset's text reaches
    only the packages it names — the rest get a bare version heading with nothing
    under it. A change to the shared converter affects every series equally, so
    every series' changelog should say so.

    ### `Exclude` and `Omit`

    Two of the four utility types had their second argument narrowed here —
    `Exclude<T, U extends T>` and `Omit<T, K extends keyof T>`, against upstream's
    `Exclude<T, U>` and `Omit<T, K extends keyof any>`. `Extract` and `Pick`
    already matched.

    Narrowing makes a choice on the caller's behalf, and only one of the two
    readings is ever right for a given call. Subtracting keys a type may not have
    is legitimate — upstream's own declarations do it — and under the narrowed
    constraint it is a TS2344 that nothing can fix when the declaration lives
    inside a dependency. Making the choice explicit belongs in the caller's code,
    which is what `eslint-plugin-ts-type-forge`'s
    `prefer-strict-or-relaxed-utility-type` does, pointing at `StrictOmit` /
    `RelaxedOmit` and the rest.

    Only widens what is accepted, so anything that compiled still does.

    ### Peer range

    TypeScript 6.0.3 compiles the v7.0 lib set with `skipLibCheck: false` and no
    errors, and resolves `@typescript/lib-*` by the same package-name lookup
    TypeScript 7 uses, so one bundle serves both compilers. Without the wider
    declaration npm refuses to install it beside TypeScript 6.

## 0.5.1

### Patch Changes

- strict-ts-lib-scripts-common@0.0.1

## 0.4.0

### Minor Changes

- 931dc7c: Ship every built-in library inside one package instead of ~107 per flavor: install one tarball and map @typescript/lib-* to its libs/ directory with tsconfig paths

## 0.3.0

### Minor Changes

- 5ea9021: Stop `string & {}` from leaking into key types that are already `string`.

    `Object.keys` and `Object.entries` open their key union with a `string & {}` arm
    so that the declared keys still autocomplete while the excess keys a wider
    object may carry are accepted. That arm only means something for a union of
    string literals. Added to a key type that already contains `string` it produced
    `string | (string & {})` — which _is_ `string`, just spelled in a way that then
    showed up in everything computed from it.

    The arm is now added only where it widens something (`WithOpenString`):

    | expression                               | before                                                  | after                      |
    | ---------------------------------------- | ------------------------------------------------------- | -------------------------- |
    | `Object.keys(rec: Record<string, V>)`    | `(string \| (string & {}))[]`                           | `string[]`                 |
    | `Object.entries(rec: Record<string, V>)` | `(readonly [string, V] \| readonly [string & {}, V])[]` | `(readonly [string, V])[]` |
    | `Object.keys(obj: { a: 1; b: 2 })`       | `('a' \| 'b' \| (string & {}))[]`                       | unchanged                  |
    | `Object.entries(obj: { a: 1; b: 2 })`    | keeps the open arm                                      | unchanged                  |

    This also fixes `Object.fromEntries(Object.entries(rec).map(...))` on a record
    keyed by an index signature. `PartialIfKeyIsUnion` wraps the result in `Partial`
    when the key is a union, and the redundant arm made every key type a union — so
    `Record<string, V>` came back as `Partial<Record<string | (string & {}), V>>`
    and could not be assigned back to the record type it came from. With the arm
    gone the key is plain `string`, which is not a union, so the result stays total.
    Records with literal keys still get `Partial`, since entries genuinely may not
    cover every declared key.

    `PartialIfKeyIsUnion` itself is unchanged, as are hand-written entries arrays
    and the fixed-length-tuple path.

### Patch Changes

- 9e98b83: Fix `Set` / `Map` subclassing, tighten the collection constructors, and publish three lib files at the subpath TypeScript actually looks up.

    - `SetConstructor.prototype` / `MapConstructor.prototype` were narrowed to
      `Set<never>` / `Map<never, never>`, which made every `class X extends Set<T>`
      and `class X extends Map<K, V>` fail with TS2417 — `prototype` is what the
      `extends` clause checks a subclass's static side against. They are now the
      `ReadonlySet<unknown>` / `ReadonlyMap<unknown, unknown>` form, matching how
      `ArrayConstructor.prototype` is already declared. The protection against an
      untyped `new Set()` / `new Map()` swallowing anything is unchanged: it comes
      from the constructor overloads, not from `prototype`.
    - `lib.es2015.symbol.wellknown`, `lib.es2016.array.include` and
      `lib.es2020.symbol.wellknown` were published one directory level too deep
      (`es2015/symbol/wellknown` instead of `es2015/symbol-wellknown`), a subpath
      `libReplacement` never resolves — so consumers silently got the stock
      declarations for those three libs. They now land where TypeScript looks.
    - An untyped `new WeakSet()` / `new WeakMap()` no longer accepts every object.
      Both now default to `never`, like `new Set()` / `new Map()` already did.
      `new WeakSet<object>()` and `new WeakMap<object, number>()` keep working,
      because the no-argument overload carries its own type parameters.
    - `null` is no longer an accepted initializer for any of the four collection
      constructors. Upstream allows `new Set(null)` because the runtime tolerates
      it, but a `null` reaching a collection constructor is a bug at the call site
      rather than an intentional "start empty" — `new Set()` says that already.
      Passing a plain optional still works (`(xs?: readonly T[]) => new Set(xs)`);
      code that types its own parameter as `... | null` and forwards it has to drop
      the `| null`. **This is the one change here that can require a consumer edit.**
    - `Temporal.PartialTemporalLike` no longer trips this lib's narrowed
      `Exclude<T, U extends T>` (TS2344).

## 0.2.0

### Minor Changes

- c0c9f9d: Bump all packages (minor).
