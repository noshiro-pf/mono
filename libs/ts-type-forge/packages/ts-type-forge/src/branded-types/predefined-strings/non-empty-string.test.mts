import { expectType } from 'ts-data-forge';
import {
  type FixedLengthString,
  type MinLengthString,
} from './length-constrained-string.mjs';
import { type NonEmptyString } from './non-empty-string.mjs';

// NonEmptyString is an alias of MinLengthString<1>

{
  expectType<NonEmptyString, MinLengthString<1>>('=');

  // Subtype of string, but plain string is not assignable to it
  expectType<NonEmptyString, string>('<=');

  expectType<string, NonEmptyString>('!<=');

  // Participates in the min-length subtyping relation
  expectType<NonEmptyString, MinLengthString<0>>('<=');

  expectType<MinLengthString<2>, NonEmptyString>('<=');

  expectType<NonEmptyString, MinLengthString<2>>('!<=');

  // A fixed-length string of length >= 1 is non-empty
  expectType<FixedLengthString<1>, NonEmptyString>('<=');

  expectType<FixedLengthString<5>, NonEmptyString>('<=');

  expectType<FixedLengthString<0>, NonEmptyString>('!<=');
}
