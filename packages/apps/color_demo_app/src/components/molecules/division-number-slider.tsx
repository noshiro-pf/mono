import { MuiSlider } from '@noshiro/react-material-ui-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

const SliderWrapper = styled.div`
  padding: 10px 0;
`;

type Props = Readonly<{
  divisionNumber: number;
  divisionNumberOnChange: (value: number) => void;
}>;

export const DivisionNumberSlider = memoNamed<Props>(
  'DivisionNumberSlider',
  (props) => (
    <SliderWrapper>
      <div>{'分割数'}</div>
      <MuiSlider
        ariaLabelledby='division-number'
        max={30}
        min={2}
        step={1}
        value={props.divisionNumber}
        onChange={props.divisionNumberOnChange as (value: number) => void}
      />
    </SliderWrapper>
  )
);
