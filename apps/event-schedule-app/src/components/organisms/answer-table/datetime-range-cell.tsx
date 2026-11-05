import type { InitializedObservable } from 'synstate';
import {
  constant,
  If,
  inlineMap,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { IMapMapped } from 'ts-data-forge';
import {
  calendarDateColor,
  dict,
  hm2str,
  ymd2dayStr,
  ymd2str,
} from '../../../constants/index.mjs';
import { ymd2day } from '../../../utils/index.mjs';

const dc = dict.common.date;

type Props = Readonly<{
  datetimeRange: DatetimeRange;
  datetimeSpecification: Bindable<DatetimeSpecificationEnumType>;
  minimized: Bindable<boolean>;
  holidaysJpDefinition: InitializedObservable<
    IMapMapped<YearMonthDate, string, YmdKey>
  >;
}>;

export const DatetimeRangeCell = ({
  datetimeRange: { ymd, timeRange },
  datetimeSpecification,
  minimized,
  holidaysJpDefinition,
}: Props): JSX.Element => {
  const colored = {
    color: inlineMap(holidaysJpDefinition, (holidays) => {
      const dayValue = ymd2day(ymd);

      return dayValue === 0 || holidays.has(ymd)
        ? calendarDateColor.sunday
        : dayValue === 6
          ? calendarDateColor.saturday
          : calendarDateColor.normal;
    }),
  } as const;

  const has = (
    pick: (spec: DatetimeSpecificationEnumType) => boolean,
  ): Bindable<boolean> => mapBindable(datetimeSpecification, pick);

  return (
    <If
      cond={minimized}
      else={
        <>
          <span>{constant(ymd2str(ymd))}</span>
          <span style={colored}>{constant(ymd2dayStr(ymd))}</span>
          <If
            cond={has((s) => s !== 'noStartEndSpecified')}
            then={<span>{constant(' ')}</span>}
          />
          <If
            cond={has(
              (s) => s === 'startSpecified' || s === 'startAndEndSpecified',
            )}
            then={<span>{constant(hm2str(timeRange.start))}</span>}
          />
          <If
            cond={has((s) => s !== 'noStartEndSpecified')}
            then={<span>{constant(dc.timeRangeTilde)}</span>}
          />
          <If
            cond={has(
              (s) => s === 'endSpecified' || s === 'startAndEndSpecified',
            )}
            then={<span>{constant(hm2str(timeRange.end))}</span>}
          />
        </>
      }
      then={<span style={colored}>{constant(`${ymd.month}/${ymd.date}`)}</span>}
    />
  );
};
