/**
 * The operators of `PositiveInt` other than `isPositiveInt` and
 * `asPositiveInt`, which `../branded-types/positive-int.mts` reads. Generated
 * by `gen:branded-number`; `renderModule` in
 * `scripts/gen-branded-number/render.mts` says why they are in a module of
 * their own.
 */
import type { PositiveInt } from 'ts-type-forge';
import { TsDataForgeInternals } from '../refined-number-utils.mjs';

export const {
  MIN_VALUE,
  add,
  div,
  fromNumber,
  is,
  max,
  min,
  mul,
  pow,
  random,
  sub,
} = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  PositiveInt,
  1,
  number
>({
  integerOrSafeInteger: 'Integer',
  MIN_VALUE: 1,
  MAX_VALUE: Number.MAX_VALUE,
  typeNameInMessage: 'a positive integer',
} as const);
