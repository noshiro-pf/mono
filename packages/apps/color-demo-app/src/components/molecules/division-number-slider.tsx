import { MuiSlider } from '@noshiro/react-mui-utils';
import { type DivisionNumber } from '../../types';

type Props = Readonly<{
  divisionNumber: DivisionNumber;
  divisionNumberOnChange: (value: DivisionNumber) => void;
}>;

export const DivisionNumberSlider = memoNamed<Props>(
  'DivisionNumberSlider',
  (props) => (
    <div
      css={css`
        padding: 10px 0;
      `}
    >
      <div>{'分割数'}</div>
      <MuiSlider
        ariaLabelledby={'division-number'}
        max={30}
        min={2}
        step={1}
        value={props.divisionNumber}
        onChange={
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          props.divisionNumberOnChange as (value: number) => void
        }
      />
    </div>
  ),
);
