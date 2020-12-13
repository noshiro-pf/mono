import { DateEnum, getDate, setDate } from '@mono/ts-utils';
import { texts } from '../../../constants/texts';
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

export const defaultAnswerDeadline: IYmdHm = ymdhmFromDate(
  setDate(new Date(), (getDate(new Date()) + 30) as DateEnum)
);

export const defaultNotificationSettings: INotificationSettings = createINotificationSettings().set(
  'notifyOnAnswerChange',
  true
);
