import { constant, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import { divisionNumber$, setDivisionNumber } from '../../store.mjs';
import { MuiSlider } from '../mui/index.mjs';
import * as styles from './division-number-slider.module.css';

/** How many hues each result picks. */
export const DivisionNumberSlider = (): JSX.Element => (
  <div class={constant(styles.root)}>
    <div id={constant('division-number')}>{constant('分割数')}</div>
    <MuiSlider
      ariaLabelledby={'division-number'}
      max={30}
      min={2}
      step={1}
      value={divisionNumber$}
      onChange={(value) => {
        if (isDivisionNumber(value)) {
          setDivisionNumber(value);
        }
      }}
    />
  </div>
);

const isDivisionNumber = Num.isUintInRange(2, 31);
