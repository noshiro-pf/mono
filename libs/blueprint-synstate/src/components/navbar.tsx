import type { Bindable, Child, JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  /** The {@link NavbarGroup}s. */
  children: Child;
  /** Classes after Blueprint's own. */
  class?: string;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/** Blueprint's `Navbar`: the bar at the top of a page, `div.bp6-navbar`. */
export const Navbar = ({
  children,
  class: className,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <div class={classObject(['bp6-navbar', className])} data-e2e={e2e}>
    {children}
  </div>
);
