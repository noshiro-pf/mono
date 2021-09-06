import { MuiSlider } from '@noshiro/react-material-ui-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { Hue, Percent } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { DivisionNumberSlider } from './division-number-slider';
import { FirstHueSlider } from './first-hue-slider';

const SliderWrapper = styled.div`
  padding: 10px 0;
`;

type Props = Readonly<{
  saturation: Percent;
  lightness: Percent;
  saturationOnChange: (value: Percent) => void;
  lightnessOnChange: (value: Percent) => void;
  firstHue: Hue;
  firstHueOnChange: (value: Hue) => void;
  divisionNumber: number;
  divisionNumberOnChange: (value: number) => void;
}>;

export const AllSliders = memoNamed<Props>('AllSliders', (props) => (
  <div>
    <SliderWrapper>
      <div>{'彩度'}</div>
      <MuiSlider
        ariaLabelledby='saturation'
        max={100}
        min={0}
        step={5}
        value={props.saturation}
        onChange={props.saturationOnChange as (s: number) => void}
      />
    </SliderWrapper>
    <SliderWrapper>
      <div>{'明度'}</div>
      <MuiSlider
        ariaLabelledby='lightness'
        max={100}
        min={0}
        step={5}
        value={props.lightness}
        onChange={props.lightnessOnChange as (l: number) => void}
      />
    </SliderWrapper>
    <FirstHueSlider
      firstHue={props.firstHue}
      firstHueOnChange={props.firstHueOnChange}
    />
    <DivisionNumberSlider
      divisionNumber={props.divisionNumber}
      divisionNumberOnChange={props.divisionNumberOnChange}
    />
  </div>
));
