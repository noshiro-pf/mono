import { useState } from 'better-react-use-state';
import { memoNamed, useDebounce } from 'react-utils';
import { type Percent } from 'ts-type-forge';
import { type Hue } from 'ts-utils-additional';
import { calcAll } from '../../../functions/index.mjs';
import { type DivisionNumber } from '../../../types/index.mjs';
import { LuminanceVisualizerView } from './luminance-visualizer-view.js';

const saturationInit = 80;

const lightnessInit = 60;

const hueInit = 0;

const divisionNumberInit = 14;

export const LuminanceVisualizer = memoNamed('LuminanceVisualizer', () => {
  /* states */

  const [saturation, setSaturation] = useState<Percent>(saturationInit);

  const [lightness, setLightness] = useState<Percent>(lightnessInit);

  const [firstHue, setFirstHue] = useState<Hue>(hueInit);

  const [divisionNumber, setDivisionNumber] =
    useState<DivisionNumber>(divisionNumberInit);

  /* values */
  const {
    relativeLuminanceDistribution,
    result1_equallySpaced,
    result2_weighted,
    result3_weighted_log,
  } = useDebounce(
    () => calcAll({ saturation, lightness, firstHue, divisionNumber }),
    [saturation, lightness, firstHue, divisionNumber],
    200,
  );

  return (
    <LuminanceVisualizerView
      divisionNumber={divisionNumber}
      divisionNumberOnChange={setDivisionNumber}
      firstHue={firstHue}
      firstHueOnChange={setFirstHue}
      lightness={lightness}
      lightnessOnChange={setLightness}
      relativeLuminanceDistribution={relativeLuminanceDistribution}
      result1_equallySpaced={result1_equallySpaced}
      result2_weighted={result2_weighted}
      result3_weighted_log={result3_weighted_log}
      saturation={saturation}
      saturationOnChange={setSaturation}
    />
  );
});
