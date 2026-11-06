import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { hslToStr } from 'ts-utils-additional';
import type { ColorResult } from '../../types/index.mjs';
import { ContrastRatioList } from '../molecules/index.mjs';
import { MuiPaper } from '../mui/index.mjs';
import { ColorList } from './color-list.js';
import { ColoredDistribution } from './colored-distribution.js';
import * as styles from './result-section.module.css';

type Props = Readonly<{
  title: string;
  colorResult: InitializedObservable<ColorResult>;
  'data-e2e': string;
}>;

/**
 * The hues one method picked: where they fall on its distribution, their
 * swatches, the contrast of each two neighbors and the variance of those.
 */
export const ResultSection = ({
  title,
  colorResult,
  'data-e2e': dataE2e,
}: Props): JSX.Element => (
  <MuiPaper data-e2e={dataE2e} spaced variant={'outlined'}>
    <h1 class={constant(styles.title)}>{constant(title)}</h1>
    <ColoredDistribution
      bars={colorResult.pipe(
        map((result) =>
          result.accumulatedDistribution.map(([hsl, value]) => ({
            height: `${value * 95 + 5}%`,
            // Only the hues this method picked are coloured.
            color: result.pickedUpHues.includes(hsl[0])
              ? hslToStr(hsl)
              : 'transparent',
          })),
        ),
      )}
    />
    <ColorList
      hueList={colorResult.pipe(
        map((result) =>
          result.pickedUpHues.map((hue, index) => ({ index, hue })),
        ),
      )}
    />
    <ContrastRatioList
      contrastRatioList={colorResult.pipe(
        map((result) =>
          result.adjacentContrastRatioList.map((ratio, index) => ({
            index,
            ratio,
          })),
        ),
      )}
    />
    <div class={constant(styles.variance)} data-e2e={constant('variance')}>
      {constant('コントラスト比の分散：')}
      {colorResult.pipe(
        map((result) => result.adjacentContrastRatioVariance.toString()),
      )}
    </div>
  </MuiPaper>
);
