/**
 * What Tab reaches inside `container`, in document order: the elements that
 * take focus, without a negative `tabindex`, not disabled (by themselves or by
 * a `fieldset`), not inert, and drawn. The focus traps of the date input's
 * popover and of the overlays both read it.
 */
export const focusablesIn = (
  container: HTMLElement | undefined,
): readonly HTMLElement[] =>
  container === undefined
    ? ([] as const)
    : Array.from(container.querySelectorAll<HTMLElement>(focusable)).filter(
        (element) =>
          element.tabIndex >= 0 &&
          !element.matches(':disabled') &&
          element.closest('[inert]') === null &&
          isDrawn(element),
      );

/** `target` is a node inside `container`, or `container` itself. */
export const isInside = (
  target: EventTarget | null,
  container: Element | undefined,
): boolean => target instanceof Node && container?.contains(target) === true;

const focusable = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'summary',
  'textarea',
  '[contenteditable]',
  '[tabindex]',
].join(', ');

/**
 * Drawn, not inside `display: none`, and not `visibility: hidden`. Not
 * `checkVisibility`, which Safari has only from 17.4.
 */
const isDrawn = (element: HTMLElement): boolean =>
  element.getClientRects().length > 0 &&
  getComputedStyle(element).visibility !== 'hidden';
