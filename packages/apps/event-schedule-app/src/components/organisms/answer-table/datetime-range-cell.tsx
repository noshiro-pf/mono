import {
  calendarDateColor,
  hm2str,
  ymd2dayStr,
  ymd2str,
} from '../../../constants';
import { ymd2day } from '../../../utils';

const dc = dict.common.date;

type Props = Readonly<{
  datetimeRange: DatetimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  tableMinimized: boolean;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const DatetimeRangeCell = memoNamed<Props>(
  'DatetimeRangeCell',
  ({
    datetimeRange,
    datetimeSpecification,
    tableMinimized,
    holidaysJpDefinition,
  }) => {
    const colored: React.CSSProperties = useMemo(() => {
      const dayValue = ymd2day(datetimeRange.ymd);

      return {
        color: match(
          holidaysJpDefinition.has(datetimeRange.ymd)
            ? 'holiday'
            : dayValue === 0
            ? 'Sunday'
            : dayValue === 6
            ? 'Saturday'
            : 'normal',
          {
            holiday: calendarDateColor.sunday,
            Sunday: calendarDateColor.sunday,
            Saturday: calendarDateColor.saturday,
            normal: calendarDateColor.normal,
          }
        ),
      };
    }, [holidaysJpDefinition, datetimeRange.ymd]);

    return tableMinimized ? (
      <span
        style={colored}
      >{`${datetimeRange.ymd.month}/${datetimeRange.ymd.date}`}</span>
    ) : (
      match(datetimeSpecification, {
        noStartEndSpecified: (
          <>
            <span>{ymd2str(datetimeRange.ymd)}</span>
            <span style={colored}>{ymd2dayStr(datetimeRange.ymd)}</span>
          </>
        ),
        startSpecified: (
          <>
            <span>{ymd2str(datetimeRange.ymd)}</span>
            <span style={colored}>{ymd2dayStr(datetimeRange.ymd)}</span>
            <span> </span>
            <span>{hm2str(datetimeRange.timeRange.start)}</span>
            <span>{dc.timeRangeTilde}</span>
          </>
        ),
        endSpecified: (
          <>
            <span>{ymd2str(datetimeRange.ymd)}</span>
            <span style={colored}>{ymd2dayStr(datetimeRange.ymd)}</span>
            <span> </span>
            <span>{dc.timeRangeTilde}</span>
            <span>{hm2str(datetimeRange.timeRange.end)}</span>
          </>
        ),
        startAndEndSpecified: (
          <>
            <span>{ymd2str(datetimeRange.ymd)}</span>
            <span style={colored}>{ymd2dayStr(datetimeRange.ymd)}</span>
            <span> </span>
            <span>{hm2str(datetimeRange.timeRange.start)}</span>
            <span>{dc.timeRangeTilde}</span>
            <span>{hm2str(datetimeRange.timeRange.end)}</span>
          </>
        ),
      })
    );
  }
);
