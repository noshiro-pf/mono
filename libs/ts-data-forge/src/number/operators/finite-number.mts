/**
 * The operators of `FiniteNumber` other than `isFiniteNumber` and
 * `asFiniteNumber`, which `../branded-types/finite-number.mts` reads. Generated
 * by `gen:branded-number`; `renderModule` in
 * `scripts/gen-branded-number/render.mts` says why they are in a module of
 * their own.
 */
import type { FiniteNumber } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export const { abs, add, div, is, max, min, mul, pow, random, sub } =
  TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
    FiniteNumber,
    number,
    number
  >({
    MIN_VALUE: -Number.MAX_VALUE,
    MAX_VALUE: Number.MAX_VALUE,
    typeNameInMessage: 'a finite number',
  } as const);
