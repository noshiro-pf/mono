import type {
  DatetimeRange,
  DatetimeSpecificationEnumType,
} from '@noshiro/event-schedule-app-shared';
import { memoNamed } from '@noshiro/react-utils';
import { match } from '@noshiro/ts-utils';
import { dict } from '../../../constants';
import { hm2str, ymd2strWithDay } from '../../../functions';

const dc = dict.common.date;

type Props = Readonly<{
  datetimeRange: DatetimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
}>;

export const DatetimeRangeCell = memoNamed<Props>(
  'DatetimeRangeCell',
  ({ datetimeRange, datetimeSpecification }) => (
    <>
      {match(datetimeSpecification, {
        noStartEndSpecified: ymd2strWithDay(datetimeRange.ymd),
        startSpecified: `${ymd2strWithDay(datetimeRange.ymd)}  ${hm2str(
          datetimeRange.timeRange.start
        )}${dc.timeRangeTilde}`,
        endSpecified: `${ymd2strWithDay(datetimeRange.ymd)}  ${
          dc.timeRangeTilde
        }${hm2str(datetimeRange.timeRange.start)}`,
        startAndEndSpecified: `${ymd2strWithDay(datetimeRange.ymd)}  ${hm2str(
          datetimeRange.timeRange.start
        )}${dc.timeRangeTilde}${hm2str(datetimeRange.timeRange.end)}`,
      })}
    </>
  )
);
