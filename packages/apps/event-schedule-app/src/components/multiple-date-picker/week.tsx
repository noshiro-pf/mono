import { DatePickerWeekStyled } from '../bp';
import { DatePickerDate } from './date-picker-day';

type Props = Readonly<{
  week: readonly Readonly<{
    ymd: YearMonthDate;
    selected: boolean;
    outside: boolean;
    dayType: DayType;
    holidayJpName: string | undefined;
  }>[];
  useOutlinedSelectedStyle?: boolean;
  onClick?: (ymd: YearMonthDate) => void;
}>;

export const Week = memoNamed<Props>(
  'Week',
  ({ week, useOutlinedSelectedStyle, onClick }) => {
    const listWithHandler = useMemo(
      () =>
        week.map((d, index) => ({
          value: d,
          index,
          handler: mapOptional(onClick, (f) => () => {
            f(d.ymd);
          }),
        })),
      [week, onClick],
    );

    return (
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      <DatePickerWeekStyled role='row'>
        {listWithHandler.map(({ value, handler, index }) => (
          <DatePickerDate
            key={index}
            dayType={value.dayType}
            holidayJpName={value.holidayJpName}
            outside={value.outside}
            selected={value.selected}
            useOutlinedSelectedStyle={useOutlinedSelectedStyle}
            ymd={value.ymd}
            onClick={handler}
          />
        ))}
      </DatePickerWeekStyled>
    );
  },
);
