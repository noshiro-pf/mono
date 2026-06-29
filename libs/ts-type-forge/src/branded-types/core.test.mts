import { expectType } from 'ts-data-forge';
import {
  type NaNType,
  type NegativeNumber,
  type NonNegativeNumber,
  type NonPositiveNumber,
  type NonZeroNumber,
  type PositiveNumber,
  type ValidNumber,
} from './core.mjs';

// Test NaNType
expectType<NaNType, number>('<=');

expectType<number, NaNType>('!<='); // Not all numbers are NaN

// Test that NaNType is branded
type IsBrandedNaN = NaNType extends number
  ? number extends NaNType
    ? false
    : true
  : false;

expectType<IsBrandedNaN, true>('=');

// Test ValidNumber (excludes NaN)
expectType<ValidNumber, number>('<=');

expectType<number, ValidNumber>('!<='); // number includes NaN

// Test ValidNumber excludes NaN
expectType<NaNType, ValidNumber>('!<=');

// Test NonZeroNumber
expectType<NonZeroNumber, number>('<=');

expectType<number, NonZeroNumber>('!<=');

// Test NonNegativeNumber
expectType<NonNegativeNumber, number>('<=');

expectType<number, NonNegativeNumber>('!<=');

// Test PositiveNumber
expectType<PositiveNumber, number>('<=');

expectType<number, PositiveNumber>('!<=');

// Test NegativeNumber
expectType<NegativeNumber, number>('<=');

expectType<number, NegativeNumber>('!<=');

// Test relationships between number types
expectType<PositiveNumber, NonZeroNumber>('<=');

expectType<PositiveNumber, NonNegativeNumber>('<=');

expectType<NegativeNumber, NonZeroNumber>('<=');

expectType<NegativeNumber, NonNegativeNumber>('!<=');

// Test PositiveNumber and NegativeNumber are disjoint
expectType<PositiveNumber, NegativeNumber>('!=');

expectType<NegativeNumber, PositiveNumber>('!=');

// Test NonPositiveNumber
expectType<NonPositiveNumber, number>('<=');

expectType<number, NonPositiveNumber>('!<=');

// NegativeNumber is a subset of NonPositiveNumber
expectType<NegativeNumber, NonPositiveNumber>('<=');

// NonPositiveNumber includes zero, so it is NOT a subset of NegativeNumber
expectType<NonPositiveNumber, NegativeNumber>('!<=');

// NonPositiveNumber and NonNegativeNumber overlap at 0, so neither is a subset
expectType<NonPositiveNumber, NonNegativeNumber>('!<=');

expectType<NonNegativeNumber, NonPositiveNumber>('!<=');

// PositiveNumber and NonPositiveNumber are disjoint
expectType<PositiveNumber, NonPositiveNumber>('!=');

expectType<NonPositiveNumber, PositiveNumber>('!=');

// Test that all these are distinct branded types
expectType<ValidNumber, NonZeroNumber>('!=');

expectType<NonZeroNumber, NonNegativeNumber>('!=');

expectType<NonNegativeNumber, PositiveNumber>('!=');

expectType<NonPositiveNumber, NegativeNumber>('!=');

// Test brand structure (all types are branded)
type ValidNumberIsBranded = number extends ValidNumber ? false : true;

type NonZeroNumberIsBranded = number extends NonZeroNumber ? false : true;

type NonNegativeNumberIsBranded = number extends NonNegativeNumber
  ? false
  : true;

type PositiveNumberIsBranded = number extends PositiveNumber ? false : true;

type NegativeNumberIsBranded = number extends NegativeNumber ? false : true;

type NonPositiveNumberIsBranded = number extends NonPositiveNumber
  ? false
  : true;

expectType<ValidNumberIsBranded, true>('=');

expectType<NonZeroNumberIsBranded, true>('=');

expectType<NonNegativeNumberIsBranded, true>('=');

expectType<PositiveNumberIsBranded, true>('=');

expectType<NegativeNumberIsBranded, true>('=');

expectType<NonPositiveNumberIsBranded, true>('=');
