// Example: src/number/refined-number-utils.mts (operatorsForFloat)
import { TsDataForgeInternals } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const floatOps = TsDataForgeInternals.RefinedNumberUtils.operatorsForFloat<
      PositiveFiniteNumber,
      number,
      number
    >({
      nonZero: true,
      MIN_VALUE: Number.MIN_VALUE,
      MAX_VALUE: Number.MAX_VALUE,
      typeNameInMessage: 'PositiveFiniteNumber',
    } as const);

    const fortyTwo = floatOps.castType(42.5);

    const seven = floatOps.castType(7.5);

    const sum = floatOps.add(fortyTwo, seven);

    const ratio = floatOps.div(sum, floatOps.castType(10));

    const clamped = floatOps.clamp(0);

    const boundedRandom = floatOps.random(
      floatOps.castType(10),
      floatOps.castType(20),
    );

    const nonZeroRandom = floatOps.randomNonZero();

    assert.isTrue(sum === 50);

    assert.isTrue(ratio === 5);

    assert.isTrue(clamped >= Number.MIN_VALUE);

    assert.isTrue(boundedRandom >= 10 && boundedRandom <= 20);

    assert.isTrue(nonZeroRandom > 0);

    // embed-sample-code-ignore-below
  });
}
