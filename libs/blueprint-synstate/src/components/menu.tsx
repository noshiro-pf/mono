import { constant, type Child, type JSX } from 'synstate-dom';
import { classObject, sizeClass } from '../internal/index.mjs';
import type { Size } from './intent.mjs';

type Props = Readonly<{
  /** The `MenuItem`s, and dividers. */
  children: Child;
  size?: Size;
  /** Classes after Blueprint's own. */
  class?: string;
  'aria-label'?: string;
  /** Puts the menu itself in the tab order, as Blueprint's `tabIndex` does. */
  tabIndex?: number;
  'data-e2e'?: string;
}>;

/** Blueprint's `Menu`: `ul.bp6-menu[role="menu"]` round its items. */
export const Menu = ({
  children,
  size = 'medium',
  class: className,
  'aria-label': ariaLabel,
  tabIndex,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <ul
    aria-label={ariaLabel === undefined ? undefined : constant(ariaLabel)}
    class={classObject([className, 'bp6-menu', sizeClass(size)])}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
    role={constant('menu')}
    tabIndex={tabIndex === undefined ? undefined : constant(tabIndex)}
  >
    {children}
  </ul>
);
