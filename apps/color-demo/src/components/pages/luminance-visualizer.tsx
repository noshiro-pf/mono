import { map } from 'synstate';
import { constant, type JSX } from 'synstate-dom';
import { results$ } from '../../store.mjs';
import { AllSliders } from '../molecules/index.mjs';
import { MuiPaper } from '../mui/index.mjs';
import { DistributionSection, ResultSection } from '../organisms/index.mjs';
import * as styles from './luminance-visualizer.module.css';

/**
 * The sliders, and what three ways of picking hues make of the relative
 * luminance at the saturation and lightness they hold.
 */
export const LuminanceVisualizer = (): JSX.Element => {
  const equallySpaced$ = results$.pipe(
    map((results) => results.result1_equallySpaced),
  );

  const weighted$ = results$.pipe(map((results) => results.result2_weighted));

  const weightedLog$ = results$.pipe(
    map((results) => results.result3_weighted_log),
  );

  return (
    <div class={constant(styles.root)}>
      <MuiPaper spaced variant={'outlined'}>
        <AllSliders />
      </MuiPaper>

      <DistributionSection
        data-e2e={'distribution-luminance'}
        distribution={results$.pipe(
          map((results) => results.relativeLuminanceDistribution),
        )}
        title={'1. 彩度・明度を固定し色相を横軸としたときの相対輝度分布'}
      />

      <ResultSection
        colorResult={equallySpaced$}
        data-e2e={'result-equally-spaced'}
        title={'2. 色相環から360/n度ずつ選出した場合'}
      />

      <DistributionSection
        data-e2e={'distribution-weighted'}
        distribution={weighted$.pipe(
          map((result) => result.accumulatedDistribution),
        )}
        title={'3-a. 相対輝度の変化量の絶対値の累積分布'}
      />

      <ResultSection
        colorResult={weighted$}
        data-e2e={'result-weighted'}
        title={'3-b. 3-a.の分布の縦軸をn分割した場合の色相'}
      />

      <DistributionSection
        data-e2e={'distribution-weighted-log'}
        distribution={weightedLog$.pipe(
          map((result) => result.accumulatedDistribution),
        )}
        title={'4-a. 相対輝度の変化量の絶対値のlogの累積分布'}
      />

      <ResultSection
        colorResult={weightedLog$}
        data-e2e={'result-weighted-log'}
        title={'4-b. 4-a.の分布の縦軸をn分割した場合の色相'}
      />
    </div>
  );
};
