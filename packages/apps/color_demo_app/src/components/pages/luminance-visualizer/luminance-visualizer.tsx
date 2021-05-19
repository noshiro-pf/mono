import { memoNamed, useDebounce } from '@noshiro/react-utils';
import type { Hue, Percent, uint32 } from '@noshiro/ts-utils';
import { useState } from 'react';
import { calcAll } from '../../../functions';
import { LuminanceVisualizerView } from './luminance-visualizer-view';

const saturationInit = 80;
const lightnessInit = 60;
const hueInit = 0;
const divisionNumberInit = 14 as uint32;

export const LuminanceVisualizer = memoNamed('LuminanceVisualizer', () => {
  /* states */

  const [saturation, setSaturation] = useState<Percent>(saturationInit);
  const [lightness, setLightness] = useState<Percent>(lightnessInit);
  const [firstHue, setFirstHue] = useState<Hue>(hueInit);

  const [divisionNumber, setDivisionNumber] =
    useState<uint32>(divisionNumberInit);

  /* values */
  const {
    relativeLuminanceDistribution,
    result1_equallySpaced,
    result2_weighted,
    result3_weighted_log,
  } = useDebounce(
    () => calcAll({ saturation, lightness, firstHue, divisionNumber }),
    [saturation, lightness, firstHue, divisionNumber],
    200
  );

  return (
    <LuminanceVisualizerView
      saturation={saturation}
      saturationOnChange={setSaturation}
      lightness={lightness}
      lightnessOnChange={setLightness}
      divisionNumber={divisionNumber}
      divisionNumberOnChange={setDivisionNumber}
      firstHue={firstHue}
      firstHueOnChange={setFirstHue}
      relativeLuminanceDistribution={relativeLuminanceDistribution}
      result1_equallySpaced={result1_equallySpaced}
      result2_weighted={result2_weighted}
      result3_weighted_log={result3_weighted_log}
    />
  );
});
