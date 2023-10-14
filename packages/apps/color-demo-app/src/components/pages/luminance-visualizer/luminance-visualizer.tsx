import { useDebounce } from '@noshiro/react-utils';
import { type Hue } from '@noshiro/ts-utils-additional';
import { calcAll } from '../../../functions';
import { type DivisionNumber } from '../../../types';
import { LuminanceVisualizerView } from './luminance-visualizer-view';

const saturationInit = 80;
const lightnessInit = 60;
const hueInit = 0;
const divisionNumberInit = 14;

export const LuminanceVisualizer = memoNamed('LuminanceVisualizer', () => {
  /* states */

  const { state: saturation, setState: setSaturation } =
    useState<Percent>(saturationInit);

  const { state: lightness, setState: setLightness } =
    useState<Percent>(lightnessInit);

  const { state: firstHue, setState: setFirstHue } = useState<Hue>(hueInit);

  const { state: divisionNumber, setState: setDivisionNumber } =
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
