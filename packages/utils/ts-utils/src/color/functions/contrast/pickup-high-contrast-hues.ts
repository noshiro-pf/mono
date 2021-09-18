import { pipe } from '../../../functional';
import { IList } from '../../../immutable';
import type {
  NonEmptyArray,
  Percent,
  ReadonlyNonEmptyArray,
} from '../../../types';
import { isUint32 } from '../../../types';
import type { Hue } from '../../types';
import { hslToRgb } from '../rgb-hsl-conversion';
import { getLuminanceListAccumulated } from './get-luminance-list-acc';
import { relativeLuminance } from './relative-luminance';

// constants
const hues = IList.seqThrow(
  360
) as readonly Hue[] as ReadonlyNonEmptyArray<Hue>;

/**
 * relativeLuminanceの差分を累積した分布関数を縦軸yでn等分して、対応するx座標（=hue）を返す
 */
export const pickupHighContrastHues = (
  n: number,
  saturation: Percent,
  lightness: Percent
): ReadonlyNonEmptyArray<Hue> | undefined => {
  if (!isUint32(n) || n < 1) return undefined;

  const luminanceList = pipe(hues).chain((list) =>
    IList.map(list, (hue: Hue) =>
      relativeLuminance(hslToRgb([hue, saturation, lightness]))
    )
  ).value;

  const luminanceDiffAccumulated = getLuminanceListAccumulated(luminanceList);

  /* pickup n hues */
  const result = IList.zerosThrow(n) as NonEmptyArray<Hue>;

  let [i, y] = [0, 0];

  const maxValue = IList.max(luminanceDiffAccumulated);
  for (const [x, value] of luminanceDiffAccumulated.entries()) {
    if (value > y) {
      result[i] = x as Hue;
      [i, y] = [i + 1, (maxValue * (i + 1)) / n];
    }
  }

  return result;
};
