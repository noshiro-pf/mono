import { daysOfWeekList } from '@noshiro/ts-utils-additional';
import {
  DatePickerWeekdayReadonlyStyled,
  DatePickerWeekdaysRowStyled,
  DatePickerWeekdaysStyled,
  DatePickerWeekdayStyled,
} from '../bp';

type Props = Readonly<{
  onClick?: (w: DayOfWeekIndex) => void;
}>;

export const WeekdaysHeader = memoNamed<Props>(
  'WeekdaysHeader',
  ({ onClick }) => {
    const listWithHandler = useMemo(
      () =>
        daysOfWeekList.en.map((w, idx) => ({
          ...w,
          onClickHandler:
            onClick === undefined
              ? undefined
              : () => {
                  // eslint-disable-next-line no-restricted-syntax
                  onClick(idx as DayOfWeekIndex);
                },
        })),
      [onClick],
    );

    return (
      <DatePickerWeekdaysStyled role='rowgroup'>
        <DatePickerWeekdaysRowStyled role='row'>
          {listWithHandler.map(({ name: title, abbr, onClickHandler }) => (
            <HeaderCell
              key={title}
              abbr={abbr}
              title={title}
              onClick={onClickHandler}
            />
          ))}
        </DatePickerWeekdaysRowStyled>
      </DatePickerWeekdaysStyled>
    );
  },
);

type PropsHeaderCell = Readonly<{
  title: string;
  abbr: string;
  onClick?: () => void;
}>;

const HeaderCell = memoNamed<PropsHeaderCell>(
  'HeaderCell',
  ({ title, abbr, onClick }) => {
    const DatePickerWeekdayResolved =
      onClick === undefined
        ? DatePickerWeekdayReadonlyStyled
        : DatePickerWeekdayStyled;

    return (
      <DatePickerWeekdayResolved role={'columnheader'} onClick={onClick}>
        <abbr
          css={css`
            text-decoration: none !important;
          `}
          title={title}
        >
          {abbr}
        </abbr>
      </DatePickerWeekdayResolved>
    );
  },
);
