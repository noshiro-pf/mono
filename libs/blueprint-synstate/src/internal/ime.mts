/**
 * Whether a key down is an input method's rather than the field's: one sent
 * while a composition is going on, or the Enter or Escape that confirmed or
 * cancelled one, which Safari sends after `compositionend`, told from the
 * field's by its key code alone. Other keys with that key code are the field's:
 * a virtual keyboard on Android sends it for the keys that type text, and its
 * arrow keys may carry it too.
 */
export const isImeKeyDown = (event: KeyboardEvent): boolean =>
  event.isComposing ||
  ((event.key === 'Enter' || event.key === 'Escape') &&
    // eslint-disable-next-line @typescript-eslint/no-deprecated, unicorn/prefer-keyboard-event-key -- the key code is all that tells Safari's apart
    event.keyCode === imeKeyCode);

/** The key code of a key down that an input method takes. */
const imeKeyCode = 229;
