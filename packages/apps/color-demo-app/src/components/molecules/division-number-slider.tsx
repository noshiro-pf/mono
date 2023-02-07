import { MuiSlider } from '@noshiro/react-mui-utils';

type Props = Readonly<{
  divisionNumber: number;
  divisionNumberOnChange: (value: number) => void;
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
        ariaLabelledby='division-number'
        max={30}
        min={2}
        step={1}
        value={props.divisionNumber}
        onChange={props.divisionNumberOnChange as (value: number) => void}
      />
    </div>
  )
);
