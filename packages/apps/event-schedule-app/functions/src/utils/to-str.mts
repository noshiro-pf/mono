import {
  type AnswerIconIdWithNone,
  type AnswerIconPoint,
  type DatetimeSpecificationEnumType,
} from '@noshiro/event-schedule-app-shared';
import {
  type DatetimeRange,
  type HoursMinutes,
  type YearMonthDate,
} from '@noshiro/io-ts-types';

export const pad2 = (n: number): string => n.toString().padStart(2, '0');

const ymd2str = (ymd: YearMonthDate): string =>
  `${ymd.year}/${pad2(ymd.month)}/${pad2(ymd.date)}`;

const hm2str = (hm: HoursMinutes): string =>
  `${pad2(hm.hours)}:${pad2(hm.minutes)}`;

export const datetimeRange2str = (
  datetimeRange: DatetimeRange,
  datetimeSpecification: DatetimeSpecificationEnumType,
): string => {
  switch (datetimeSpecification) {
    case 'noStartEndSpecified':
      return ymd2str(datetimeRange.ymd);
    case 'startSpecified':
      return `${ymd2str(datetimeRange.ymd)} ${hm2str(
        datetimeRange.timeRange.start,
      )}~`;
    case 'endSpecified':
      return `${ymd2str(datetimeRange.ymd)} ~${hm2str(
        datetimeRange.timeRange.end,
      )}`;
    case 'startAndEndSpecified':
      return `${ymd2str(datetimeRange.ymd)} ${hm2str(
        datetimeRange.timeRange.start,
      )}~${hm2str(datetimeRange.timeRange.end)}`;
  }
};

export const iconId2str = (
  iconId: AnswerIconIdWithNone,
  point: AnswerIconPoint,
): string => {
  switch (iconId) {
    case 'none':
      return 'ー';
    case 'good':
      return '〇';
    case 'fair':
      return `△(${point})`;
    case 'poor':
      return '✕';
  }
};
