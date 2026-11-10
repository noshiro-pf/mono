// The popover Blueprint's date inputs hang below their target, drawn in place,
// after the target, rather than in a portal, and positioned `fixed`: inside a
// modal `<dialog>`, which is in the top layer, a portal on `<body>` would be
// drawn behind the dialog and be inert. In place it is inside the dialog, and
// is not clipped by a scrolling body.
//
// It is `PopoverFloat`, the popover `Popover` and `Tooltip` draw, with the
// props Blueprint's `DateInput` gives its popover: placed `bottom-start`, and
// neither taking the focus nor keeping it, which the field and the calendar
// handle themselves. Like Blueprint's, it is an overlay of its own over any it
// is drawn in: while it is open, Escape and a press outside are its, and an
// enclosing dialog no longer holds the focus inside itself.

import { constant, type Child, type JSX } from 'synstate-dom';
import { isInside } from '../internal/index.mjs';
import { PopoverFloat } from './popover-float-parts.js';

type Props = Readonly<{
  /** The element it hangs below, and a press on which is not outside. */
  getTarget: () => HTMLElement | undefined;
  /** After `bp6-popover`, such as `bp6-date-input-popover`. */
  popoverClass: string;
  /**
   * Asked to close: by a press outside both the target and the popover, by an
   * Escape pressed outside the popover that nothing took (the fields take their
   * own), or by a click on a `bp6-popover-dismiss` element in it.
   */
  onClose: () => void;
  /** Escape in the popover, kept from the page. */
  onEscape: () => void;
  /** What `bp6-popover-content` holds. */
  children: Child;
  /** Given the popover's container as it is drawn, `undefined` as it goes. */
  containerRef?: (container: HTMLElement | undefined) => void;
}>;

/**
 * `div.bp6-overlay` round the popover, placed below the target (above it where
 * there is room there and not below) and following it as the page scrolls or
 * resizes, with Blueprint's enter transition. Drawn while the calendar is open,
 * and so open from the moment it is drawn: its transition is `appear`'s, which
 * Blueprint's style sheet draws as `enter`'s, and it goes with none.
 */
export const DatePopover = ({
  getTarget,
  popoverClass,
  onClose,
  onEscape,
  children,
  containerRef,
}: Props): JSX.Element => {
  const mut_elements: { container: HTMLElement | undefined } = {
    container: undefined,
  };

  return (
    <PopoverFloat
      autoFocus={false}
      containerRef={(container) => {
        mut_elements.container = container;

        containerRef?.(container);
      }}
      content={children}
      enforceFocus={false}
      // Popper's, which Blueprint's `Popover` places it with: it keeps to the
      // field's left edge, shifted rather than flipped to the other end where
      // it does not fit beside it; and where it fits on neither side it stays
      // below, so that the calendar's head, with the month buttons, is not
      // drawn above a viewport a fixed popover cannot scroll in.
      flipAlignment={false}
      flipFallback={'initialPlacement'}
      getTarget={getTarget}
      isOpen={constant(true)}
      lazy
      placement={'bottom-start'}
      popoverClass={popoverClass}
      positioningStrategy={'fixed'}
      shouldReturnFocusOnClose={false}
      usePortal={false}
      onClose={(event) => {
        // An Escape in the calendar gives the focus back to the field; one
        // elsewhere, heard on the document as the overlay on top, only closes
        // it, as Blueprint's does, leaving the focus where it is. One that an
        // overlay it is drawn in hears first, with the focus in that overlay
        // but not in the calendar, is that overlay's, as in Blueprint's. A
        // press outside is heard on the document as it bubbles, as Blueprint's
        // overlay hears it.
        if (
          event instanceof KeyboardEvent &&
          isInside(event.target, mut_elements.container)
        ) {
          onEscape();
        } else {
          onClose();
        }
      }}
      onDismiss={onClose}
    />
  );
};
