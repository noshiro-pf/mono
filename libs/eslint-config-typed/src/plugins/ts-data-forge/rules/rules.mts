import { type ESLintPlugin } from '../../../types/index.mjs';
import { preferArrIsArrayAtLeastLength } from './prefer-arr-is-array-at-least-length.mjs';
import { preferArrIsArrayOfLength } from './prefer-arr-is-array-of-length.mjs';
import { preferArrIsArray } from './prefer-arr-is-array.mjs';
import { preferArrIsNonEmpty } from './prefer-arr-is-non-empty.mjs';
import { preferArrSum } from './prefer-arr-sum.mjs';
import { preferAsInt } from './prefer-as-int.mjs';
import { preferIsNonNullObject } from './prefer-is-non-null-object.mjs';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';
import { preferRangeForLoop } from './prefer-range-for-loop.mjs';

export const tsDataForgeRules = {
  'prefer-arr-is-array-at-least-length': preferArrIsArrayAtLeastLength,
  'prefer-arr-is-array-of-length': preferArrIsArrayOfLength,
  'prefer-arr-is-array': preferArrIsArray,
  'prefer-arr-is-non-empty': preferArrIsNonEmpty,
  'prefer-arr-sum': preferArrSum,
  'prefer-as-int': preferAsInt,
  'prefer-is-non-null-object': preferIsNonNullObject,
  'prefer-range-for-loop': preferRangeForLoop,
  'prefer-is-record-and-has-key': preferIsRecordAndHasKey,
} as const satisfies ESLintPlugin['rules'];
