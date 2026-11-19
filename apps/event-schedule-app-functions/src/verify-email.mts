import { firestorePaths } from 'event-schedule-app-shared';
import type { Firestore } from 'firebase-admin/firestore';
import { https } from 'firebase-functions/v1';
import { deletedUserId } from './functions/index.mjs';
import { eventOf, getEmail } from './get-event-item.mjs';
import {
  isEmailChecks,
  type EmailChecks,
  type VerifyEmailPayload,
} from './types/index.mjs';

/**
 * The body of `verifyEmail`, which the edit page calls before it shows the
 * form: whether `email` is the notification email of the event.
 *
 * - An event made by a signed-in account is checked for that account alone,
 *   signed in (`callerUid`); anyone else, a deleted account's event included,
 *   is refused with `permission-denied` before the email is read. The rules let
 *   no one else save such an event anyway.
 * - An event made signed out is checked for anyone, at most
 *   {@link emailCheckLimit} times per {@link emailCheckWindowMillis} for the
 *   event; a check over that is refused with `resource-exhausted`.
 * - An event that does not exist, or has no email, is `'ng'`, as an email that
 *   does not match.
 */
export const verifyEmailImpl = async (
  { eventId, email }: VerifyEmailPayload,
  callerUid: string | undefined,
  deps: VerifyEmailDeps,
): Promise<'ng' | 'ok'> => {
  const authorId = await deps.readAuthorId(eventId);

  if (authorId === undefined) {
    return 'ng';
  }

  if (
    authorId === deletedUserId ||
    (authorId !== null && authorId !== callerUid)
  ) {
    throw new https.HttpsError(
      'permission-denied',
      "Only the event's author, signed in, may edit this event.",
    );
  }

  if (authorId === null && !(await deps.claimCheck(eventId))) {
    throw new https.HttpsError(
      'resource-exhausted',
      'Too many checks of this event for now; try again later.',
    );
  }

  const expected = await deps.readEmail(eventId);

  // An event with no email matches none, not the empty one.
  return expected !== '' && expected === email ? 'ok' : 'ng';
};

/**
 * Whether one more check of an event made signed out may run at `nowMillis`,
 * and what its `internal/emailChecks` is to hold afterwards: a fixed window of
 * {@link emailCheckWindowMillis} that starts at its first check and allows
 * {@link emailCheckLimit} of them. A record it cannot read, or one whose window
 * starts later than `nowMillis`, starts a new window.
 */
export const nextEmailChecks = (
  stored: unknown,
  nowMillis: number,
): Readonly<{ allowed: boolean; next: EmailChecks }> => {
  const current = isEmailChecks(stored) ? stored : undefined;

  if (
    current === undefined ||
    nowMillis < current.windowStartMillis ||
    nowMillis - current.windowStartMillis >= emailCheckWindowMillis
  ) {
    return {
      allowed: true,
      next: { windowStartMillis: nowMillis, count: 1 },
    };
  }

  if (current.count >= emailCheckLimit) {
    return { allowed: false, next: current };
  }

  return {
    allowed: true,
    next: { ...current, count: current.count + 1 },
  };
};

/** {@link VerifyEmailDeps} on Firestore through the Admin SDK. */
export const firestoreVerifyEmailDeps = (db: Firestore): VerifyEmailDeps =>
  ({
    readAuthorId: async (eventId) => {
      const snapshot = await db
        .collection(firestorePaths.events)
        .doc(eventId)
        .get();

      return eventOf(snapshot.data())?.author.id;
    },
    readEmail: async (eventId) => getEmail(db, eventId),
    claimCheck: async (eventId) => {
      const ref = db
        .collection(firestorePaths.events)
        .doc(eventId)
        .collection(firestorePaths.internal)
        .doc(firestorePaths.emailChecks);

      return db.runTransaction(async (tx) => {
        const stored = await tx.get(ref);

        const { allowed, next } = nextEmailChecks(stored.data(), Date.now());

        if (allowed) {
          tx.set(ref, next);
        }

        return allowed;
      });
    },
  }) as const;

/** How many checks an event made signed out takes per window. */
export const emailCheckLimit = 10;

/** The length of the window {@link emailCheckLimit} counts in: an hour. */
export const emailCheckWindowMillis = 60 ** 2 * 1000;

export type VerifyEmailDeps = Readonly<{
  /**
   * `author.id` of the event: a uid, `''` for a deleted account, `null` for an
   * event made signed out, and `undefined` when there is no such event.
   */
  readAuthorId: (eventId: string) => Promise<string | null | undefined>;

  /** The event's notification email, `''` when it has none. */
  readEmail: (eventId: string) => Promise<string>;

  /** Counts one check of the event; whether it was within the limit. */
  claimCheck: (eventId: string) => Promise<boolean>;
}>;
