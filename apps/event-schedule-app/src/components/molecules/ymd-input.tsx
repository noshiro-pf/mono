import { DateInput } from 'blueprint-synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import {
  dateInputMaxDate,
  formatDateInputText,
  parseDateInputText,
  ymdFromDayValue,
  ymdToDayValue,
} from '../../functions/index.mjs';
import * as styles from './ymd-input.module.css';

type Props = Readonly<{
  ymd: Bindable<YearMonthDate | undefined>;
  onYmdChange: (ymd: YearMonthDate | undefined) => void;
}>;

/**
 * A date picked from a calendar, written as the browser writes dates, which
 * react-blueprintjs-utils' `BpDatePicker` was.
 */
export const YmdInput = ({ ymd, onYmdChange }: Props): JSX.Element => (
  <div class={constant(styles.ymdInput)}>
    <DateInput
      formatDate={formatDateInputText}
      maxDate={dateInputMaxDate()}
      parseDate={(text) => parseDateInputText(text)}
      placeholder={'yyyy-mm-dd'}
      reverseMonthAndYearMenus
      showActionsBar
      value={mapBindable(ymd, (d) => (d === undefined ? '' : ymdToDayValue(d)))}
      onChange={(value) => {
        onYmdChange(ymdFromDayValue(value));
      }}
    />
  </div>
);
