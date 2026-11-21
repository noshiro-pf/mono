import type { StrictPick } from 'ts-type-forge';

/**
 * Whether a key down belongs to an input method: a key pressed while composing,
 * or the Enter or Escape that ends a composition in Safari, which reports
 * `isComposing: false` for it but the key code 229. A handler of Enter returns
 * early on it, so that confirming a conversion does not submit.
 */
export const isImeKeyDown = (
  event: StrictPick<KeyboardEvent, 'isComposing' | 'key' | 'keyCode'>,
): boolean =>
  event.isComposing ||
  ((event.key === 'Enter' || event.key === 'Escape') &&
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the key code is all that tells Safari's apart
    event.keyCode === imeKeyCode);

/** The key code of a key down that an input method takes. */
const imeKeyCode = 229;
