import { Button } from '@blueprintjs/core';
import { BpDatePicker } from '../../../bp';
import { TimeRangeView } from '../../../molecules';

type Props = Readonly<{
  datetimeSpecification: DatetimeSpecificationEnumType;
  datetimeRange: DatetimeRange;
  onYmdChange: (ymd: YearMonthDate | undefined) => void;
  onRangeStartChange: (hm: HoursMinutes) => void;
  onRangeEndChange: (hm: HoursMinutes) => void;
  onDuplicateClick: () => void;
  onDeleteClick: () => void;
}>;

export const SelectedDatetimeRow = memoNamed<Props>(
  'SelectedDatetimeRow',
  ({
    datetimeRange,
    onYmdChange,
    datetimeSpecification,
    onRangeEndChange,
    onRangeStartChange,
    onDuplicateClick,
    onDeleteClick,
  }) => (
    <div
      css={css`
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        margin-bottom: 5px;
        justify-content: space-between;
      `}
      data-cy={'selected-datetime-row'}
    >
      <div
        css={css`
          display: flex;
          flex-wrap: wrap;
          align-items: center;
        `}
      >
        <div
          css={css`
            margin-top: 3px;
            margin-bottom: 3px;
          `}
        >
          <BpDatePicker
            closeOnSelection={true}
            ymd={datetimeRange.ymd}
            onYmdChange={onYmdChange}
          />
        </div>
        <div
          css={css`
            margin-left: 7px;
          `}
        >
          <TimeRangeView
            datetimeSpecification={datetimeSpecification}
            timeRange={datetimeRange.timeRange}
            onRangeEndChange={onRangeEndChange}
            onRangeStartChange={onRangeStartChange}
          />
        </div>
      </div>

      <div
        css={css`
          display: flex;
          flex-wrap: nowrap;
          margin-left: 5px;
        `}
      >
        <Button icon={'duplicate'} minimal={true} onClick={onDuplicateClick} />
        <Button icon={'trash'} minimal={true} onClick={onDeleteClick} />
      </div>
    </div>
  ),
);
