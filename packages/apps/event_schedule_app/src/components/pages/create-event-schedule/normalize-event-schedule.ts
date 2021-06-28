import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { compareDatetimeRange } from '@noshiro/event-schedule-app-shared';
import { IList, pipe, uniq } from '@noshiro/ts-utils';

export const normalizeEventSchedule = (
  eventSchedule: EventSchedule
): EventSchedule => ({
  title: eventSchedule.title.trim(),
  notes: eventSchedule.notes.trim().concat('\n'),
  datetimeSpecification: eventSchedule.datetimeSpecification,
  datetimeRangeList: pipe(eventSchedule.datetimeRangeList)
    .chain((list) => uniq(list))
    .chain((list) => IList.sort(list, compareDatetimeRange)).value,
  useAnswerDeadline: eventSchedule.useAnswerDeadline,
  answerDeadline: eventSchedule.answerDeadline,
  customizeSymbolSettings: eventSchedule.customizeSymbolSettings,
  answerSymbolList: eventSchedule.answerSymbolList,
  useNotification: eventSchedule.useNotification,
  notificationSettings: eventSchedule.notificationSettings,
  timezoneOffsetMinutes: eventSchedule.timezoneOffsetMinutes,
});
