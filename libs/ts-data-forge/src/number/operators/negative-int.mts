/**
 * The operators of `NegativeInt` other than `isNegativeInt` and
 * `asNegativeInt`, which `../branded-types/negative-int.mts` reads. Generated
 * by `gen:branded-number`; `renderModule` in
 * `scripts/gen-branded-number/render.mts` says why they are in a module of
 * their own.
 */
import type { NegativeInt } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export const { MAX_VALUE, add, fromNumber, is, max, min, pow, random, sub } =
  TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
    NegativeInt,
    number,
    -1
  >({
    integerOrSafeInteger: 'Integer',
    nonZero: true,
    MIN_VALUE: -Number.MAX_VALUE,
    MAX_VALUE: -1,
    typeNameInMessage: 'a negative integer',
  } as const);
