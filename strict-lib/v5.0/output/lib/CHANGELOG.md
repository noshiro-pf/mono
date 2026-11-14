# strict-ts-lib-v5.0

## 0.6.11

### Patch Changes

- c02ee5a: `XMLHttpRequest#open` takes any HTTP method token: its `method` is
  `HTTPRequestMethod | (string & {})`, where it was the `<form method>` values
  `'post' | 'get' | 'dialog'`. `xhr.open('POST', url)`, `'PUT'`, `'patch'` and a
  custom token such as `'PROPFIND'` now type-check, and the union keeps the
  upper-case methods as literal members.

    `Request#method` is `string`, as in TypeScript's own lib, where it was the
    upper-case `HTTPRequestMethod`. Fetch upper-cases only some standard methods and
    passes any other token through as written, so `'patch'` and `'PROPFIND'` are
    possible values.

- 50a6476: The `minimumFractionDigits` / `maximumFractionDigits` options of
  `Intl.NumberFormat`, `Intl.PluralRules`, `Number#toLocaleString` and
  `BigInt#toLocaleString`, and the same fields of the resolved options, are
  `UintRangeInclusive<0, 100>`, where they were capped at 20. ECMA-402 raised the
  limit to 100 in its 2023 edition, so `{ maximumFractionDigits: 30 }` now
  type-checks. Integer and significant digits keep their range of 1–21.
- 7057096: In the branded flavor, `String#repeat`'s `count` is
  `NumberType.StringSizeArgNonNegative`, as `includes`, `startsWith` and
  `endsWith` take, where it was a bare `SafeUint`. An integer literal from 0 to
  39, such as `'-'.repeat(3)`, type-checks again without `asSafeUint`; a larger
  one still needs it, and a negative or fractional one is rejected.
- 1e7b334: In the branded flavor, the `length`, `byteOffset` and `byteLength` parameters of
  the typed-array, `DataView` and ES5 `ArrayBuffer` constructors, and
  `Atomics.notify`'s `count`, are `NumberType.TypedArraySizeArgNonNegative`, as
  `new SharedArrayBuffer(8)` takes, where they were a bare `TypedArraySize` or
  `SafeUint` (the `BigInt64Array` and `BigUint64Array` `byteOffset` already took
  it). An integer literal from 0 to 39, such as `new Uint8Array(4)` or
  `new DataView(buffer, 0, 8)`, type-checks without a cast; a larger one still
  needs one, and a negative one is rejected. `Float16Array`'s constructor takes
  the same in the versions whose `Float16Array` declarations are converted.

## 0.6.10

### Patch Changes

- 3c98f7c: `Object.fromEntries` no longer types a key the entries may not set as present,
  nor a repeated key as `never`:

    - in a tuple of entries, an entry whose key is a union (`[[k, 1]]` for
      `k: 'x' | 'y'`) makes each of its keys optional (`{ x?: 1; y?: 1 }`); a key an
      earlier entry already set stays present, with either value;
    - in a tuple of entries, a later entry replaces an earlier one with the same
      key, as at run time: `[['x', 1], ['x', 2]]` gives `{ x: 2 }`, where it gave
      `never`;
    - an iterable that is not an array, such as a `Map<'a' | 'b', number>`, gives
      `Partial<Record<'a' | 'b', number>>` when its key type is a union of literals,
      as an array of entries already did;
    - a key type made of index signatures alone (`string | number`, a union of
      template literal types such as `` `a-${string}` | `b-${string}` ``) is no
      longer made `Partial`, from an array or any other iterable, so its values are
      not typed `| undefined`;
    - inside a generic function, the result for an iterable that is not an array,
      with key type `K`, is a conditional type that stays unresolved, so it is no
      longer assignable to `Record<K, V>`; the result for an array of entries
      already was not.

## 0.6.9

### Patch Changes

- b39bd06: In the branded flavor (`libs-branded/`), `Math.trunc` of a finite branded number
  returns a finite integer, as `Math.floor`, `Math.ceil` and `Math.round` do,
  rather than `Int | InfiniteNumber | NaNType`. An `Int` argument comes back
  unchanged, a non-negative one is a `NonNegativeInt`, a non-positive one a
  `NonPositiveInt`, and any other finite one an `Int`. Truncation moves toward
  zero, so a non-zero brand is never kept: `Math.trunc(0.5)` is `0`.
- 15ac030: `Array#includes` and `ReadonlyArray#includes` no longer narrow the false branch
  to a type the argument can still hold. A `false` means "not in this array", not
  "not of type `T`", so they now narrow only an argument none of whose members is
  in `T`:

    - an argument already of type `T` (`i: number` searched in a `number[]`) returns
      `boolean`, so `i` is no longer `never` after `if (xs.includes(i)) return;`;
    - an argument overlapping `T` (`s: 'a' | 'c'` searched in an `('a' | 'b')[]`)
      returns `boolean`, so `s` is no longer `'c'` after
      `if (allowed.includes(s)) return;`;
    - a wider argument (`s: string` searched in a `readonly ('a' | 'b')[]`) still
      narrows `s` to `'a' | 'b'` on the true branch, as before.

- 5cbcc0d: In the plain flavor (`libs/`), the generic `Math.abs` overload takes a
  `SmallInt` literal, as in the branded flavor, rather than any `number`. It
  returned `AbsoluteValue<N>`, which rewrites only a number literal, so a
  ts-type-forge brand came back unchanged: `Math.abs` of an `Int16` was typed
  `Int16`, although `Math.abs(-32768)` is `32768`. Any other argument, branded or
  not, now gets a `number`; `Math.abs(-3)` is still `3`, while a literal outside
  `SmallInt` (`-100`, `-1.5`) is a `number` rather than its absolute value.

## 0.6.8

### Patch Changes

- e696312: In the branded flavor (`libs-branded/`), `Math.floor`, `Math.ceil`, `Math.round`
  and `Math.abs` of a finite branded number no longer keep brands the operation
  does not preserve:

    - `floor` / `ceil` / `round` return an integer argument's type unchanged,
      including a generic caller's type parameter. For any other argument they keep
      only the sign bound (`NonNegativeInt` / `NonPositiveInt`), and non-zero only
      where rounding moves away from zero: `Math.ceil` of a positive number is a
      `PositiveInt`, `Math.floor` of a negative number a `NegativeInt`. `Math.floor`
      of a `PositiveFiniteNumber` had been typed non-zero, though `Math.floor(0.5)`
      is `0`.
    - `abs` returns a non-negative argument's type unchanged, so a `Uint16` stays a
      `Uint16`. For any other argument it keeps finiteness and integrality, turns a
      signed width into the unsigned one (`Int16` to `Uint16`, `Int32` to `Uint32`),
      keeps `SafeInt`, and is positive exactly when the argument is non-zero. An
      `Int16` had stayed an `Int16`, though `Math.abs(-32768)` is `32768`, and a
      `NegativeFiniteNumber` had kept its `<= 0` bound.

    Code that relied on a dropped brand stops compiling — for example
    `const d: NonZeroNumber = Math.floor(positive)` or passing `Math.abs(int16)`
    where an `Int16` is expected — because the value it accepted could break that
    brand. A `Float16` / `Float32` / `Float64` brand on a non-integer argument is
    dropped too, though the operation would keep it. The plain flavor is unchanged.

## 0.6.7

### Patch Changes

- 53c3abc: A set or map of a literal union keeps the literal union where its element type
  is inferred:

    - `union` and `symmetricDifference` of two `ReadonlySet<'a' | 'b'>` are
      `ReadonlySet<'a' | 'b'>`, where they had been `ReadonlySet<string>`.
    - `const s: ReadonlySet<'a' | 'b'> = new Set(['a'])`, and the same with
      `new Map(...)` and a `ReadonlyMap`, infer the type arguments from the
      annotation instead of failing with `Set<string>`.
    - A `Set<'a' | 'b'>` passed to a parameter `ReadonlySet<T>` infers
      `T = 'a' | 'b'`, where it had been `string`; the same for a `Map` passed to a
      `ReadonlyMap<K, V>`.

    The parameter of `has` on `Set`, `ReadonlySet`, `Map`, `ReadonlyMap`,
    `WeakSet` and `WeakMap` is `NoInfer<T | (WidenLiteral<T> & {})>`. It still
    accepts the widened type, so a `ReadonlySet<'a' | 'b'>` can be queried with a
    `string`, but no longer takes part in inference. A method parameter is
    bivariant, so where `T` was inferred structurally through `has` — between `Set`
    and `ReadonlySet`, which are different interfaces — the widened parameter had
    widened `T` to `string`. `NoInfer` was introduced in TypeScript 5.4, so the
    bundles for 5.0 to 5.3 are unchanged.

    `ReadonlySetLike#has`, the argument type of the ES2025 Set methods (TypeScript
    5.5 and later), takes the same parameter. It had been left as `has(value: T)`.

- 081639f: `Object.entries` on a record with optional keys returns entries that can be
  destructured again: `for (const [key, value] of Object.entries(record))` no
  longer fails with TS2488 when `record` is, say,
  `Readonly<{ a?: number; b?: string }>`.

    The mapped type behind the record overload kept each optional key optional, so
    indexing it added `undefined` to the entry itself, not only to its value. The
    value of an optional key is still `number | undefined`; the entry is
    `readonly ['a', number | undefined]` rather than that or `undefined`.

## 0.6.6

### Patch Changes

- f8bbeca: `globalThis.navigator`, `globalThis.location`, `globalThis.crypto`,
  `globalThis.self` and the other globals a window and a worker share type-check
  again.

    The bundles declare global variables with `const` rather than `var`, so that
    assigning to one is an error. A `const` is not a property of
    `typeof globalThis`, though, so every such name had dropped out of
    `globalThis.X`. That is harmless where another spelling reaches the name
    everywhere it exists — `Number.NaN`, a bare `Map`, `window.history` — but a
    name that `lib.dom` and `lib.webworker` both declare also exists where there is
    no `window`, and Node.js has `navigator`, `crypto` and `performance` too, so
    `globalThis.X` is its one portable spelling. Those names (240 in the TypeScript
    7.0 lib: the `fetch`-family constructors, `navigator`, `location`, `crypto`,
    `performance`, `self`, `console`, …) are `var` again in `dom` and `webworker`;
    every other global stays `const`.

    With `@types/node` installed, `fetch` and `Response` now resolve to the
    bundle's DOM declarations again: `@types/node` declares its own `Response` only
    when `typeof globalThis` has none, which, with the DOM's hidden, was always.
    `Response#json()` is then the bundle's `Promise<MutableJsonValue>` rather than
    Node's `Promise<unknown>`, so a cast such as
    `res.json() as Promise<readonly Row[]>` no longer type-checks, because a
    `MutableJsonValue` array is mutable. Validate the value, or cast to a mutable
    array.

    The rule that turns a `var` inside a namespace into `const` no longer reaches
    outside namespaces either. It had been rewriting `HTMLElementTagNameMap`'s
    `var` key (the `<var>` element) to `const`, and `var()` in a comment.

## 0.6.5

### Patch Changes

- e56015d: The `strict-ts-lib-v7.0` README now leads with the linker
  (`npx strict-ts-lib-v7.0-link`, run from your `prepare` script) and offers
  `paths` as the alternative. Both work under TypeScript 7, but only the linker
  reaches TypeScript 6 — which is what typescript-eslint runs, so with `paths`
  alone a type-aware lint silently sees the stock library. The comment at the
  top of every bundle's `link-libs.mjs`, which called the two routes exclusive,
  is corrected to match. Nothing about the declarations or the linker's
  behavior changed.

## 0.6.4

### Patch Changes

- 4ad8086: The published bundles now carry the attribution Apache-2.0 asks of a
  derivative work.

    Every generated declaration file is a rewrite of a TypeScript lib file, which
    is Copyright Microsoft Corporation under Apache-2.0. The generator used to
    strip the upstream copyright banner and the bundles shipped no license text.
    Now each file keeps the banner and states beneath it that it was modified,
    and each bundle ships `LICENSE` and a `NOTICE` naming the upstream commit it
    was generated from. Nothing about the declarations themselves changed.

## 0.6.3

### Patch Changes

- 90bf42e: Two fixes to declarations that compiled fine and went wrong at the use site.

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

## 0.6.2

### Patch Changes

- 68452d4: Allow `0` as `toExponential`'s `fractionDigits`: the parameter type becomes `UintRangeInclusive<0, 100>`. ECMA-262 accepts 0–100 — `(1).toExponential(0)` is legal and returns `'1e+0'` — so the previous lower bound of 1 rejected a valid call.

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

- efdba4e: Generate a `CHANGELOG.md` for each published strict standard library bundle.

    The bundles are not private, so `changeset publish` releases them, and the
    changesets action reads the changelog of every package whose version moved to
    build the release notes. Their versions move on every release — the generator
    rewrites those manifests after `changeset version` has bumped the harnesses —
    but nothing ever wrote them a changelog, so the release failed before
    publishing anything.

- 7e70001: Ship a linker with every strict standard library bundle, so the packages for
  TypeScript 6 and earlier can be used at all.

    Those versions resolve `@typescript/lib-*` as ordinary package names, through
    a fixed Node10 lookup that ignores `paths` — and a single package shipping
    every lib as a subdirectory has no name for them to find. `npx <package>-link`
    supplies the names, as one symlink per lib group under
    `node_modules/@typescript/`. TypeScript 7 is unchanged: it reads `paths` and
    no longer does the name lookup.

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
