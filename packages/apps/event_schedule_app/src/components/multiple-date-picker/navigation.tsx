import { Button } from '@blueprintjs/core';
import { monthsList } from '@noshiro/ts-utils-additional';
import { BpSelect } from '../bp';

const thisYear = IDate.getLocaleYear(IDate.today());
const thisMonth = IDate.getLocaleMonth(IDate.today());

const yearOption: readonly number[] = IList.rangeThrow(
  thisYear - 100,
  thisYear + 100
);
const monthOption: readonly OptionProps[] = monthsList.en.map((e) => ({
  value: e.value,
  label: e.name,
}));

type Props = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  onYearChange: (year: YearEnum) => void;
  onMonthChange: (month: MonthEnum) => void;
  onPrevMonthClick: () => void;
  onNextMonthClick: () => void;
}>;

export const DatepickerNav = memoNamed<Props>(
  'DatepickerNav',
  ({
    year,
    month,
    onYearChange,
    onMonthChange,
    onPrevMonthClick,
    onNextMonthClick,
  }) => {
    const onYearChangeHandler = useCallback(
      (value: string) => {
        onYearChange(Str.toNumber(value) ?? thisYear);
      },
      [onYearChange]
    );

    const onMonthChangeHandler = useCallback(
      (value: string) => {
        onMonthChange((Str.toNumber(value) ?? thisMonth) as MonthEnum);
      },
      [onMonthChange]
    );

    return (
      <Nav>
        <Button
          icon={'chevron-left'}
          minimal={true}
          onClick={onPrevMonthClick}
        />
        <BpSelect
          minimal={true}
          options={yearOption}
          value={year}
          onValueChange={onYearChangeHandler}
        />
        <BpSelect
          minimal={true}
          options={monthOption}
          value={month}
          onValueChange={onMonthChangeHandler}
        />
        <Button
          icon={'chevron-right'}
          minimal={true}
          onClick={onNextMonthClick}
        />
      </Nav>
    );
  }
);

const Nav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
