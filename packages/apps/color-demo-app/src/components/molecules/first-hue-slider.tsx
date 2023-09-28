import { MuiSlider } from '@noshiro/react-mui-utils';
import { type Hue } from '@noshiro/ts-utils-additional';

type Props = Readonly<{
  firstHue: Hue;
  firstHueOnChange: (h: Hue) => void;
}>;

export const FirstHueSlider = memoNamed<Props>('FirstHueSlider', (props) => (
  <div
    css={css`
      padding: 10px 0;
    `}
  >
    <div>{'色相0°位置'}</div>
    <MuiSlider
      ariaLabelledby='first-hue'
      max={359}
      min={0}
      step={1}
      value={props.firstHue}
      // eslint-disable-next-line no-restricted-syntax
      onChange={props.firstHueOnChange as (h: number) => void}
    />
  </div>
));
