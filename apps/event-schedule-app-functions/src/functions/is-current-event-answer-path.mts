import { firestorePaths } from 'event-schedule-app-shared';
import { Arr } from 'ts-data-forge';

/**
 * Whether `path` is that of an answer of an event in the current events
 * collection (`<events>/<eventId>/answers/<answerId>`). A collection-group
 * query on `answers` also finds those under the events collections of earlier
 * versions, which nothing reads any more.
 */
export const isCurrentEventAnswerPath = (path: string): boolean => {
  const segments = path.split('/');

  return (
    Arr.isFixedLengthArray(4, segments) &&
    segments[0] === firestorePaths.events &&
    segments[2] === firestorePaths.answers
  );
};
