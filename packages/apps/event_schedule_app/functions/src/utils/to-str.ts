import type {
  AnswerSymbolIconId,
  DatetimeRange,
  DatetimeSpecificationEnumType,
  HoursMinutes,
  YearMonthDate,
} from '@noshiro/event-schedule-app-api';

export const pad2 = (n: number): string => n.toString().padStart(2, '0');

const ymd2str = (ymd: YearMonthDate): string =>
  `${ymd.year}/${pad2(ymd.month)}/${pad2(ymd.date)}`;

const hm2str = (hm: HoursMinutes): string =>
  `${pad2(hm.hours)}:${pad2(hm.minutes)}`;

export const datetimeRange2str = (
  datetimeRange: DatetimeRange,
  datetimeSpecification: DatetimeSpecificationEnumType
): string => {
  switch (datetimeSpecification) {
    case 'noStartEndSpecified':
      return ymd2str(datetimeRange.ymd);
    case 'startSpecified':
      return `${ymd2str(datetimeRange.ymd)} ${hm2str(
        datetimeRange.timeRange.start
      )}~`;
    case 'endSpecified':
      return `${ymd2str(datetimeRange.ymd)} ~${hm2str(
        datetimeRange.timeRange.end
      )}`;
    case 'startAndEndSpecified':
      return `${ymd2str(datetimeRange.ymd)} ${hm2str(
        datetimeRange.timeRange.start
      )}~${hm2str(datetimeRange.timeRange.end)}`;
  }
};

export const iconId2str = (iconId: AnswerSymbolIconId | undefined): string => {
  switch (iconId) {
    case undefined:
      return '-';
    case 'handmade-circle':
      return '〇';
    case 'handmade-triangle':
      return '△';
    case 'handmade-cross':
      return '×';
  }
};
