import { constant, mapBindable, type Bindable } from 'synstate-dom';
import { expectType } from 'ts-data-forge';
import type { StrictExclude } from 'ts-type-forge';
import type { Intent, Size } from '../components/index.mjs';

/** `bp6-intent-<intent>`, or nothing for `none`. */
export const intentClass = (intent: Intent): string | undefined =>
  intent === 'none' ? undefined : (`bp6-intent-${intent}` as const);

/** `bp6-small` or `bp6-large`, or nothing for `medium`. */
export const sizeClass = (size: Size): string | undefined =>
  size === 'medium' ? undefined : (`bp6-${size}` as const);

/**
 * `bp6-intent-<intent>` for an intent that may change, or one that does not, as the `[name, on]`
 * pairs `classObject` takes: one per intent but `none`.
 */
export const intentToggles = (
  intent: Bindable<Intent> | Intent,
): readonly (readonly [string, Bindable<boolean>])[] => {
  const intent$ = typeof intent === 'string' ? constant(intent) : intent;

  return intents.map(
    (each) =>
      [`bp6-intent-${each}`, mapBindable(intent$, (i) => i === each)] as const,
  );
};

const intents = ['primary', 'success', 'warning', 'danger'] as const;

// An intent added to `Intent` and not here fails this.
expectType<(typeof intents)[number], StrictExclude<Intent, 'none'>>('=');
