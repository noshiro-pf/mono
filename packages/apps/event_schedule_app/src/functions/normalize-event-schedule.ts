import { compareDatetimeRange } from '@noshiro/event-schedule-app-shared';
import { datetimeRange2str } from './datetime-range-to-str';

export const normalizeEventSchedule = (
  eventSchedule: EventSchedule
): EventSchedule => ({
  title: eventSchedule.title.trim(),
  notes: eventSchedule.notes.trim().concat('\n'),
  datetimeSpecification: eventSchedule.datetimeSpecification,
  datetimeRangeList: pipe(eventSchedule.datetimeRangeList)
    .chain((list) => IList.uniqBy(list, datetimeRange2str))
    .chain((list) => IList.sort(list, compareDatetimeRange)).value,
  answerDeadline: eventSchedule.answerDeadline,
  answerIcons: eventSchedule.answerIcons,
  notificationSettings: eventSchedule.notificationSettings,
  timezoneOffsetMinutes: eventSchedule.timezoneOffsetMinutes,
  author: eventSchedule.author,
});
