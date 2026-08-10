import { type DeprecatedInfo } from '@eslint/core';
import { type DeepReadonly } from 'ts-type-forge';

/**
 * ルールが非推奨かどうかを判定する
 */
export const isDeprecated = (
  deprecated: boolean | undefined | DeepReadonly<DeprecatedInfo>,
): boolean =>
  typeof deprecated === 'object' ||
  (typeof deprecated === 'boolean' && deprecated);
