import { MuiSlider } from '@noshiro/react-material-ui-utils';
import { memoNamed } from '@noshiro/react-utils';
import { uint32 } from '@noshiro/ts-utils';
import styled from 'styled-components';

const SliderWrapper = styled.div`
  padding: 10px 0;
`;

type Props = Readonly<{
  divisionNumber: number;
  divisionNumberOnChange: (value: uint32) => void;
}>;

export const DivisionNumberSlider = memoNamed<Props>(
  'DivisionNumberSlider',
  (props) => (
    <SliderWrapper>
      <div>分割数</div>
      <MuiSlider
        value={props.divisionNumber}
        onChange={props.divisionNumberOnChange as (value: number) => void}
        ariaLabelledby='division-number'
        step={1}
        min={2}
        max={30}
      />
    </SliderWrapper>
  )
);
