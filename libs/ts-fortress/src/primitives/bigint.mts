import { isBigint } from 'ts-data-forge';
import { refine } from '../other-types/index.mjs';
import { type Type } from '../type.mjs';
import { createPrimitiveType } from '../utils/index.mjs';

export function bigint(defaultValue?: bigint): Type<bigint>;

export function bigint<B extends bigint, const C extends Constraints>(
  defaultValue: B & DefaultValueType<B, C>,
  constraints: C,
): Type<bigint>;

export function bigint<C extends Constraints>(
  defaultValue: bigint = 0n,
  constraints?: C,
): Type<bigint> {
  const baseType = createPrimitiveType({
    typeName: 'bigint',
    defaultValue,
    is: isBigint,
  });

  if (constraints === undefined || Object.keys(constraints).length === 0) {
    return baseType;
  }

  if (constraints.gt !== undefined && !(defaultValue > constraints.gt)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint gt = ${constraints.gt}`,
    );
  }

  if (constraints.gte !== undefined && !(defaultValue >= constraints.gte)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint gte = ${constraints.gte}`,
    );
  }

  if (constraints.min !== undefined && !(defaultValue >= constraints.min)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint min = ${constraints.min}`,
    );
  }

  if (constraints.lt !== undefined && !(defaultValue < constraints.lt)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint lt = ${constraints.lt}`,
    );
  }

  if (constraints.lte !== undefined && !(defaultValue <= constraints.lte)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint lte = ${constraints.lte}`,
    );
  }

  if (constraints.max !== undefined && !(defaultValue <= constraints.max)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint max = ${constraints.max}`,
    );
  }

  if (constraints.positive === true && !(defaultValue > 0n)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint positive = true`,
    );
  }

  if (constraints.nonNegative === true && !(defaultValue >= 0n)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint nonNegative = true`,
    );
  }

  if (constraints.negative === true && !(defaultValue < 0n)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint negative = true`,
    );
  }

  if (constraints.nonPositive === true && !(defaultValue <= 0n)) {
    throw new Error(
      `defaultValue ${defaultValue} for bigint does not satisfy the constraint nonPositive = true`,
    );
  }

  if (constraints.multipleOf !== undefined) {
    const divisor = constraints.multipleOf;

    if (divisor === 0n) {
      if (defaultValue !== 0n) {
        throw new Error(
          `defaultValue ${defaultValue} for bigint does not satisfy the constraint multipleOf = ${constraints.multipleOf}`,
        );
      }
    } else if (defaultValue % divisor !== 0n) {
      throw new Error(
        `defaultValue ${defaultValue} for bigint does not satisfy the constraint multipleOf = ${constraints.multipleOf}`,
      );
    }
  }

  if (constraints.step !== undefined) {
    const stepValue = constraints.step;

    if (stepValue === 0n) {
      if (defaultValue !== 0n) {
        throw new Error(
          `defaultValue ${defaultValue} for bigint does not satisfy the constraint step = ${constraints.step}`,
        );
      }
    } else if (defaultValue % stepValue !== 0n) {
      throw new Error(
        `defaultValue ${defaultValue} for bigint does not satisfy the constraint step = ${constraints.step}`,
      );
    }
  }

  const satisfiesConstraints = createConstraintsPredicate(constraints);

  return refine({
    baseType,
    defaultValue,
    is: (value): value is bigint => satisfiesConstraints(value),
    typeName: 'bigint',
  });
}

type Constraints = PartialReadonly<{
  gt: bigint;
  gte: bigint;
  min: bigint;
  lt: bigint;
  lte: bigint;
  max: bigint;
  negative: boolean;
  nonNegative: boolean;
  positive: boolean;
  nonPositive: boolean;
  multipleOf: bigint;
  step: bigint;
}>;

type DefaultValueType<
  B extends bigint,
  R extends Constraints,
> = DefaultValueWhenNegativeIsOn<B, R> &
  DefaultValueWhenNonNegativeIsOn<B, R> &
  DefaultValueWhenPositiveIsOn<B, R> &
  DefaultValueWhenNonPositiveIsOn<B, R>;

type DefaultValueWhenNegativeIsOn<
  B extends bigint,
  R extends Constraints,
> = R extends { negative: true } ? NegativeBigint<B> : bigint;

type DefaultValueWhenNonNegativeIsOn<
  B extends bigint,
  R extends Constraints,
> = R extends { nonNegative: true } ? NonNegativeBigint<B> : bigint;

type DefaultValueWhenPositiveIsOn<
  B extends bigint,
  R extends Constraints,
> = R extends { positive: true } ? PositiveBigint<B> : bigint;

type DefaultValueWhenNonPositiveIsOn<
  B extends bigint,
  R extends Constraints,
> = R extends { nonPositive: true } ? NonPositiveBigint<B> : bigint;

type NegativeBigint<B extends bigint> = bigint extends B
  ? bigint
  : IsNegativeBigint<B> extends true
    ? B
    : never;

type NonNegativeBigint<B extends bigint> = bigint extends B
  ? bigint
  : IsNonNegativeBigint<B> extends true
    ? B
    : never;

type PositiveBigint<B extends bigint> = bigint extends B
  ? bigint
  : IsPositiveBigint<B> extends true
    ? B
    : never;

type NonPositiveBigint<B extends bigint> = bigint extends B
  ? bigint
  : IsNonPositiveBigint<B> extends true
    ? B
    : never;

type IsNegativeBigint<B extends bigint> = `${B}` extends `-${string}`
  ? true
  : false;

type IsNonNegativeBigint<B extends bigint> =
  IsNegativeBigint<B> extends true ? false : true;

type IsZeroBigint<B extends bigint> = `${B}` extends '0' ? true : false;

type IsPositiveBigint<B extends bigint> =
  IsZeroBigint<B> extends true ? false : IsNonNegativeBigint<B>;

type IsNonPositiveBigint<B extends bigint> =
  IsPositiveBigint<B> extends true ? false : true;

const createConstraintsPredicate =
  (constraints: Constraints) =>
  (value: bigint): boolean => {
    if (constraints.gt !== undefined && !(value > constraints.gt)) {
      return false;
    }

    if (constraints.gte !== undefined && !(value >= constraints.gte)) {
      return false;
    }

    if (constraints.min !== undefined && !(value >= constraints.min)) {
      return false;
    }

    if (constraints.lt !== undefined && !(value < constraints.lt)) {
      return false;
    }

    if (constraints.lte !== undefined && !(value <= constraints.lte)) {
      return false;
    }

    if (constraints.max !== undefined && !(value <= constraints.max)) {
      return false;
    }

    if (constraints.positive === true && !(value > 0n)) {
      return false;
    }

    if (constraints.nonNegative === true && !(value >= 0n)) {
      return false;
    }

    if (constraints.negative === true && !(value < 0n)) {
      return false;
    }

    if (constraints.nonPositive === true && !(value <= 0n)) {
      return false;
    }

    if (constraints.multipleOf !== undefined) {
      const divisor = constraints.multipleOf;

      if (divisor === 0n) {
        if (value !== 0n) {
          return false;
        }
      } else if (value % divisor !== 0n) {
        return false;
      }
    }

    if (constraints.step !== undefined) {
      const stepValue = constraints.step;

      if (stepValue === 0n) {
        if (value !== 0n) {
          return false;
        }
      } else if (value % stepValue !== 0n) {
        return false;
      }
    }

    return true;
  };
