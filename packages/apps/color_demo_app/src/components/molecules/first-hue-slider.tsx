import { MuiSlider } from '@noshiro/react-material-ui-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { Hue } from '@noshiro/ts-utils';
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
      value={props.firstHue}
      onChange={props.firstHueOnChange as (h: number) => void}
      ariaLabelledby='first-hue'
      step={1}
      min={0}
      max={359}
    />
  </SliderWrapper>
));
