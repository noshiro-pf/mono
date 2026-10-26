import type { Intent, Size } from '../components/index.mjs';

/** `bp6-intent-<intent>`, or nothing for `none`. */
export const intentClass = (intent: Intent): string | undefined =>
  intent === 'none' ? undefined : (`bp6-intent-${intent}` as const);

/** `bp6-small` or `bp6-large`, or nothing for `medium`. */
export const sizeClass = (size: Size): string | undefined =>
  size === 'medium' ? undefined : (`bp6-${size}` as const);
