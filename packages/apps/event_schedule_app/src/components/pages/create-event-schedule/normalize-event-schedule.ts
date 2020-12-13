import { compareDatetimeRange } from '../../../types/record/datetime-range';
import {
  createIEventSchedule,
  IEventSchedule,
} from '../../../types/record/event-schedule';

export const normalizeEventSchedule = (
  eventSchedule: IEventSchedule
): IEventSchedule =>
  createIEventSchedule({
    title: eventSchedule.title.trim(),
    notes: eventSchedule.notes.trim().concat('\n'),
    datetimeSpecification: eventSchedule.datetimeSpecification,
    datetimeRangeList: eventSchedule.datetimeRangeList
      .toSet()
      .toList()
      .sort(compareDatetimeRange),
    useAnswerDeadline: eventSchedule.useAnswerDeadline,
    answerDeadline: eventSchedule.answerDeadline,
    usePassword: eventSchedule.usePassword,
    password: eventSchedule.password,
    answerSymbolList: eventSchedule.answerSymbolList,
    useNotification: eventSchedule.useNotification,
    notificationSettings: eventSchedule.notificationSettings,
  });
