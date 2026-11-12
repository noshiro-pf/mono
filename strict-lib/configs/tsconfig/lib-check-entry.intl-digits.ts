// The digit options of `Intl.NumberFormat` and its kin, for the twelve
// harnesses to hold. Every harness's `tsconfig.lib-check.json`,
// `tsconfig.lib-check.webworker.json` and
// `tsconfig.lib-files-check.branded.json` name this file; nothing checks that
// every harness does.
//
// #2893 — fraction digits were capped at 20, the limit before ECMA-402 2023
// raised it to 100. Integer and significant digits stay 1–21.

import type { TypeEq, UintRangeInclusive } from 'ts-type-forge';

/** Each fraction-digit option accepts 100 and rejects 101. */
export const fractionDigitsUpTo100 = (
  n: number,
  b: bigint,
): readonly string[] => [
  new Intl.NumberFormat('en', { minimumFractionDigits: 100 }).format(n),
  // @ts-expect-error 101 is out of range
  new Intl.NumberFormat('en', { minimumFractionDigits: 101 }).format(n),
  new Intl.NumberFormat('en', { maximumFractionDigits: 100 }).format(n),
  // @ts-expect-error 101 is out of range
  new Intl.NumberFormat('en', { maximumFractionDigits: 101 }).format(n),
  n.toLocaleString('en', { minimumFractionDigits: 100 }),
  // @ts-expect-error 101 is out of range
  n.toLocaleString('en', { minimumFractionDigits: 101 }),
  n.toLocaleString('en', { maximumFractionDigits: 100 }),
  // @ts-expect-error 101 is out of range
  n.toLocaleString('en', { maximumFractionDigits: 101 }),
  b.toLocaleString('en', { minimumFractionDigits: 100 }),
  // @ts-expect-error 101 is out of range
  b.toLocaleString('en', { minimumFractionDigits: 101 }),
  b.toLocaleString('en', { maximumFractionDigits: 100 }),
  // @ts-expect-error 101 is out of range
  b.toLocaleString('en', { maximumFractionDigits: 101 }),
  new Intl.PluralRules('en', { minimumFractionDigits: 100 }).select(n),
  // @ts-expect-error 101 is out of range
  new Intl.PluralRules('en', { minimumFractionDigits: 101 }).select(n),
  new Intl.PluralRules('en', { maximumFractionDigits: 100 }).select(n),
  // @ts-expect-error 101 is out of range
  new Intl.PluralRules('en', { maximumFractionDigits: 101 }).select(n),
];

/** Integer digits keep their range of 1–21. */
export const integerDigitsUpTo21 = (n: number): readonly string[] => [
  new Intl.NumberFormat('en', { minimumIntegerDigits: 21 }).format(n),
  // @ts-expect-error 22 is out of range
  new Intl.NumberFormat('en', { minimumIntegerDigits: 22 }).format(n),
];

/**
 * The resolved options report what the options accept. Whether the fields are
 * optional depends on the lib file and the TypeScript version, so `undefined`
 * is left out.
 */
export const resolvedFractionDigits = (): readonly true[] => [
  true satisfies TypeEq<
    NonNullable<Intl.ResolvedNumberFormatOptions['minimumFractionDigits']>,
    UintRangeInclusive<0, 100>
  >,
  true satisfies TypeEq<
    NonNullable<Intl.ResolvedNumberFormatOptions['maximumFractionDigits']>,
    UintRangeInclusive<0, 100>
  >,
  true satisfies TypeEq<
    NonNullable<Intl.ResolvedPluralRulesOptions['minimumFractionDigits']>,
    UintRangeInclusive<0, 100>
  >,
  true satisfies TypeEq<
    NonNullable<Intl.ResolvedPluralRulesOptions['maximumFractionDigits']>,
    UintRangeInclusive<0, 100>
  >,
];
