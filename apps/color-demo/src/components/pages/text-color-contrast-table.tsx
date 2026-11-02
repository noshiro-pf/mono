import { constant, type JSX } from 'synstate-dom';
import { Arr, Num } from 'ts-data-forge';
import type { Percent } from 'ts-type-forge';
import {
  blackHsl,
  contrastRatioHsl,
  toHue,
  whiteHsl,
} from 'ts-utils-additional';
import { huesDefault } from '../../constants/index.mjs';
import { MuiPaper } from '../mui/index.mjs';
import * as styles from './text-color-contrast-table.module.css';

/**
 * For each hue at three saturations and lightnesses, the contrast of white text
 * and of black text on it, with the better of the two checked. The checkboxes
 * are the reader's to tick, so they start checked and are left uncontrolled;
 * nothing reads them.
 */
export const TextColorContrastTable = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <MuiPaper spaced variant={'outlined'}>
      <table
        class={constant(styles.table)}
        data-e2e={constant('contrast-table')}
      >
        <thead>
          <tr>
            <th class={headCell} scope={constant('col')}>
              {constant('Saturation（彩度）')}
            </th>
            {saturationLightness.flatMap(([saturation]) =>
              [0, 1].map(() => (
                <th class={headCell} scope={constant('col')}>
                  {constant(saturation.toString())}
                </th>
              )),
            )}
          </tr>
          <tr>
            <th class={headCell} scope={constant('col')}>
              {constant('Lightness（輝度）')}
            </th>
            {saturationLightness.flatMap(([, lightness]) =>
              [0, 1].map(() => (
                <th class={headCell} scope={constant('col')}>
                  {constant(lightness.toString())}
                </th>
              )),
            )}
          </tr>
          <tr>
            <th class={headCell} scope={constant('col')}>
              {constant('Hue（色相）')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ hue, cells }) => (
            <tr>
              <td class={constant(`${styles.cell} ${styles.alignCenter}`)}>
                {constant(hue.toString())}
              </td>
              {cells.flatMap(({ hsl, contrastWhite, contrastBlack }) => [
                <td
                  class={bodyCell}
                  style={{
                    'background-color': constant(hsl),
                    color: constant('white'),
                  }}
                >
                  <label>
                    <input
                      defaultChecked={constant(contrastWhite > contrastBlack)}
                      name={constant(hsl)}
                      type={constant('checkbox')}
                    />
                    {constant(Num.roundAt(contrastWhite, 2).toString())}
                  </label>
                </td>,
                <td
                  class={bodyCell}
                  style={{
                    'background-color': constant(hsl),
                    color: constant('black'),
                  }}
                >
                  <label>
                    <input
                      defaultChecked={constant(contrastWhite <= contrastBlack)}
                      name={constant(hsl)}
                      type={constant('checkbox')}
                    />
                    {constant(Num.roundAt(contrastBlack, 2).toString())}
                  </label>
                </td>,
              ])}
            </tr>
          ))}
        </tbody>
      </table>
    </MuiPaper>
  </div>
);

const saturationList = [80, 80, 100] as const satisfies readonly Percent[];

const lightnessList = [40, 60, 80] as const satisfies readonly Percent[];

/** The pair of each column. */
const saturationLightness = Arr.zip(saturationList, lightnessList);

const headCell = constant(
  `${styles.cell} ${styles.headCell} ${styles.alignCenter}`,
);

const bodyCell = constant(`${styles.cell} ${styles.alignLeft}`);

const rows = huesDefault.map((h) => {
  // `huesDefault` is `NonEmptyArray<number>`; see the comment there for why it
  // is not the 360-member `Hue` tuple.
  const hue = toHue(h);

  return {
    hue,
    cells: saturationLightness.map(([saturation, lightness]) => ({
      hsl: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      contrastWhite: contrastRatioHsl(whiteHsl, [hue, saturation, lightness]),
      contrastBlack: contrastRatioHsl([hue, saturation, lightness], blackHsl),
    })),
  };
});
