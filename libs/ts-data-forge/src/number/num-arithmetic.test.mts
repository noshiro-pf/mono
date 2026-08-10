import {
  type Int,
  type NegativeInt,
  type PositiveFiniteNumber,
  type PositiveInt,
  type Uint,
} from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import {
  asNegativeInt,
  asNonPositiveInt,
  asPositiveInt,
  asUint,
} from './branded-types/index.mjs';
import { Num } from './num.mjs';

describe('Num arithmetic (general / sign-aware)', () => {
  describe('Num.add', () => {
    test('adds and keeps the value (no saturation)', () => {
      expect(Num.add(asPositiveInt(4), asPositiveInt(5))).toBe(9);
    });

    test('positive + negative is typed Int', () => {
      const r = Num.add(asPositiveInt(4), asNegativeInt(-9));

      expect(r).toBe(-5);

      expectType<typeof r, Int>('=');
    });

    test('positive + positive stays PositiveInt', () => {
      expectType<
        ReturnType<typeof Num.add<PositiveInt, PositiveInt>>,
        PositiveInt
      >('=');
    });
  });

  describe('Num.sub', () => {
    test('does not saturate (unlike branded Uint.sub)', () => {
      const r = Num.sub(asUint(3), asUint(5));

      expect(r).toBe(-2);

      expectType<typeof r, Int>('=');
    });
  });

  describe('Num.mul', () => {
    test('negative * negative is positive (PositiveInt)', () => {
      const r = Num.mul(asNegativeInt(-5), asNegativeInt(-3));

      expect(r).toBe(15);

      expectType<typeof r, PositiveInt>('=');
    });

    test('positive * negative is negative (NegativeInt)', () => {
      const r = Num.mul(asPositiveInt(5), asNegativeInt(-3));

      expect(r).toBe(-15);

      expectType<typeof r, NegativeInt>('=');
    });

    test('non-positive * non-positive is non-negative (Uint)', () => {
      const r = Num.mul(asNonPositiveInt(-4), asNonPositiveInt(-2));

      expect(r).toBe(8);

      expectType<typeof r, Uint>('=');
    });
  });

  describe('Num.div (exact)', () => {
    test('exact division keeps the fractional value', () => {
      const r = Num.div(asPositiveInt(9), asPositiveInt(2));

      expect(r).toBe(4.5);

      expectType<typeof r, PositiveFiniteNumber>('=');
    });

    test('negative / negative is positive', () => {
      expect(Num.div(asNegativeInt(-10), asNegativeInt(-2))).toBe(5);
    });
  });

  describe('Num.divInt (floor)', () => {
    test('floor division of negatives is non-negative (Uint)', () => {
      const r = Num.divInt(asNegativeInt(-7), asNegativeInt(-2));

      expect(r).toBe(3);

      expectType<typeof r, Uint>('=');
    });

    test('floor can reach 0', () => {
      expect(Num.divInt(asNegativeInt(-2), asNegativeInt(-3))).toBe(0);
    });
  });
});
