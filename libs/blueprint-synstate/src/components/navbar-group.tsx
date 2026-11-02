import type { Bindable, Child, JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  children: Child;
  /** Which end of the {@link Navbar} the group keeps to. */
  align?: 'left' | 'right';
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/**
 * Blueprint's `NavbarGroup`: a row of a {@link Navbar}'s content,
 * `div.bp6-navbar-group.bp6-align-<align>`.
 */
export const NavbarGroup = ({
  children,
  align = 'left',
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <div
    class={classObject(['bp6-navbar-group', `bp6-align-${align}`, className])}
    data-e2e={e2e}
  >
    {children}
  </div>
);
