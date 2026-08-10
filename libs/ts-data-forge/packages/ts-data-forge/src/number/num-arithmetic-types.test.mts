import {
  type FiniteNumber,
  type Int,
  type NegativeFiniteNumber,
  type NegativeInt,
  type NonNegativeFiniteNumber,
  type NonPositiveInt,
  type NonZeroInt,
  type PositiveFiniteNumber,
  type PositiveInt,
  type PositiveSafeInt,
  type SafeUint,
  type Uint,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import {
  type AddResult,
  type DivIntResult,
  type DivResult,
  type LevelOf,
  type MulResult,
  type SignOf,
  type SubResult,
} from './num-arithmetic-types.mjs';

describe('NumericArithmetic type-level', () => {
  test('SignOf', () => {
    expectType<SignOf<PositiveInt>, 'pos'>('=');

    expectType<SignOf<NegativeInt>, 'neg'>('=');

    expectType<SignOf<Uint>, 'nonneg'>('=');

    expectType<SignOf<NonPositiveInt>, 'nonpos'>('=');

    expectType<SignOf<NonZeroInt>, 'nonzero'>('=');

    expectType<SignOf<Int>, 'any'>('=');

    expectType<SignOf<number>, 'any'>('=');
  });

  test('LevelOf', () => {
    expectType<LevelOf<PositiveSafeInt>, 'safeint'>('=');

    expectType<LevelOf<PositiveInt>, 'int'>('=');

    expectType<LevelOf<PositiveFiniteNumber>, 'finite'>('=');

    expectType<LevelOf<number>, 'number'>('=');
  });

  test('mul: sign flips', () => {
    // <=0 * <=0 = >=0
    expectType<MulResult<NonPositiveInt, NonPositiveInt>, Uint>('=');

    // <0 * <0 = >0
    expectType<MulResult<NegativeInt, NegativeInt>, PositiveInt>('=');

    // >0 * <0 = <0
    expectType<MulResult<PositiveInt, NegativeInt>, NegativeInt>('=');

    // finite negatives -> positive finite
    expectType<
      MulResult<NegativeFiniteNumber, NegativeFiniteNumber>,
      PositiveFiniteNumber
    >('=');
  });

  test('mul: safeint widens to int', () => {
    expectType<MulResult<PositiveSafeInt, PositiveSafeInt>, PositiveInt>('=');
  });

  test('add', () => {
    expectType<AddResult<PositiveInt, PositiveInt>, PositiveInt>('=');

    expectType<AddResult<Uint, Uint>, Uint>('=');

    // positive + negative -> unknown sign
    expectType<AddResult<PositiveInt, NegativeInt>, Int>('=');

    // nonzero + nonzero -> can be 0
    expectType<AddResult<NonZeroInt, NonZeroInt>, Int>('=');

    // safeint widens
    expectType<AddResult<SafeUint, SafeUint>, Uint>('=');
  });

  test('sub', () => {
    // same-sign sub -> unknown sign (the saturating case lives in branded)
    expectType<SubResult<Uint, Uint>, Int>('=');

    expectType<SubResult<NonPositiveInt, NonPositiveInt>, Int>('=');

    // >=0 - <=0 = >=0
    expectType<SubResult<Uint, NonPositiveInt>, Uint>('=');
  });

  test('div (exact) -> finite level', () => {
    expectType<DivResult<PositiveInt, PositiveInt>, PositiveFiniteNumber>('=');

    expectType<
      DivResult<NegativeFiniteNumber, NegativeFiniteNumber>,
      PositiveFiniteNumber
    >('=');

    expectType<DivResult<NonPositiveInt, NegativeInt>, NonNegativeFiniteNumber>(
      '=',
    );
  });

  test('divInt (floor)', () => {
    // <0 / <0 = >0 but floor can be 0 -> Uint
    expectType<DivIntResult<NegativeInt, NegativeInt>, Uint>('=');

    // >0 / >0 floor can be 0 -> Uint
    expectType<DivIntResult<PositiveInt, PositiveInt>, Uint>('=');

    // safeint preserved under floor division
    expectType<DivIntResult<PositiveSafeInt, PositiveSafeInt>, SafeUint>('=');
  });

  test('plain number stays number', () => {
    expectType<AddResult<number, number>, number>('=');

    expectType<MulResult<number, PositiveInt>, number>('=');

    expectType<AddResult<FiniteNumber, FiniteNumber>, FiniteNumber>('=');
  });
});
