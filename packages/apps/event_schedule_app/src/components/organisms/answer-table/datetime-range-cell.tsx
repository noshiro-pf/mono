import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../types/enum/datetime-specification-type';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { hm2str, ymd2str, ymd2strWithDay } from '../../../utils/ymdhm2str';

const vt = texts.date;

type Props = Readonly<{
  datetimeRange: IDatetimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
}>;

export const DatetimeRangeCell = memoNamed<Props>(
  'DatetimeRangeCell',
  (props) =>
    props.datetimeSpecification === 'noStartEndSpecified' ? (
      <>{ymd2str(props.datetimeRange.ymd)}</>
    ) : props.datetimeSpecification === 'startSpecified' ? (
      <>
        {`${ymd2strWithDay(props.datetimeRange.ymd)}  ${hm2str(
          props.datetimeRange.timeRange.start
        )}${vt.timeRangeTilde}`}
      </>
    ) : props.datetimeSpecification === 'endSpecified' ? (
      <>
        {`${ymd2strWithDay(props.datetimeRange.ymd)}  ${
          vt.timeRangeTilde
        }${hm2str(props.datetimeRange.timeRange.start)}`}
      </>
    ) : props.datetimeSpecification === 'startAndEndSpecified' ? (
      <>
        {`${ymd2strWithDay(props.datetimeRange.ymd)}  ${hm2str(
          props.datetimeRange.timeRange.start
        )}${vt.timeRangeTilde}${hm2str(props.datetimeRange.timeRange.end)}`}
      </>
    ) : (
      <>{ymd2str(props.datetimeRange.ymd)}</>
    )
);
