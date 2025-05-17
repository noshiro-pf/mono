import { ESLintUtils } from '@typescript-eslint/utils';

export * from '../type-utils';
export * from './astUtils';
export * from './collectUnusedVariables';
export * from './createRule';
export * from './getFunctionHeadLoc';
export * from './getThisExpression';
export * from './getWrappingFixer';
export * from './misc';
export * from './objectIterators';
export type { InferMessageIdsTypeFromRule, InferOptionsTypeFromRule };
export {
  applyDefault,
  deepMerge,
  isObjectNotArray,
  getParserServices,
  nullThrows,
  NullThrowsReasons,
};

const {
  applyDefault,
  deepMerge,
  isObjectNotArray,
  getParserServices,
  nullThrows,
  NullThrowsReasons,
} = ESLintUtils;
type InferMessageIdsTypeFromRule<T> =
  ESLintUtils.InferMessageIdsTypeFromRule<T>;
type InferOptionsTypeFromRule<T> = ESLintUtils.InferOptionsTypeFromRule<T>;
