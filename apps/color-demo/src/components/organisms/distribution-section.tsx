import { map, type InitializedObservable } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { hslToStr, type Hsl } from 'ts-utils-additional';
import { MuiPaper } from '../mui/index.mjs';
import { ColoredDistribution } from './colored-distribution.js';
import * as styles from './distribution-section.module.css';

type Props = Readonly<{
  title: string;
  distribution: InitializedObservable<readonly (readonly [Hsl, number])[]>;
  'data-e2e': string;
}>;

/** One distribution over the hues, drawn as a bar per hue. */
export const DistributionSection = ({
  title,
  distribution,
  'data-e2e': dataE2e,
}: Props): JSX.Element => (
  <MuiPaper data-e2e={dataE2e} spaced variant={'outlined'}>
    <h1 class={constant(styles.title)}>{constant(title)}</h1>
    <ColoredDistribution
      bars={distribution.pipe(
        map((entries) =>
          entries.map(([hsl, value]) => ({
            height: `${value * 100}%`,
            color: hslToStr(hsl),
          })),
        ),
      )}
    />
  </MuiPaper>
);
