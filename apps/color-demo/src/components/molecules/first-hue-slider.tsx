import { constant, type JSX } from 'synstate-dom';
import type { Hue } from 'ts-utils-additional';
import { firstHue$, setFirstHue } from '../../store.mjs';
import { MuiSlider } from '../mui/index.mjs';
import * as styles from './first-hue-slider.module.css';

/** Where on the hue circle the hue axis starts. */
export const FirstHueSlider = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <div id={constant('first-hue')}>{constant('色相0°位置')}</div>
    <MuiSlider
      ariaLabelledby={'first-hue'}
      max={359}
      min={0}
      step={1}
      value={firstHue$}
      onChange={(value) => {
        if (isHue(value)) {
          setFirstHue(value);
        }
      }}
    />
  </div>
);

/** The slider's bounds and step keep the value a whole number of 0–359. */
const isHue = (value: number): value is Hue =>
  Number.isSafeInteger(value) && 0 <= value && value < 360;
