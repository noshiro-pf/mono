import {
  DatePickerWeekdayReadonlyStyled,
  DatePickerWeekdaysRowStyled,
  DatePickerWeekdaysStyled,
  DatePickerWeekdayStyled,
} from '@noshiro/react-blueprintjs-utils';
import { daysOfWeekList } from '@noshiro/ts-utils-additional';

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
          onClickHandler: mapOptional(onClick, (f) => () => {
            f(
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              idx as DayOfWeekIndex,
            );
          }),
        })),
      [onClick],
    );

    return (
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
      <DatePickerWeekdaysStyled role={'rowgroup'}>
        {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role */}
        <DatePickerWeekdaysRowStyled role={'row'}>
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
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
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
