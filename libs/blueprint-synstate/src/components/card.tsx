import type { Bindable, Child, JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

/** How far a {@link Card} stands off the page: the depth of its shadow. */
export type Elevation = 0 | 1 | 2 | 3 | 4;

type Props = Readonly<{
  children: Child;
  elevation?: Elevation;
  /** Less padding (`bp6-compact`). */
  compact?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
  'aria-busy'?: Bindable<string | undefined>;
  'aria-label'?: Bindable<string>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/** Blueprint's `Card`: a padded surface, `div.bp6-card.bp6-elevation-<n>`. */
export const Card = ({
  children,
  elevation = 0,
  compact = false,
  class: className,
  'aria-busy': ariaBusy,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <div
    aria-busy={ariaBusy}
    aria-label={ariaLabel}
    class={classObject([
      'bp6-card',
      `bp6-elevation-${elevation}`,
      compact && 'bp6-compact',
      className,
    ])}
    data-e2e={e2e}
  >
    {children}
  </div>
);
