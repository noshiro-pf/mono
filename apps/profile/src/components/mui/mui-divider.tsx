import { constant, type JSX } from 'synstate-dom';
import * as styles from './mui-divider.module.css';

/** MUI's `Divider` in the default theme's look. */
export const MuiDivider = (): JSX.Element => (
  <hr class={constant(styles.divider)} />
);
