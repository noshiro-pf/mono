import { constant, type Child, type JSX } from 'synstate-dom';
import * as styles from './width-restricted-input-wrapper.module.css';

type Props = Readonly<{
  children: Child;
  /** Classes after the wrapper's own. */
  class?: string;
}>;

/** At most 400px wide. */
export const WidthRestrictedInputWrapper = ({
  children,
  class: className,
}: Props): JSX.Element => (
  <div
    class={constant(
      className === undefined
        ? styles.wrapper
        : `${styles.wrapper} ${className}`,
    )}
  >
    {children}
  </div>
);
