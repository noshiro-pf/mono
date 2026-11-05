import { constant, type Child, type JSX } from 'synstate-dom';
import { classObject, sizeClass } from '../internal/index.mjs';
import type { Size } from './intent.mjs';

type Props = Readonly<{
  /** The `MenuItem`s, and dividers. */
  children: Child;
  size?: Size;
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: string;
}>;

/** Blueprint's `Menu`: `ul.bp6-menu[role="menu"]` round its items. */
export const Menu = ({
  children,
  size = 'medium',
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <ul
    class={classObject([className, 'bp6-menu', sizeClass(size)])}
    data-e2e={e2e === undefined ? undefined : constant(e2e)}
    role={constant('menu')}
  >
    {children}
  </ul>
);
