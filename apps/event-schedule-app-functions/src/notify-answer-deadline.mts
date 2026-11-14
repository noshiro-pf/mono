import { firestorePaths, type EventSchedule } from 'event-schedule-app-shared';
import type {
  DocumentData,
  DocumentReference,
  Firestore,
} from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import { randomUUID } from 'node:crypto';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import {
  createMailBodyForAnswerDeadline,
  createMailBodyForAnswerResult,
  deadlinePassedWithin,
  remindersDue,
} from './functions/index.mjs';
import { emailOf, eventOf, getEmail } from './get-event-item.mjs';
import { createMailOptions, sendEmail } from './setup-mailer.mjs';
import {
  fillEventScheduleWithCheck,
  isClosingMailMark,
  type ClosingMailMark,
} from './types/index.mjs';
import { pad2 } from './utils/index.mjs';

const keys = {
  notificationSettings: 'notificationSettings',
} as const satisfies ReadonlyRecord<string, keyof EventSchedule>;

/**
 * Mails the reminders due at `nowMillis` (`remindersDue`): run every hour, it
 * reminds each event at noon in its own zone, the day-of reminder earlier when
 * the deadline is not after noon.
 */
export const notifyAnswerDeadline = async (
  db: Firestore,
  nowMillis: number,
): Promise<void> => {
  const querySnapshot = await db
    .collection(firestorePaths.events)
    .where(keys.notificationSettings, '!=', 'none')
    .get();

  // Before the per-event reads below: in most runs, nothing is due for an event.
  const due = querySnapshot.docs.flatMap((doc) => {
    const ev = fillEventScheduleWithCheck(doc.data());

    const ns = ev.notificationSettings;

    const answerDeadline = ev.answerDeadline;

    if (answerDeadline === 'none' || ns === 'none') {
      return [];
    }

    const days = remindersDue({
      enabled: (
        [
          [ns.notify00daysBeforeAnswerDeadline, 0],
          [ns.notify01daysBeforeAnswerDeadline, 1],
          [ns.notify03daysBeforeAnswerDeadline, 3],
          [ns.notify07daysBeforeAnswerDeadline, 7],
          [ns.notify14daysBeforeAnswerDeadline, 14],
          [ns.notify28daysBeforeAnswerDeadline, 28],
        ] as const
      )
        .filter(([flag]) => flag)
        .map(([, d]) => d),
      answerDeadline,
      timezoneOffsetMinutes: ev.timezoneOffsetMinutes,
      nowMillis,
    });

    return Arr.isEmpty(days) ? [] : [{ eventId: doc.id, ev, days }];
  });

  const emails = await Promise.all(
    due.map(({ eventId }) => getEmail(db, eventId)),
  );

  await Promise.all(
    Arr.zip(due, emails).flatMap(([{ eventId, ev, days }, email]) =>
      email === ''
        ? []
        : days.map((diff) => {
            logger.log(`notify${pad2(diff)}daysBeforeAnswerDeadline`);

            return sendEmail(
              createMailOptions({
                to: email,
                subject:
                  diff === 0
                    ? `イベント「${ev.title}」の回答期限当日になりました。`
                    : `イベント「${ev.title}」の回答期限${diff}日前になりました。`,
                text: createMailBodyForAnswerDeadline({ eventId, diff }),
              }),
            );
          }),
    ),
  );
};

/**
 * Mails the author of each event whose answers closed in the 24 hours up to
 * `nowMillis` and whose `internal/closingMail` does not say that deadline was
 * mailed already. What is recorded is the deadline rather than a flag, so that
 * an event whose deadline is moved is mailed again when the new one passes.
 *
 * Run every 10 minutes. Which run sends a mail does not depend on the time the
 * run has: one that was skipped is made up for by the next, and one delivered
 * twice finds the mark the first left.
 *
 * A failure does not stop the events after it, and the returned promise then
 * rejects, so that the invocation is recorded as failed. The events a run has
 * no time left for (`closingMailSendStartBudgetMillis`) are not failures: they
 * are left unmarked for the next run.
 */
export const notifyAfterAnswerDeadline = async (
  db: Firestore,
  nowMillis: number,
): Promise<void> => {
  const startSendBy = Date.now() + closingMailSendStartBudgetMillis;

  const querySnapshot = await db
    .collection(firestorePaths.events)
    .where(keys.notificationSettings, '!=', 'none')
    .get();

  // Before the per-event reads below: only what the event itself says, so an
  // event out of the 24 hours costs no read of its own.
  const closed = Arr.generate<ClosedEvent>(function* () {
    for (const doc of querySnapshot.docs) {
      const deadlineMillis = closingMailDeadlineOf(
        fillEventScheduleWithCheck(doc.data()),
        nowMillis,
      );

      if (deadlineMillis !== undefined) {
        yield { eventRef: doc.ref, deadlineMillis };
      }
    }
  });

  // `getAll` refuses an empty list.
  if (!Arr.isNonEmpty(closed)) {
    return;
  }

  // One request for every mark. An event stays in `closed` for a day, so most
  // of them are marked in most runs, and a marked one costs this read alone.
  const marks = await db.getAll(
    ...closed.map(({ eventRef }) => closingMailMarkRef(eventRef)),
  );

  const unmarked = Arr.zip(closed, marks)
    .filter(([event, mark]) => !isMarkedFor(mark.data(), event.deadlineMillis))
    .map(([event]) => event);

  const mut_failures: unknown[] = [];

  let mut_attempted = 0;

  // One at a time, and none started once the budget is spent. An instance
  // stopped at its time limit while a mail is marked and not yet sent loses
  // that mail, so a run has to end by itself, however many mails a run that
  // makes up for missed ones finds and however slowly they go; what it does not
  // get to has no mark yet and is the next run's. The price is that the mails
  // of a long list go out over several runs, in the same order each run.
  for (const event of unmarked) {
    // Here as well as in `sendClosingMailOnce`, which stops the loop only when
    // it gets as far as marking: an event with nothing to send, or a failure,
    // would otherwise let the loop go on past the budget.
    if (Date.now() >= startSendBy) {
      break;
    }

    try {
      // eslint-disable-next-line no-await-in-loop -- in sequence on purpose, as said above
      const outcome = await sendClosingMailOnce(db, event.eventRef, {
        nowMillis,
        startSendBy,
      });

      if (outcome === 'outOfTime') {
        break;
      }
    } catch (error) {
      mut_failures.push(error);
    }

    mut_attempted += 1;
  }

  const left = unmarked.length - mut_attempted;

  if (left > 0) {
    logger.warn(
      `Out of time: ${left} of the ${unmarked.length} closing mails are left to the next run.`,
    );
  }

  if (Arr.isNonEmpty(mut_failures)) {
    throw new AggregateError(
      mut_failures,
      `${mut_failures.length} of the ${mut_attempted} closing mails tried failed.`,
    );
  }
};

/**
 * The time limit the function running `notifyAfterAnswerDeadline` is deployed
 * with (`index.mts`), which the budgets below are cut from.
 */
export const closingMailTimeoutSeconds = 120;

/** How long a send may take before it is given up as failed. */
const closingMailSendTimeoutMillis = 30_000;

/** What is kept of the time limit for removing the mark of a failed send. */
const closingMailReleaseMarginMillis = 30_000;

/**
 * How long into a run a send may still be started, and so an event marked:
 * early enough for the send to last its whole timeout and leave the margin.
 */
const closingMailSendStartBudgetMillis =
  closingMailTimeoutSeconds * 1000 -
  closingMailReleaseMarginMillis -
  closingMailSendTimeoutMillis;

/**
 * How far back a run looks for a deadline with no mail yet: runs missed for
 * less than this lose no mail. It also bounds what a run reads, and how far
 * back the mails are repeated when the mark is first deployed, since an event
 * mailed before that has none.
 */
const closingMailLookbackMillis = 24 * 60 * 60 * 1000;

type ClosedEvent = Readonly<{
  eventRef: DocumentReference;
  deadlineMillis: number;
}>;

/**
 * The deadline, as an instant, whose closing mail the event is due at
 * `nowMillis` unless its mark says it was sent; `undefined` when none is.
 *
 * "Asks for the mail, and closed within the last day" is the whole condition,
 * on purpose: an author who moves a deadline that has passed to another time
 * that has passed, or asks for this mail after the deadline, is mailed for it
 * by the first run that reads the event so. Both are answers that have just
 * closed as far as the event says, and telling them apart from a deadline that
 * passed unseen would need the history of the event.
 */
const closingMailDeadlineOf = (
  ev: EventSchedule,
  nowMillis: number,
): number | undefined => {
  const ns = ev.notificationSettings;

  const answerDeadline = ev.answerDeadline;

  return answerDeadline !== 'none' &&
    ns !== 'none' &&
    ns.notifyAfterAnswerDeadline
    ? deadlinePassedWithin(
        answerDeadline,
        ev.timezoneOffsetMinutes,
        closingMailLookbackMillis,
        nowMillis,
      )
    : undefined;
};

const closingMailMarkRef = (eventRef: DocumentReference): DocumentReference =>
  eventRef.collection(firestorePaths.internal).doc(firestorePaths.closingMail);

const isMarkedFor = (
  data: DeepReadonly<DocumentData> | undefined,
  deadlineMillis: number,
): boolean =>
  isClosingMailMark(data) &&
  data[firestorePaths.deadlineMillis] === deadlineMillis;

const isClaim = (
  data: DeepReadonly<DocumentData> | undefined,
  claimId: string,
): boolean =>
  isClosingMailMark(data) && data[firestorePaths.claimId] === claimId;

/**
 * `promise`, rejecting once `millis` have passed without it settling. What it
 * was waiting for is not stopped.
 *
 * Around the send rather than as timeouts of the mail transport: nodemailer has
 * them for the connection and for a socket gone quiet, not for a send as a
 * whole, which is what has to fit in the function's time limit; and they would
 * apply to every mail the functions send.
 */
const withTimeout = async <T,>(
  promise: Promise<T>,
  millis: number,
): Promise<T> => {
  let mut_timer: ReturnType<typeof setTimeout> | undefined = undefined;

  const timeout = new Promise<never>((_resolve, reject) => {
    mut_timer = setTimeout(() => {
      reject(new Error(`Timed out after ${millis} ms.`));
    }, millis);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(mut_timer);
  }
};

/**
 * Removes the mark of the attempt `claimId`, if there is one. Never rejects: a
 * failure is logged, and the mark stays.
 */
const removeClaim = async (
  db: Firestore,
  markRef: DocumentReference,
  claimId: string,
  eventId: string,
): Promise<void> => {
  await db
    .runTransaction(async (tx) => {
      const mark = await tx.get(markRef);

      // Only this attempt's own mark, and removed rather than set back to what
      // it replaced: a mark left by an earlier deadline may itself have been
      // taken back since, and putting it back would say a mail went out that
      // did not.
      if (isClaim(mark.data(), claimId)) {
        tx.delete(markRef);
      }
    })
    .catch((releaseError: unknown) => {
      // A mark that was written stays, and so this deadline's mail is not sent
      // again.
      logger.error(
        `The mark of the closing mail of the event ${eventId}, if one was written, could not be removed.`,
        releaseError,
      );
    });
};

/**
 * Sends the closing mail an event is due at `nowMillis`, unless its mark says
 * that deadline's was sent.
 *
 * The mark is written before the mail is sent, in a transaction that reads it
 * first, so of two runs at once only one sends. When the send then fails or
 * takes longer than `closingMailSendTimeoutMillis`, the mark is removed and the
 * next run sends. That leaves two ways to be wrong, both chosen over the
 * alternative of marking after the send, which repeats the mail whenever two
 * runs overlap:
 *
 * - a function instance that dies between the mark and the send loses the mail;
 * - a send that fails or is given up after the mail went out, or goes out
 *   later, repeats it.
 *
 * Resolves to `'outOfTime'`, sending nothing, when `startSendBy` has passed by
 * the time the mark would be written, which is then not written, or by the end
 * of its commit, when it is removed as after a failed send.
 */
const sendClosingMailOnce = async (
  db: Firestore,
  eventRef: DocumentReference,
  {
    nowMillis,
    startSendBy,
  }: Readonly<{ nowMillis: number; startSendBy: number }>,
): Promise<'sent' | 'nothingToSend' | 'outOfTime'> => {
  const eventId = eventRef.id;

  const markRef = closingMailMarkRef(eventRef);

  // What tells this attempt's mark from another run's.
  const claimId = randomUUID();

  try {
    const claim = await db.runTransaction(async (tx) => {
      const [mark, event, values] = await tx.getAll(
        markRef,
        eventRef,
        eventRef.collection(firestorePaths.internal).doc(firestorePaths.values),
      );

      const ev = eventOf(event?.data());

      // From the event as it is now, not as the query saw it: its author may
      // since have moved the deadline or turned this mail off.
      const deadlineMillis =
        ev === undefined ? undefined : closingMailDeadlineOf(ev, nowMillis);

      const to = emailOf(values?.data());

      // The SDK runs this function again when a commit is reported as failed,
      // which one that went through can be: the mark is then this attempt's
      // own, and still to be mailed.
      const own = isClaim(mark?.data(), claimId);

      // Nothing to send, and so nothing to mark: the event is gone or no longer
      // due the mail, another run marked this deadline, or there is no email.
      // An event with no email is mailed by a later run if its author gives one
      // within the 24 hours, at the price of this transaction in every run
      // until then; the page does not normally leave an event so, since it
      // writes the email right after the event whenever notifications are on.
      if (
        to === '' ||
        ev === undefined ||
        deadlineMillis === undefined ||
        (!own && isMarkedFor(mark?.data(), deadlineMillis))
      ) {
        if (own) {
          tx.delete(markRef);
        }

        return 'nothingToSend';
      }

      // A send started is a mail that may go out, so one that could not have
      // its whole timeout is not started. Checked before the mark, so that a
      // slow read leaves none to remove, and again after the commit below. A
      // commit of this delete reported as failed is a failure like that of any
      // other transaction here, not a run out of time.
      if (Date.now() >= startSendBy) {
        if (own) {
          tx.delete(markRef);
        }

        return 'outOfTime';
      }

      tx.set(markRef, {
        [firestorePaths.deadlineMillis]: deadlineMillis,
        [firestorePaths.claimId]: claimId,
      } satisfies ClosingMailMark);

      return { to, title: ev.title } as const;
    });

    if (typeof claim === 'string') {
      return claim;
    }

    if (Date.now() >= startSendBy) {
      await removeClaim(db, markRef, claimId, eventId);

      return 'outOfTime';
    }

    await withTimeout(
      sendEmail(
        createMailOptions({
          to: claim.to,
          subject: `イベント「${claim.title}」の回答を締め切りました。`,
          text: createMailBodyForAnswerResult(eventId),
        }),
      ),
      closingMailSendTimeoutMillis,
    );

    return 'sent';
  } catch (error) {
    // The run rejects with a count alone, so the reason is logged here.
    logger.error(
      `The closing mail of the event ${eventId} was not sent.`,
      error,
    );

    // Also when it was the transaction that failed: its commit may have gone
    // through all the same.
    //
    // Whatever the failure, so that the next run tries again: a refusal that
    // will never succeed, such as an address no server accepts, is not told
    // apart from an outage of the mail account, and is tried and logged by
    // every run of the 24 hours. Retrying through an outage is what the mark is
    // for, and the page checks the address before it stores it.
    await removeClaim(db, markRef, claimId, eventId);

    throw error;
  }
};
