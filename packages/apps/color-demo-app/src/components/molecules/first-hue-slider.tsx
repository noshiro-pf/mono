import { MuiSlider } from '@noshiro/react-material-ui-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { Hue } from '@noshiro/ts-utils-additional';
import styled from 'styled-components';

const SliderWrapper = styled.div`
  padding: 10px 0;
`;

type Props = Readonly<{
  firstHue: Hue;
  firstHueOnChange: (h: Hue) => void;
}>;

export const FirstHueSlider = memoNamed<Props>('FirstHueSlider', (props) => (
  <SliderWrapper>
    <div>{'色相0°位置'}</div>
    <MuiSlider
      ariaLabelledby='first-hue'
      max={359}
      min={0}
      step={1}
      value={props.firstHue}
      onChange={props.firstHueOnChange as (h: number) => void}
    />
  </SliderWrapper>
));