import dedent from 'dedent';
import { Arr, pipe } from 'ts-data-forge';
import type { MonoTypeFunction, ReadonlyRecord } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import {
  idFn,
  type BrandedNumberTypes,
  type ConverterOptions,
} from './common.mjs';

export const convertLibEs5_Math =
  ({
    config: { useBrandedNumber },
    brandedNumber,
  }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithinInterface({
          name: 'Math',
          mapFn: composeMonoTypeFns(
            ...(!useBrandedNumber
              ? []
              : [
                  'E',
                  'LN10',
                  'LN2',
                  'LOG2E',
                  'LOG10E',
                  'PI',
                  'SQRT1_2',
                  'SQRT2',
                ].map((a) =>
                  replaceWithNoMatchCheck(
                    `readonly ${a}: number;`,
                    `readonly ${a}: ${brandedNumber.PositiveNumber};`,
                  ),
                )),

            replaceWithNoMatchCheck(
              'abs(x: number): number;',
              Arr.toUnshifted(
                `abs<N extends ${useBrandedNumber ? 'SmallInt' : 'number'}>(x: N): AbsoluteValue<N>;`,
              )(
                !useBrandedNumber
                  ? ['abs(x: number): number;']
                  : [
                      // A separate overload, rather than only the first branch
                      // of the conditional below, so that a generic caller's
                      // type parameter comes back as itself.
                      `abs<N extends ${brandedNumber.NonNegativeFiniteNumber}>(x: N): N;`,
                      `abs<N extends ${brandedNumber.FiniteNumber}>(x: N): ${absReturnType(brandedNumber)};`,
                      `abs(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                    ],
              ).join('\n'),
            ),
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  'acos(x: number): number;',
                  `acos(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                ),

            // The return type is NonNegativeNumber instead of PositiveNumber
            // because Math.exp(Number.NEGATIVE_INFINITY) == 0
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  'exp(x: number): number;',
                  `exp(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                ),
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  'sqrt(x: number): number;',
                  `sqrt(x: number): ${brandedNumber.NonNegativeNumber} | ${brandedNumber.NaNType};`,
                ),
            !useBrandedNumber
              ? idFn
              : replaceWithNoMatchCheck(
                  'random(): number;',
                  `random(): ${brandedNumber.NonNegativeNumber};`,
                ),

            ...(!useBrandedNumber
              ? []
              : roundingFunctions.map((fn) =>
                  replaceWithNoMatchCheck(
                    `${fn}(x: number): number;`,
                    // The `Int` overload returns a generic caller's type
                    // parameter as itself; the conditional one still maps an
                    // `Int` member of a union to itself.
                    dedent`
                      ${fn}<N extends ${brandedNumber.Int}>(x: N): N;
                      ${fn}<N extends ${brandedNumber.FiniteNumber}>(x: N): ${roundingReturnType(fn, brandedNumber)};
                      ${fn}(x: number): ${brandedNumber.Int} | ${brandedNumber.InfiniteNumber} | ${brandedNumber.NaNType};
                    `,
                  ),
                )),
          ),
        }),
      ),
    ).value;

const roundingFunctions = ['ceil', 'floor', 'round'] as const;

/**
 * The branded return type of `Math.ceil` / `floor` / `round` for a finite `N`.
 *
 * An integer is returned unchanged, so a concrete `Int` argument keeps every
 * brand (a type parameter leaves the conditional deferred, so a generic caller
 * gets no `N` back). Otherwise only what rounding preserves is kept: a sign
 * bound (`>= 0` stays `>= 0`, `<= 0` stays `<= 0`) and `!= 0` only where the
 * result moves away from zero — `floor` of a negative number, `ceil` of a
 * positive one. Intersecting with `N` instead would keep `!= 0` through
 * `Math.floor(0.5) === 0` and an upper bound through `Math.ceil`.
 */
const roundingReturnType = (
  fn: (typeof roundingFunctions)[number],
  {
    Int,
    PositiveNumber,
    NonNegativeNumber,
    NegativeNumber,
    NonPositiveNumber,
    PositiveInt,
    NonNegativeInt,
    NegativeInt,
    NonPositiveInt,
  }: BrandedNumberTypes,
): string => {
  const cases = {
    ceil: [
      [PositiveNumber, PositiveInt],
      [NonNegativeNumber, NonNegativeInt],
      [NonPositiveNumber, NonPositiveInt],
    ],
    floor: [
      [NonNegativeNumber, NonNegativeInt],
      [NegativeNumber, NegativeInt],
      [NonPositiveNumber, NonPositiveInt],
    ],
    round: [
      [NonNegativeNumber, NonNegativeInt],
      [NonPositiveNumber, NonPositiveInt],
    ],
  } as const satisfies ReadonlyRecord<
    (typeof roundingFunctions)[number],
    readonly (readonly [input: string, output: string])[]
  >;

  return [
    `N extends ${Int} ? N`,
    ...cases[fn].map(([input, output]) => `N extends ${input} ? ${output}`),
    Int,
  ].join(' : ');
};

/**
 * The branded return type of `Math.abs` for a finite `N`. A non-negative `N` is
 * returned unchanged (`Math.abs(x) === x`), so a `Uint16` stays a `Uint16`.
 * Otherwise finiteness and integrality survive, a signed width becomes the
 * unsigned one (`Int16` to `Uint16`, `Int32` to `Uint32`; `Math.abs(-32768) ===
 * 32768` fits 16 unsigned bits but not `Int16`'s `< 2^15`), `SafeInt` (a
 * symmetric range) stays, and the result is positive exactly when `N` is
 * non-zero. Every other brand of `N` — a sign, a `Float32` — is dropped.
 */
const absReturnType = ({
  NonNegativeNumber,
  Int16,
  Int32,
  Uint16,
  Uint32,
  PositiveUint16,
  PositiveUint32,
  Int,
  SafeInt,
  NonZeroNumber,
  PositiveSafeInt,
  SafeUint,
  PositiveInt,
  NonNegativeInt,
  PositiveFiniteNumber,
  NonNegativeFiniteNumber,
}: BrandedNumberTypes): string =>
  [
    `N extends ${NonNegativeNumber} ? N`,
    `N extends ${Int16} ? (N extends ${NonZeroNumber} ? ${PositiveUint16} : ${Uint16})`,
    `N extends ${Int32} ? (N extends ${NonZeroNumber} ? ${PositiveUint32} : ${Uint32})`,
    `N extends ${SafeInt} ? (N extends ${NonZeroNumber} ? ${PositiveSafeInt} : ${SafeUint})`,
    `N extends ${Int} ? (N extends ${NonZeroNumber} ? ${PositiveInt} : ${NonNegativeInt})`,
    `N extends ${NonZeroNumber} ? ${PositiveFiniteNumber} : ${NonNegativeFiniteNumber}`,
  ].join(' : ');
