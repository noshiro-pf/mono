import { MuiSlider } from '@noshiro/react-mui-utils';
import { type Hue } from '@noshiro/ts-utils-additional';
import { type DivisionNumber } from '../../types';
import { DivisionNumberSlider } from './division-number-slider';
import { FirstHueSlider } from './first-hue-slider';

type Props = Readonly<{
  saturation: Percent;
  lightness: Percent;
  saturationOnChange: (value: Percent) => void;
  lightnessOnChange: (value: Percent) => void;
  firstHue: Hue;
  firstHueOnChange: (value: Hue) => void;
  divisionNumber: DivisionNumber;
  divisionNumberOnChange: (value: DivisionNumber) => void;
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
        onChange={
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          props.saturationOnChange as (s: number) => void
        }
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
        onChange={
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          props.lightnessOnChange as (l: number) => void
        }
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

const SliderWrapper = styled.div`
  padding: 10px 0;
`;
