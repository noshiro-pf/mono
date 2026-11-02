import { constant, type JSX } from 'synstate-dom';
import type { Percent } from 'ts-type-forge';
import {
  lightness$,
  saturation$,
  setLightness,
  setSaturation,
} from '../../store.mjs';
import { MuiSlider } from '../mui/index.mjs';
import { DivisionNumberSlider } from './division-number-slider.js';
import { FirstHueSlider } from './first-hue-slider.js';
import * as styles from './saturation-lightness-slider.module.css';

/** The four sliders the luminance tab is computed from. */
export const AllSliders = (): JSX.Element => (
  <div>
    <div class={constant(styles.sliderWrapper)}>
      <div id={constant('saturation')}>{constant('彩度')}</div>
      <MuiSlider
        ariaLabelledby={'saturation'}
        max={100}
        min={0}
        step={5}
        value={saturation$}
        onChange={(value) => {
          if (isPercent(value)) {
            setSaturation(value);
          }
        }}
      />
    </div>
    <div class={constant(styles.sliderWrapper)}>
      <div id={constant('lightness')}>{constant('明度')}</div>
      <MuiSlider
        ariaLabelledby={'lightness'}
        max={100}
        min={0}
        step={5}
        value={lightness$}
        onChange={(value) => {
          if (isPercent(value)) {
            setLightness(value);
          }
        }}
      />
    </div>
    <FirstHueSlider />
    <DivisionNumberSlider />
  </div>
);

/** The sliders' bounds and step keep the value a whole number of 0–100. */
const isPercent = (value: number): value is Percent =>
  Number.isSafeInteger(value) && 0 <= value && value <= 100;
