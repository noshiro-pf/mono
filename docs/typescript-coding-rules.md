# TypeScript coding rules

The coding conventions of this repository with their reasons and examples.
`CLAUDE.md` keeps only a summary of them ("Testing", "Coding style",
"Libraries"); this file is where the examples live. Most rules are enforced by
the shared ESLint configuration (`libs/eslint-config-typed`), and the rule id
is named beside each one. Where the error invites `eslint-disable`, the
intended fix is shown under "Troubleshooting".

## Important patterns

- **Immutability**: functions return immutable data structures.
- **Type safety**: lean on `ts-type-forge` for type-level work.
- **Type guards**: prefer type guard functions over type assertions.
- **Imports**: import `.mts` with the `.mjs` extension. Use relative paths
  within `src/`; never import from `dist/`, and never name `index.mjs`
  directly.
- **Exports**: everything a directory offers goes through its generated
  `index.mts`. Use named exports; a default export is for configuration only.
- **Documentation**: generated from TSDoc comments by TypeDoc.
- **Naming**: `camelCase` for variables and functions, `PascalCase` for types
  and classes, `kebab-case` for file names. `.mts` for modules, `.d.mts` for
  types; the compiled output is `.mjs`.
- **Formatting**: Prettier, with the organize-imports and package.json
  plugins; do not format by hand. Two-space indentation and LF line endings;
  Markdown uses four spaces (`.editorconfig`).

### Why enforce `readonly`?

```ts
// ❌
const t: [string, number] = ['a', 1];

function f(x: number) {
    if (typeof x !== 'number') throw new Error('Error!!');
}

t.reverse(); // [1, 'a']

f(t[1]); // "Error!!" (but no type errors)
```

`reverse` is destructive: after it runs, `t` holds `[1, 'a']`, but its type is
still `[string, number]`. `t[1]` is a `number` to TypeScript and a `string` at
run time, and `f` throws.

Annotated `readonly`, the tuple has no `reverse`. The non-destructive
`toReversed` has to be used instead, and its result is typed
`(string | number)[]`, so the mistake becomes a type error:

```ts
// ✅
const t: readonly [string, number] = ['a', 1];

function f(x: number) {
    if (typeof x !== 'number') throw new Error('Error!!');
}

const r = t.toReversed(); // (string | number)[]

f(r[1]);
// Argument of type 'string | number' is not assignable to parameter of type 'number'.
```

Treating most values as immutable also makes code easier to read and prevents
bugs such as mutating an object in place in React, where an unchanged
reference means the UI does not update.

See also: [TypeScript Issue #52375](https://github.com/microsoft/TypeScript/issues/52375)

## File organization

Organize a file top-down, so that reading downward starts from the main logic:
the entry point and the public API first, then the details. Among the helpers
the order turns around: a helper comes before the helpers that call it, so
that each one is read after what it is built from.

1. **main function** — the entry point, at the top
2. **exported functions and definitions** — the public API
3. **type definitions** used by the above
4. **constants and settings**
5. **helper functions**, by call level, lower-level helpers before their
   callers — utility functions, the lowest level, before the helpers that call
   them

Exported functions and components come immediately after the imports.

`ts-restrictions/function-order` checks the functions in this order: exported
ones before the non-exported helpers, and each helper before the helpers that
call it. A non-exported function referred to outside every function body (a
`main()` called at the top level) is left where it is, and types and constants are not
checked.

### React component files

1. imports
2. `type Props = { ... }`
3. the exported component
4. the `displayName` assignment, if the component is memoized
5. everything else: styles, helpers, constants

One component per file.

## Syntax rules

- Type safety first
    - **Never** use `as any`, `as never` or `@ts-ignore` (`@ts-expect-error`
      when absolutely necessary). Avoid casts altogether where possible.
    - Give functions explicit return types
      (`@typescript-eslint/explicit-function-return-type`). They make the
      returned type visible and speed up type checking in large code bases.
    - Make properties and parameters `readonly` by default.
    - No implicit coercion: no non-boolean values in `if` / `while`
      conditions or as operands of logical operators
      (`@typescript-eslint/strict-boolean-expressions`), and only `number`,
      `string` and `boolean` in template literals
      (`@typescript-eslint/restrict-template-expressions`).
    - Always pass a comparison function to `sort`, except on `string[]`
      (`@typescript-eslint/require-array-sort-compare`).
    - No operations that easily throw, such as a `reduce` without an initial
      value or an unchecked division (see "Troubleshooting").
- Branching on a kind
    - When a reducer or any other function branches on the kind of its input
      (an action's `type`, a string literal union), name every kind as a
      case of its own. An `if` or a ternary that tests one kind and leaves
      the rest to `else` does not say which kinds `else` was meant for, and
      a kind added later lands there silently.
    - For a string literal union, use `match` from ts-data-forge with every
      member as a key: it fails to type-check when a member is missing or
      an extra key is given, and needs no default.

        ```ts
        (isOn: boolean, action: 'reset' | 'toggle') =>
            match(action, { toggle: !isOn, reset: false });
        ```

    - For a discriminated union whose cases read their own payload, use
      `switch` with a `case` for every member and no `default`
      (`@typescript-eslint/switch-exhaustiveness-check`): `match` looks a
      value up and cannot narrow `action` inside a case. Where a set of
      kinds is handed on whole, such as another reducer's actions, wrap it
      as one kind (`{ type: 'filter'; action: FilterAction }`) rather than
      listing its members.
- Operators
    - No `+foo` or `'' + foo` for coercion (`no-implicit-coercion`), and no
      `'1' + 2` (`@typescript-eslint/restrict-plus-operands`).
    - No `+` to concatenate strings (`prefer-template`). Use a template literal
      for a few strings (`` `${a}_${b}` ``), `.join()` for many or for a
      dynamic list (`['aaa', 'bbb', ..., 'zzz'].join('\n')`), and `dedent` for
      generated source code.
- Immutable data
    - `const`, not `let` (`functional/no-let`); where a mutable binding is
      unavoidable, prefix it `mut_`.
    - `readonly T[]`, never `T[]`. When nested `Readonly<...>` gets verbose,
      use `DeepReadonly<{ a: { b: { c: number[] } } }>`.
    - Define object and array constants `as const`.
    - Do not mutate objects, and do not make arguments or return values
      mutable (`functional/immutable-data`).
    - Avoid class inheritance and enums.
- Modern syntax
    - No `var`, `new Array()`, the `in` operator or
      `React.useImperativeHandle`.
    - Prefer template literals and object spread.
    - Arrow functions everywhere.
- Modules and dependencies
    - ES modules, not CommonJS `require`.
    - Named exports unless a library or framework requires otherwise.
    - Destructuring imports (`import { foo } from 'bar'`), except for Node.js
      utilities such as `fs`, `path` and `url`.
    - No circular imports (`import-x/no-cycle`).
    - Explicit type imports. No extensions other than `.mjs` and `.json`.
    - No internal path imports like `./a/b`: each directory has an
      `index.mts`, generated by `gen:index`, exporting what other directories
      use.
    - Write tree-shakeable code.
    - Standard modules with the `node:` prefix.
- Async
    - Always `await` a promise or `.catch()` it (`no-floating-promises`).
- React / JSX
    - Components are arrow functions in `.tsx` files.
    - Avoid props spread and inline functions or objects.
    - Keep hook dependency arrays and call order exact.
    - `cond ? <Something /> : undefined`, not `cond && <Something />`
      (`ts-restrictions/jsx-boolean-logical-operands`).
    - No adjacent expressions to concatenate strings (`<div>{x}{y}</div>`);
      use a template literal: ``<div>{`${x}${y}`}</div>``.
- Accessibility
    - Roles and labels on every interactive element; `alt` and `aria-*`,
      focus management and `tabindex` as the JSX a11y rules ask.
- Security and quality
    - No `eval`, `Function`, dynamic `require` or `import`, or dangerous
      regular expressions.

## Testing

- Vitest with `vitest/globals`: do not import `test`, `expect`, `assert` or
  `describe`.
- `*.test.mts`, next to the source or under `test/`; a test that needs a DOM
  goes in `test/browser/`.
- `test()`, not `it()` (`vitest/consistent-test-it`).
- `assert.deepStrictEqual(a, b)`, not `assert.deepEqual`, `expect().toEqual`
  or `expect().toStrictEqual` (`vitest-coding-style/no-expect-to-strict-equal`).
- Multi-line fixtures and expectations are `dedent` template literals, not
  arrays joined by `'\n'`. `dedent` drops blank lines at either end and the
  common indentation; when those matter, assert them separately
  (`text.split('\n').length`) rather than giving up `dedent`.
- In UI tests, do not `await` synchronous events, avoid `force` and `pause`,
  and prefer the screen API and simulated user interaction.

### TDD

1. Write tests first, from the expected inputs and outputs.
2. Run them and see them fail.
3. Write the minimal code that makes them pass.
4. Refactor while they stay green.

Do not modify the tests during implementation unless the requirements change.

### Two layers: types and behavior

```ts
import { expectType } from 'ts-data-forge';

// type-level assertion
expectType<typeof result, readonly [0, 0, 0]>('=');

// runtime assertion
assert.deepStrictEqual(result, [0, 0, 0]);
```

`expectType<A, B>(op)` takes:

- `'='`: exact type equality
- `'~='`: mutual extension (`A extends B` and `B extends A`)
- `'<='`: `A extends B`
- `'>='`: `B extends A`
- `'!='`, `'!<='`, `'!>='`: the negations

Use `'='` wherever possible; the others only when that is what the test means.

## Troubleshooting

### `noUncheckedIndexedAccess`

Every package compiles with `noUncheckedIndexedAccess: true`, so a length check
does not narrow an index:

```ts
// ❌
const xs: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

if (xs.length > 0) {
    console.log(xs[0] * 2);
    //          ~~~~~
    //          Object is possibly 'undefined'.
}
```

`Arr.isNonEmpty` does, narrowing to an array with at least one element:

```ts
// ✅
import { Arr } from 'ts-data-forge';

const xs: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

if (Arr.isNonEmpty(xs)) {
    console.log(xs[0] * 2);
}
```

The same holds for an early return; do not reach for `!`:

```ts
// ❌
const fn = (xs: readonly number[]): void => {
    if (xs.length === 0) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const first: number = xs[0]!;

    // ...
};
```

```ts
// ✅
const fn = (xs: readonly number[]): void => {
    if (!Arr.isNonEmpty(xs)) {
        return;
    }

    const first: number = xs[0];

    // ...
};
```

### `total-functions/no-partial-division`

Check for zero, then divide with `Num.div` from `ts-data-forge`:

```ts
// ❌
const result = a / b; // Division is partial

// ❌ do not write a helper that silences the rule
const safeDivide = (a: number, b: number): number =>
    // eslint-disable-next-line total-functions/no-partial-division
    b === 0 ? 0 : a / b;
```

```ts
// ✅
import { Num } from 'ts-data-forge';

const calculateValue = (a: number, b: number): number => {
    if (!Num.isNonZero(b)) {
        return 0;
    }

    return Num.div(a, b);
};
```

`Num.div` takes a denominator typed `NonZeroNumber` or a nonzero small integer
literal, so the zero check is what makes the call compile.

### `functional/no-let` / `functional/immutable-data`

Where mutation really is needed, prefix the binding `mut_` instead of
disabling the rule:

```ts
// ❌

// eslint-disable-next-line functional/no-let
let temp = 0;

temp = 2;

const xs: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// eslint-disable-next-line functional/immutable-data
xs[0] = 100;

const obj = { value: 'old value' };

// error  Modifying an existing object/array is not allowed  functional/immutable-data
obj.value = 'new value';
```

```ts
// ✅

let mut_temp = 0;

mut_temp = 2;

const mut_xs: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

mut_xs[0] = 100;

const mut_obj = { value: 'old value' };

mut_obj.value = 'new value';
```

### `vitest/no-conditional-expect`

```ts
// ❌
expect(Result.isErr(result)).toBe(true);

if (Result.isErr(result)) {
    // error  Avoid calling `expect` inside conditional statements  vitest/no-conditional-expect
    assert.deepStrictEqual(result.value, { data: [] });
}
```

`assert.isTrue` narrows the type, so no condition is needed:

```ts
// ✅
assert.isTrue(Result.isErr(result));

assert.deepStrictEqual(result.value, { data: [] });
```

## Libraries

### ts-type-forge

`DeepReadonly`, `StrictOmit`, `ReadonlyRecord` and the rest are global types,
declared by the `global.d.mts` that `ts-type-forge` provides; do not import
them.

### ts-data-forge

- `Arr.isArray`, not `Array.isArray` (`ts-data-forge/prefer-arr-is-array`).
- `isRecord` and `hasKey` to narrow, not `Object.hasOwn` or the `in` operator
  (`ts-data-forge/prefer-is-record-and-has-key`).
- `Arr.seq` and similar take an `Int`; cast with `asUint32`.
- `memoizeFunction` to memoize a function, `fastDeepEqual` for deep equality.
- In tests, `assert.isTrue(Result.isErr(result))` rather than
  `expect(Result.isErr(result)).toBe(true)`.

### immer

When assigning a readonly value to a draft is a type error, wrap it in
`castDraft`.
