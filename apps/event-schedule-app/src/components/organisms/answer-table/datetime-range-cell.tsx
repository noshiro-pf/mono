import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type IMapMapped } from 'ts-data-forge';
import {
  calendarDateColor,
  hm2str,
  ymd2dayStr,
  ymd2str,
} from '../../../constants/index.mjs';
import { match } from '../../../utils-ported/index.mjs';
import { ymd2day } from '../../../utils/index.mjs';

const dc = dict.common.date;

type Props = Readonly<{
  datetimeRange: DatetimeRange;
  datetimeSpecification: DatetimeSpecificationEnumType;
  minimized: boolean;
  holidaysJpDefinition: IMapMapped<YearMonthDate, string, YmdKey>;
}>;

export const DatetimeRangeCell = memoNamed<Props>(
  'DatetimeRangeCell',
  ({
    datetimeRange,
    datetimeSpecification,
    minimized,
    holidaysJpDefinition,
  }) => {
    const colored: React.CSSProperties = React.useMemo(() => {
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
          },
        ),
      };
    }, [holidaysJpDefinition, datetimeRange.ymd]);

    return minimized ? (
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
  },
);
