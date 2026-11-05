import { Button } from 'blueprint-synstate';
import { map, type InitializedObservable } from 'synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { TimeRangeView, YmdInput } from '../../../molecules/index.mjs';
import * as styles from '../select-datetimes.module.css';

type Props = Readonly<{
  datetimeSpecification: Bindable<DatetimeSpecificationEnumType>;
  datetimeRange: InitializedObservable<DatetimeRange>;
  onYmdChange: (ymd: YearMonthDate | undefined) => void;
  onRangeStartChange: (hm: HoursMinutes) => void;
  onRangeEndChange: (hm: HoursMinutes) => void;
  onDuplicateClick: () => void;
  onDeleteClick: () => void;
}>;

export const SelectedDatetimeRow = ({
  datetimeRange,
  onYmdChange,
  datetimeSpecification,
  onRangeEndChange,
  onRangeStartChange,
  onDuplicateClick,
  onDeleteClick,
}: Props): JSX.Element => (
  <div
    class={constant(styles.row)}
    data-e2e={constant('selected-datetime-row')}
  >
    <div class={constant(styles.rowInputs)}>
      <div class={constant(styles.rowDate)}>
        <YmdInput
          ymd={datetimeRange.pipe(map((r) => r.ymd))}
          onYmdChange={onYmdChange}
        />
      </div>
      <div class={constant(styles.rowTime)}>
        <TimeRangeView
          datetimeSpecification={datetimeSpecification}
          timeRange={datetimeRange.pipe(map((r) => r.timeRange))}
          onRangeEndChange={onRangeEndChange}
          onRangeStartChange={onRangeStartChange}
        />
      </div>
    </div>
    <div class={constant(styles.rowButtons)}>
      <Button
        icon={'duplicate'}
        variant={constant('minimal')}
        onClick={onDuplicateClick}
      />
      <Button
        data-e2e={constant('delete-button')}
        icon={'trash'}
        variant={constant('minimal')}
        onClick={onDeleteClick}
      />
    </div>
  </div>
);
