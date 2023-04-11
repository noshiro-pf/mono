import { Button } from '@blueprintjs/core';
import { monthsList } from '@noshiro/ts-utils-additional';
import { BpSelect } from '../bp';

const thisYear = toUint32(DateUtils.getLocaleYear(DateUtils.today()));
const thisMonth = DateUtils.getLocaleMonth(DateUtils.today());

const yearOption: readonly YearEnum[] = Arr.range(
  Uint32.sub(thisYear, 100),
  Uint32.add(thisYear, 100)
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
        onYearChange(
          mapOptional(Num.from(value), (a) => a as YearEnum) ?? thisYear
        );
      },
      [onYearChange]
    );

    const onMonthChangeHandler = useCallback(
      (value: string) => {
        onMonthChange(
          mapOptional(Num.from(value), (a) => a as MonthEnum) ?? thisMonth
        );
      },
      [onMonthChange]
    );

    return (
      <div
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
        `}
      >
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
      </div>
    );
  }
);
