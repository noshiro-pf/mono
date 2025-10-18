// Example: src/number/refined-number-utils.mts (operatorsForInteger)
import { TsDataForgeInternals } from 'ts-data-forge';

// embed-sample-code-ignore-above
const intOps = TsDataForgeInternals.RefinedNumberUtils.operatorsForInteger<
  SafeInt,
  number,
  number
>({
  integerOrSafeInteger: 'SafeInteger',
  MIN_VALUE: Number.MIN_SAFE_INTEGER,
  MAX_VALUE: Number.MAX_SAFE_INTEGER,
  typeNameInMessage: 'SafeInt',
} as const);

const six = intOps.castType(6);
const four = intOps.castType(4);
const sum = intOps.add(six, four);
const difference = intOps.sub(six, four);
const product = intOps.mul(six, four);
const quotient = intOps.div(six, intOps.castType(2));
const roundedClamp = intOps.clamp(1.5);
const randomValue = intOps.random();

assert(sum === 10);
assert(difference === 2);
assert(product === 24);
assert(quotient === 3);
assert(roundedClamp === 2);
assert.ok(Number.isSafeInteger(randomValue));
