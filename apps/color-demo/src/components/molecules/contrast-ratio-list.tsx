import type { InitializedObservable } from 'synstate';
import { constant, For, inlineMap, type JSX } from 'synstate-dom';
import * as styles from './contrast-ratio-list.module.css';

type Props = Readonly<{
  contrastRatioList: InitializedObservable<readonly IndexedRatio[]>;
}>;

/** The contrast ratio of each two neighboring colors, to two places. */
export const ContrastRatioList = ({
  contrastRatioList,
}: Props): JSX.Element => (
  <div class={constant(styles.root)}>
    <div>{constant('隣り合う二色のコントラスト比：')}</div>
    {constant('[')}
    <For items={contrastRatioList} key={({ index }) => index}>
      {(item$) => (
        <div data-e2e={constant('contrast-ratio')}>
          {inlineMap(
            item$,
            ({ ratio }) => `${ratio.toFixed(2)}, ${noBreakSpace}`,
          )}
        </div>
      )}
    </For>
    {constant(']')}
  </div>
);

/** Holds the ratios apart where the line would otherwise wrap them together. */
const noBreakSpace = '\u{A0}';

/** A ratio with its position in the list, which keys it. */
type IndexedRatio = Readonly<{ index: number; ratio: number }>;
