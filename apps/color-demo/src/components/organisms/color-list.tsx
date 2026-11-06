import type { InitializedObservable } from 'synstate';
import { constant, deriveBindable, For, type JSX } from 'synstate-dom';
import { hslToStr, type Hue } from 'ts-utils-additional';
import { lightness$, saturation$ } from '../../store.mjs';
import { ColorItem } from '../atoms/index.mjs';
import * as styles from './color-list.module.css';

type Props = Readonly<{
  hueList: InitializedObservable<readonly IndexedHue[]>;
}>;

/**
 * A swatch for each hue of a result, at the saturation and lightness the
 * sliders hold now: the hues follow the debounced figures, the colours do not
 * wait for them.
 */
export const ColorList = ({ hueList }: Props): JSX.Element => (
  <div class={constant(styles.root)}>
    <div>{constant('色相リスト')}</div>
    <div class={constant(styles.list)}>
      <For items={hueList} key={({ index }) => index}>
        {(item$) => (
          <div class={constant(styles.item)}>
            <ColorItem
              color={deriveBindable(
                [item$, saturation$, lightness$],
                ({ hue }, saturation, lightness) =>
                  hslToStr([hue, saturation, lightness]),
              )}
            />
          </div>
        )}
      </For>
    </div>
  </div>
);

/** A hue with its position in the list, which keys it. */
type IndexedHue = Readonly<{ index: number; hue: Hue }>;
