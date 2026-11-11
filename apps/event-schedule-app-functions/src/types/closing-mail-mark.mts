import { firestorePaths } from 'event-schedule-app-shared';
import * as t from 'ts-fortress';

/**
 * `internal/closingMail` of an event: the deadline, as an instant, that the
 * "answers closed" mail was last sent for, and the id of the attempt that sent
 * it, by which that attempt knows the mark as its own. Absent until the first
 * mail.
 */
const closingMailMarkTypeDef = t.record({
  [firestorePaths.deadlineMillis]: t.number(0),
  [firestorePaths.claimId]: t.string(''),
});

export type ClosingMailMark = t.TypeOf<typeof closingMailMarkTypeDef>;

export const isClosingMailMark = closingMailMarkTypeDef.is;
