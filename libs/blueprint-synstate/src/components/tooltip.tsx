import type { Bindable, Child, JSX } from 'synstate-dom';
import { intentClass } from '../internal/index.mjs';
import type { Intent } from './intent.mjs';
import { PopoverCore, type PopoverPlacement } from './popover-parts.js';

type Props = Readonly<{
  /** The target: one element. */
  children: Child;
  /** What the tooltip says. */
  content: Child;
  /** Never shown while on. */
  disabled?: Bindable<boolean>;
  /** Where it goes; with none, the side with room for it. */
  placement?: PopoverPlacement;
  intent?: Intent;
  /** Smaller padding (`bp6-compact`). */
  compact?: boolean;
  /** No arrow, and only a fade. */
  minimal?: boolean;
  hoverOpenDelay?: number;
  hoverCloseDelay?: number;
  transitionDuration?: number;
  /** Classes on `div.bp6-popover`, after Blueprint's own. */
  popoverClass?: string;
}>;

/**
 * Blueprint's `Tooltip`: a `PopoverNext` that opens while the pointer is over
 * the target, or while it has focus, and takes no focus itself.
 */
export const Tooltip = ({
  children,
  content,
  disabled,
  placement,
  intent = 'none',
  compact = false,
  minimal = false,
  hoverOpenDelay = 100,
  hoverCloseDelay = 0,
  transitionDuration = 100,
  popoverClass,
}: Props): JSX.Element => (
  <PopoverCore
    arrow={!minimal}
    autoFocus={false}
    content={content}
    enforceFocus={false}
    hoverCloseDelay={hoverCloseDelay}
    hoverOpenDelay={hoverOpenDelay}
    interactionKind={'hover-target'}
    lazy={true}
    minimalAnimation={minimal}
    offset={{ mainAxis: tooltipArrowSize / 2 }}
    popoverClass={[
      'bp6-tooltip',
      intentClass(intent),
      popoverClass,
      compact ? 'bp6-compact' : undefined,
    ]
      .filter((name) => name !== undefined)
      .join(' ')}
    transitionDuration={transitionDuration}
    {...(disabled === undefined ? {} : { disabled })}
    {...(placement === undefined ? {} : { placement })}
  >
    {children}
  </PopoverCore>
);

/** `TOOLTIP_ARROW_SVG_SIZE`: half of it is how far a tooltip stands off. */
const tooltipArrowSize = 22;
