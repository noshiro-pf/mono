import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  /** The {@link Button}s. */
  children: Child;
  /** Every button without a border until hovered (`bp6-minimal`). */
  minimal?: boolean;
  /** Takes the width of its container, shared by the buttons (`bp6-fill`). */
  fill?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
  role?: string;
  'aria-label'?: Bindable<string>;
  'data-e2e'?: Bindable<string | undefined>;
}>;

/** Blueprint's `ButtonGroup`: buttons drawn joined, in `div.bp6-button-group`. */
export const ButtonGroup = ({
  children,
  minimal = false,
  fill = false,
  class: className,
  role,
  'aria-label': ariaLabel,
  'data-e2e': e2e,
}: Props): JSX.Element => (
  <div
    aria-label={ariaLabel}
    class={classObject([
      'bp6-button-group',
      minimal && 'bp6-minimal',
      fill && 'bp6-fill',
      className,
    ])}
    data-e2e={e2e}
    role={role === undefined ? undefined : constant(role)}
  >
    {children}
  </div>
);
