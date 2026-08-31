import { defineKnownRules, withDefaultOption } from 'eslint-config-typed';

/**
 * The Tsubu v1 rule overrides on top of eslint-config-typed — the first
 * version, limited to the enforcement-map 🔧 (option changes) and ⏻ (off →
 * on) items whose spec status is 確定 (independent of any pending 提案).
 * The 🆕 custom rules and the readonly enforcement experiment are tracked in
 * docs/tsubu/TODO.md.
 *
 * Each entry cites the enforcement-map row it implements; the base options it
 * replaces live in eslint-config-typed's `rules/` directory.
 */
export const tsubuRules = defineKnownRules({
  // 🔧 eqeqeq: the base config allows `== null` ({ null: 'ignore' } +
  // no-eq-null off) as the undefined-or-null check idiom. Tsubu bans the null
  // type itself (spec/null-undefined.md), so the idiom has nothing to match
  // and strict equality becomes total.
  eqeqeq: ['error', 'always'],
  'no-eq-null': 'error',

  // 🔧 no-implicit-coercion: the base config sets boolean: false, letting
  // `!!x` through. Tsubu bans all coercion idioms (spec/booleans-and-logic.md).
  'no-implicit-coercion': [
    'error',
    {
      allow: [],
      boolean: true,
      disallowTemplateShorthand: true,
      number: true,
      string: true,
    },
  ],

  // 🔧 no-plusplus: the base config exempts for-loop afterthoughts. Tsubu
  // bans `++`/`--` everywhere — counting loops are written with `range`, and
  // the remaining cases with `+= 1` (spec/variables-and-mutation.md).
  'no-plusplus': ['error', { allowForLoopAfterthoughts: false }],

  // 🔧 functional/no-let (D-14): `mut_` is the only mutable-name prefix; the
  // base config's `^_mut_` / `^#mut_` variants are dropped.
  'functional/no-let': [
    'error',
    {
      allowInForLoopInit: false,
      allowInFunctions: false,
      ignoreIdentifierPattern: ['^mut_'],
    },
  ],

  // 🔧 functional/immutable-data (D-14, D-12): `^draft` is dropped — an immer
  // draft must be named `mut_draft`. The base config's `this`/`super` ignores
  // and ignoreClasses become dead weight under the class ban (D-12) and are
  // dropped with it. The remaining accessor entries are practical boundary
  // exceptions the spec has yet to codify (enforcement-map 備考).
  'functional/immutable-data': [
    'error',
    {
      ignoreClasses: false,
      ignoreImmediateMutation: true,
      ignoreIdentifierPattern: ['^mut_', 'window.location.href'],
      ignoreNonConstDeclarations: false,
      ignoreAccessorPattern: [
        '**.mut_**',
        '**.current.**', // React Ref object
        '**.displayName', // React component displayName
        '**.scrollTop',
        '**.debugLabel', // jotai
      ],
    },
  ],

  // ⏻ no-bitwise: off in the base config. Banned outright in v1; revisited
  // when v2 introduces an integer type (spec/banned-syntax.md).
  'no-bitwise': withDefaultOption('error'),

  // ⏻ unicorn/no-null: the null literal is banned (spec/null-undefined.md).
  // checkStrictEquality stays off: `x === null` remains legal, because
  // normalizing external null to undefined at the boundary requires it.
  'unicorn/no-null': ['error', { checkStrictEquality: false }],

  // ⏻ id-denylist (D-17): `fn` is reserved for the v2 function-declaration
  // keyword. The rule also reports *defining* an own object property named
  // `fn` — stricter than D-17, which reserves declaration names only; reads
  // and the `{ fn: renamed }` escape hatch pass (verified by test). The 🆕
  // custom rule can narrow this later if the deviation bites.
  'id-denylist': ['error', 'fn'],

  // ⏻ functional/no-classes + no-this-expressions (D-12): classes are banned
  // outright; `this` with them. no-invalid-this stays on in the base config
  // as defense in depth.
  'functional/no-classes': withDefaultOption('error'),
  'functional/no-this-expressions': 'error',

  // ⏻ functional/no-throw-statements: `throw` is banned everywhere in user
  // code (spec/exceptions.md); errors travel as Result. The boundary code
  // that wraps throwing APIs lives in ts-std-forge / ts-data-forge, outside
  // code linted by this preset.
  'functional/no-throw-statements': ['error', { allowToRejectPromises: false }],
});
