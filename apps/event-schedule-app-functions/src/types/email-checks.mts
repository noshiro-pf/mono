import { firestorePaths } from 'event-schedule-app-shared';
import * as t from 'ts-fortress';

/**
 * `internal/emailChecks` of an event made signed out: when the current window
 * of `verifyEmail` checks started, and how many it has taken. Absent until the
 * first check.
 */
const emailChecksTypeDef = t.record({
  [firestorePaths.windowStartMillis]: t.number(0),
  [firestorePaths.count]: t.number(0),
});

export type EmailChecks = t.TypeOf<typeof emailChecksTypeDef>;

export const isEmailChecks = emailChecksTypeDef.is;
