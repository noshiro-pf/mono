import { constant, type Bindable, type JSX } from 'synstate-dom';
import * as styles from './color-item.module.css';

type Props = Readonly<{
  /** A CSS colour. */
  color: Bindable<string>;
}>;

/** A rounded square swatch of one colour. */
export const ColorItem = ({ color }: Props): JSX.Element => (
  <div
    class={constant(styles.swatch)}
    data-e2e={constant('color-swatch')}
    style={{ 'background-color': color }}
  />
);
