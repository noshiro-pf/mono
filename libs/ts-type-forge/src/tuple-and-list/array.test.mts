import { expectType } from 'ts-data-forge';
import {
  type MinLengthArray,
  type MutableMinLengthArray,
} from '../branded-types/index.mjs';
import {
  type MutableNonEmptyArray,
  type MutableNonEmptyTuple,
  type NonEmptyArray,
  type NonEmptyTuple,
} from './array.mjs';

// NonEmptyArray / MutableNonEmptyArray are brand-based aliases of
// MinLengthArray<1> / MutableMinLengthArray<1>

{
  expectType<NonEmptyArray<number>, MinLengthArray<1, number>>('=');

  expectType<MutableNonEmptyArray<number>, MutableMinLengthArray<1, number>>(
    '=',
  );
}

// NonEmptyTuple / MutableNonEmptyTuple are the purely structural counterparts

{
  expectType<NonEmptyTuple<number>, readonly [number, ...(readonly number[])]>(
    '=',
  );

  expectType<MutableNonEmptyTuple<number>, [number, ...number[]]>('=');
}

// The branded array is a subtype of the structural tuple (via the clamped
// structural prefix), but a plain non-empty tuple lacks the brand.

{
  expectType<NonEmptyArray<number>, NonEmptyTuple<number>>('<=');

  expectType<NonEmptyTuple<number>, NonEmptyArray<number>>('!<=');

  // The mutable branded variant is assignable to the readonly branded one
  expectType<MutableNonEmptyArray<number>, NonEmptyArray<number>>('<=');
}
