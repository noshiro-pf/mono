import type { DateEnum } from '@noshiro/ts-utils';
import {
  getDate,
  pipe,
  setDate,
  setHours,
  setMinutes,
} from '@noshiro/ts-utils';
import { defaultAnswerDeadlineRemainingDays, texts } from '../../../constants';
import { ymdhmFromDate } from '../../../functions';
import type {
  DatetimeSpecificationEnumType,
  IAnswerSymbol,
  IDatetimeRange,
  INotificationSettings,
  IYmdHm,
} from '../../../types';
import {
  createIAnswerSymbol,
  createINotificationSettings,
} from '../../../types';
import { IList } from '../../../utils';

export const defaultDatetimeRangeList: IList<IDatetimeRange> = IList([]);

export const defaultAnswerSymbolList: IList<IAnswerSymbol> = IList([
  createIAnswerSymbol({
    iconId: 'handmade-circle',
    description: texts.symbolDescriptionDefault.circle,
    point: 10,
  }),
  createIAnswerSymbol({
    iconId: 'handmade-triangle',
    description: texts.symbolDescriptionDefault.triangleUp,
    point: 5,
  }),
  createIAnswerSymbol({
    iconId: 'handmade-cross',
    description: texts.symbolDescriptionDefault.cross,
    point: 0,
  }),
]);

const today = new Date();
export const defaultAnswerDeadline: IYmdHm = ymdhmFromDate(
  pipe(today)
    .chain((d) =>
      setDate(d, (getDate(d) + defaultAnswerDeadlineRemainingDays) as DateEnum)
    )
    .chain((d) => setHours(d, 23))
    .chain((d) => setMinutes(d, 59)).value
);

export const defaultNotificationSettings: INotificationSettings =
  createINotificationSettings().set('notifyOnAnswerChange', true);

export const defaultDatetimeSpecification: DatetimeSpecificationEnumType =
  'startSpecified';
