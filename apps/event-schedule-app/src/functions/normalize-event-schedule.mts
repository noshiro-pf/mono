import { Arr, pipe } from 'ts-data-forge';
import { compareDatetimeRange } from 'ts-fortress-types';
import { datetimeRange2str } from '../constants/index.mjs';
import { sortedTuple } from '../utils-ported/index.mjs';

export const normalizeEventSchedule = (
  eventSchedule: EventSchedule,
): EventSchedule =>
  ({
    title: eventSchedule.title.trim(),
    notes: `${eventSchedule.notes.trim()}\n`,
    datetimeSpecification: eventSchedule.datetimeSpecification,
    datetimeRangeList: pipe(eventSchedule.datetimeRangeList)
      .map((list) => Arr.uniqBy(list, datetimeRange2str))
      .map((list) => sortedTuple(list, compareDatetimeRange)).value,
    answerDeadline: eventSchedule.answerDeadline,
    answerIcons: eventSchedule.answerIcons,
    notificationSettings: eventSchedule.notificationSettings,
    timezoneOffsetMinutes: eventSchedule.timezoneOffsetMinutes,
    author: eventSchedule.author,
    archivedBy: eventSchedule.archivedBy,
  }) as const;
