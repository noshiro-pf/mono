import type { InitializedObservable } from 'synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { huesDefault } from '../../constants/index.mjs';
import * as styles from './colored-distribution.module.css';

type Props = Readonly<{
  /** One bar per hue, in the order of `huesDefault`. */
  bars: InitializedObservable<readonly Bar[]>;
}>;

/** A bar per hue, as tall and in the colour it is given. */
export const ColoredDistribution = ({ bars }: Props): JSX.Element => (
  <div class={constant(styles.root)}>
    {huesDefault.map((_, index) => (
      <div class={constant(styles.barWrapper)}>
        <div
          class={constant(styles.bar)}
          data-e2e={constant('distribution-bar')}
          style={{
            height: view(bars, (all) => all[index]?.height ?? '0%'),
            'background-color': view(
              bars,
              (all) => all[index]?.color ?? 'transparent',
            ),
          }}
        />
      </div>
    ))}
  </div>
);

/** A CSS height and colour. */
type Bar = Readonly<{ height: string; color: string }>;
