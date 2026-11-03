import { constant, type Child, type JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  children: Child;
  /** Takes the width of its container, its controls sharing it (`bp6-fill`). */
  fill?: boolean;
  /** The controls one above another (`bp6-vertical`). */
  vertical?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
}>;

/**
 * Blueprint's `ControlGroup`: `div.bp6-control-group`, which joins the inputs,
 * selects and buttons in it into one control.
 */
export const ControlGroup = ({
  children,
  fill = false,
  vertical = false,
  class: className,
}: Props): JSX.Element => (
  <div
    class={classObject([
      'bp6-control-group',
      fill && 'bp6-fill',
      vertical && 'bp6-vertical',
      className,
    ])}
    role={constant('group')}
  >
    {children}
  </div>
);
