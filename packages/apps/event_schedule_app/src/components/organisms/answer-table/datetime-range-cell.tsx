import type {
  DatetimeRange,
  DatetimeSpecificationEnumType,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../../constants';
import { hm2str, ymd2strWithDay } from '../../../functions';

const vt = texts.date;

type Props = Readonly<{
  datetimeRange: DatetimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
}>;

export const DatetimeRangeCell = memoNamed<Props>(
  'DatetimeRangeCell',
  (props) => {
    switch (props.datetimeSpecification) {
      case 'noStartEndSpecified':
        return <>{ymd2strWithDay(props.datetimeRange.ymd)}</>;
      case 'startSpecified':
        return (
          <>
            {`${ymd2strWithDay(props.datetimeRange.ymd)}  ${hm2str(
              props.datetimeRange.timeRange.start
            )}${vt.timeRangeTilde}`}
          </>
        );
      case 'endSpecified':
        return (
          <>
            {`${ymd2strWithDay(props.datetimeRange.ymd)}  ${
              vt.timeRangeTilde
            }${hm2str(props.datetimeRange.timeRange.start)}`}
          </>
        );
      case 'startAndEndSpecified':
        return (
          <>
            {`${ymd2strWithDay(props.datetimeRange.ymd)}  ${hm2str(
              props.datetimeRange.timeRange.start
            )}${vt.timeRangeTilde}${hm2str(props.datetimeRange.timeRange.end)}`}
          </>
        );
    }
  }
);
