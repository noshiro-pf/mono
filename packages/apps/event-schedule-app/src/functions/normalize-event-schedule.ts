import { compareDatetimeRange } from '@noshiro/io-ts-types';
import { datetimeRange2str } from '../constants';

export const normalizeEventSchedule = (
  eventSchedule: EventSchedule,
): EventSchedule => ({
  title: eventSchedule.title.trim(),
  notes: `${eventSchedule.notes.trim()}\n`,
  datetimeSpecification: eventSchedule.datetimeSpecification,
  datetimeRangeList: pipe(eventSchedule.datetimeRangeList)
    .chain((list) => Arr.uniqBy(list, datetimeRange2str))
    .chain((list) => Tpl.sorted(list, compareDatetimeRange)).value,
  answerDeadline: eventSchedule.answerDeadline,
  answerIcons: eventSchedule.answerIcons,
  notificationSettings: eventSchedule.notificationSettings,
  timezoneOffsetMinutes: eventSchedule.timezoneOffsetMinutes,
  author: eventSchedule.author,
  archivedBy: eventSchedule.archivedBy,

  // TODO: fix createdAt and updatedAt value
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
