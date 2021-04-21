import {
  DateEnum,
  getDate,
  pipe,
  setDate,
  setHours,
  setMinutes,
} from '@noshiro/ts-utils';
import { defaultAnswerDeadlineRemainingDays } from '../../../constants/default-answer-deadline-remaining';
import { texts } from '../../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../../types/enum/datetime-specification-type';
import {
  createIAnswerSymbol,
  IAnswerSymbol,
} from '../../../types/record/base/answer-symbol';
import {
  createINotificationSettings,
  INotificationSettings,
} from '../../../types/record/base/notification-settings';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import { IYmdHm } from '../../../types/record/ymd-hm';
import { IList } from '../../../utils/immutable';
import { ymdhmFromDate } from '../../../utils/ymdhm-from-date';

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

export const defaultNotificationSettings: INotificationSettings = createINotificationSettings().set(
  'notifyOnAnswerChange',
  true
);

export const defaultDatetimeSpecification: DatetimeSpecificationEnumType =
  'startSpecified';
