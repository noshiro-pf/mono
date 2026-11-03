import type { JSX } from 'synstate-dom';
import type { StrictOmit } from 'ts-type-forge';
import { PopoverCore, type PopoverCoreProps } from './popover-parts.js';

export type {
  PopoverInteractionKind,
  PopoverPlacement,
} from './popover-parts.js';

type Props = StrictOmit<
  PopoverCoreProps,
  | 'autoFocus'
  | 'enforceFocus'
  | 'lazy'
  | 'offset'
  | 'targetRole'
  | 'targetTabIndex'
  | 'usePortal'
  | 'viewportPadding'
>;

/**
 * Blueprint's `PopoverNext`: `content` in a popover hanging from the target,
 * its `children`, with an arrow pointing at it, placed by Floating UI as
 * Blueprint places it, in a portal at the end of the body.
 *
 * Opened by a click on the target, or by hovering over it with an
 * `interactionKind` of `hover`; given `isOpen`, it is open as that is, and asks
 * through `onInteraction` and `onClose`. A click on an element with the
 * `bp6-popover-dismiss` class inside it closes it, as Blueprint's.
 *
 * Unlike Blueprint's, the target's element is decorated (`aria-expanded`,
 * `aria-haspopup`, `bp6-active`) once it is drawn, not cloned with them.
 */
export const Popover = (props: Props): JSX.Element => (
  <PopoverCore {...props} />
);
