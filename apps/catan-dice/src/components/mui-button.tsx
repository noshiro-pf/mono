import { type Bindable, constant, type JSX } from 'synstate-dom';
import * as styles from './mui-button.module.css';

type Props = Readonly<{
  label: string;
  color: 'primary' | 'secondary';
  e2eId: string;
  disabled?: Bindable<boolean>;
  onClick: () => void;
}>;

/** MUI's contained `Button` in the default theme's look, without the ripple. */
export const MuiButton = ({
  label,
  color,
  e2eId,
  disabled = constant(false),
  onClick,
}: Props): JSX.Element => (
  <button
    class={constant(
      `${styles.button} ${color === 'primary' ? styles.primary : styles.secondary}`,
    )}
    data-e2e={constant(e2eId)}
    disabled={disabled}
    type={constant('button')}
    onClick={onClick}
  >
    {constant(label)}
  </button>
);
