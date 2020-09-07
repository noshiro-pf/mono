import { MuiSlider } from '@mono/react-material-ui-utils';
import { memoNamed } from '@mono/react-utils';
import { Hue, Percent } from '@mono/ts-utils';
import React from 'react';
import styled from 'styled-components';
import { DivisionNumberSlider } from './division-number-slider';
import { FirstHueSlider } from './first-hue-slider';

const SliderWrapper = styled.div`
  padding: 10px 0;
`;

interface Props {
  saturation: Percent;
  lightness: Percent;
  saturationOnChange: (value: Percent) => void;
  lightnessOnChange: (value: Percent) => void;
  firstHue: Hue;
  firstHueOnChange: (value: Hue) => void;
  divisionNumber: number;
  divisionNumberOnChange: (value: number) => void;
}

export const AllSliders = memoNamed<Props>('AllSliders', (props) => (
  <div>
    <SliderWrapper>
      <div>彩度</div>
      <MuiSlider
        value={props.saturation}
        onChange={props.saturationOnChange as (s: number) => void}
        ariaLabelledby='saturation'
        step={5}
        min={0}
        max={100}
      />
    </SliderWrapper>
    <SliderWrapper>
      <div>明度</div>
      <MuiSlider
        value={props.lightness}
        onChange={props.lightnessOnChange as (l: number) => void}
        ariaLabelledby='lightness'
        step={5}
        min={0}
        max={100}
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
