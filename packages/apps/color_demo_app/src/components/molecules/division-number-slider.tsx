import { MuiSlider } from '@mono/react-material-ui-utils';
import { memoNamed } from '@mono/react-utils';
import styled from 'styled-components';

const SliderWrapper = styled.div`
  padding: 10px 0;
`;

interface Props {
  divisionNumber: number;
  divisionNumberOnChange: (value: number) => void;
}

export const DivisionNumberSlider = memoNamed<Props>(
  'DivisionNumberSlider',
  (props) => (
    <SliderWrapper>
      <div>分割数</div>
      <MuiSlider
        value={props.divisionNumber}
        onChange={props.divisionNumberOnChange}
        ariaLabelledby='division-number'
        step={1}
        min={2}
        max={30}
      />
    </SliderWrapper>
  )
);
