import { type DeprecatedInfo } from '@eslint/core';

/**
 * ルールが非推奨かどうかを判定する
 */
export const isDeprecated = (
  deprecated: boolean | undefined | DeepReadonly<DeprecatedInfo>,
): boolean =>
  typeof deprecated === 'object' ||
  (typeof deprecated === 'boolean' && deprecated);
