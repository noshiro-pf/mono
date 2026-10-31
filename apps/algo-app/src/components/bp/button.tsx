import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';
import * as styles from './button.module.css';

type Props = Readonly<{
  intent?: 'none' | 'primary';
  disabled?: Bindable<boolean>;
  onClick: () => void;
  children: Child;
}>;

/**
 * A Blueprint-looking button; the look is `button.module.css`.
 */
export const Button = ({
  intent = 'none',
  disabled = constant(false),
  onClick,
  children,
}: Props): JSX.Element => (
  <button
    class={constant(
      intent === 'primary'
        ? `${styles.button} ${styles.primary}`
        : styles.button,
    )}
    disabled={disabled}
    type={constant('button')}
    onClick={onClick}
  >
    {children}
  </button>
);
