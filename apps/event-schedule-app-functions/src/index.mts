import { firestorePaths } from 'event-schedule-app-shared';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { https, logger, region } from 'firebase-functions/v1';
import { DateUtils } from 'ts-fortress-types';
import { runtimeConfig } from './env.mjs';
import { fetchEventListOfUserImpl } from './fetch-event-list-of-user.mjs';
import {
  closingMailTimeoutSeconds,
  notifyAfterAnswerDeadline,
  notifyAnswerDeadline,
} from './notify-answer-deadline.mjs';
import { notifyOnAnswerChangeBody } from './notify-on-answer-change.mjs';
import { onUserDelete } from './on-user-delete.mjs';
import { createMailBudget } from './send-report-budget.mjs';
import { handleSendReport, sendReportImpl } from './send-report-impl.mjs';
import {
  fillAnswerWithCheck,
  isFetchEventListOfUserPayload,
  isVerifyEmailPayload,
  toStringWithCheck,
} from './types/index.mjs';
import { verifyEmailImpl } from './verify-email.mjs';

initializeApp();

const regionName = 'asia-northeast2';

const regionSelected = region(regionName);

/** For the functions that send mail, which is what reads `runtimeConfig`. */
const regionSelectedWithConfig = regionSelected.runWith({
  secrets: [runtimeConfig],
});

const db = getFirestore();

/**
 * When the event a function was called for happened — the write, or the
 * scheduled tick — rather than when the function got to run, which a cold start
 * or a retry delays. `context.timestamp` is an ISO 8601 string in UTC.
 */
const eventTimeMillis = (timestamp: string): number =>
  DateUtils.toTimestamp(DateUtils.from(timestamp));

const wildcard = {
  eventId: 'eventId',
  answerId: 'answerId',
} as const;

const answerDocPath =
  `${firestorePaths.events}/{${wildcard.eventId}}/${firestorePaths.answers}/{${wildcard.answerId}}` as const;

export const answerCreationListener = regionSelectedWithConfig.firestore
  .document(answerDocPath)
  .onCreate((snapshot, context) =>
    notifyOnAnswerChangeBody(db, {
      eventType: 'create',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      writtenAt: eventTimeMillis(context.timestamp),
      answerItemBefore: undefined,
      answerItemAfter: fillAnswerWithCheck(snapshot.data()),
    }),
  );

export const answerDeletionListener = regionSelectedWithConfig.firestore
  .document(answerDocPath)
  .onDelete((snapshot, context) =>
    notifyOnAnswerChangeBody(db, {
      eventType: 'delete',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      writtenAt: eventTimeMillis(context.timestamp),
      answerItemBefore: fillAnswerWithCheck(snapshot.data()),
      answerItemAfter: undefined,
    }),
  );

export const answerUpdateListener = regionSelectedWithConfig.firestore
  .document(answerDocPath)
  .onUpdate((change, context) =>
    notifyOnAnswerChangeBody(db, {
      eventType: 'update',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      writtenAt: eventTimeMillis(context.timestamp),
      answerItemBefore: fillAnswerWithCheck(change.before.data()),
      answerItemAfter: fillAnswerWithCheck(change.after.data()),
    }),
  );

/**
 * The zone the schedules below are read in, which decides only when they run:
 * each event is judged in its own zone. Given, because a schedule without one
 * is read in `America/Los_Angeles`, whose daylight-saving changes skip or
 * repeat a run.
 */
const scheduleTimeZone = 'Etc/UTC';

/**
 * Every hour, so that each event is reminded at noon in its own zone, or before
 * a deadline that is not after noon (`remindersDue`). The name is kept from
 * when this ran once a day at noon in
 * Tokyo: a deployed function renamed is a function deleted.
 */
export const notifyAnswerDeadlineEveryday = regionSelectedWithConfig.pubsub
  .schedule('0 * * * *')
  .timeZone(scheduleTimeZone)
  .onRun((context) =>
    notifyAnswerDeadline(db, eventTimeMillis(context.timestamp)),
  );

/**
 * Every 10 minutes, which is how late the "answers closed" mail normally is,
 * not which deadlines a run looks at: a run takes every deadline of the last
 * day that has no mail yet (`notifyAfterAnswerDeadline`), so one that is
 * skipped is made up for by the next.
 *
 * The time limit is given because the run budgets its work against it, and on a
 * builder of this function's own, so that it is this function's alone.
 */
export const notifyAfterAnswerDeadlineEveryMinutes = region(regionName)
  .runWith({
    secrets: [runtimeConfig],
    timeoutSeconds: closingMailTimeoutSeconds,
  })
  .pubsub.schedule('*/10 * * * *')
  .timeZone(scheduleTimeZone)
  .onRun((context) =>
    notifyAfterAnswerDeadline(db, eventTimeMillis(context.timestamp)),
  );

// export const answerPagePreRender = functions
//   .region('asia-northeast2')
//   .https.onRequest((_req, res) => {
//     res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
//     fs.readFile('./index.html', 'utf8', (_e, html) => {
//       const responseHtml = html.replace(
//         'イベント日程調整',
//         'イベント日程調整 回答ページ'
//       );
//       res.status(200).send(responseHtml);
//     });
//   });

// export const testOnRequest = functions.https.onRequest((_req, res) => {
//   res.json({
//     result: `onRequest test`,
//   });
// });

export const userDeletionListener = regionSelected.auth
  .user()
  .onDelete((user) =>
    // Logged, and rethrown so that a cleanup that failed is not recorded as
    // done.
    onUserDelete(db, user).catch((error: unknown) => {
      logger.error(error);

      throw error;
    }),
  );

// https://firebase.google.com/docs/functions/manage-functions?hl=ja
export const fetchEventListOfUser = regionSelected
  .runWith({
    memory: '1GB',
  })
  .https.onCall((payload: unknown, context) => {
    if (!isFetchEventListOfUserPayload(payload)) {
      throw new https.HttpsError(
        'invalid-argument',
        'The payload type is invalid.',
      );
    }

    return fetchEventListOfUserImpl(db, payload, context.auth?.uid);
  });

export const verifyEmail = regionSelected.https.onCall(
  (payload: unknown, _context) => {
    if (!isVerifyEmailPayload(payload)) {
      throw new https.HttpsError(
        'invalid-argument',
        'The payload type is invalid.',
      );
    }

    return verifyEmailImpl(db, payload);
  },
);

/**
 * Error reports are mailed from the same account as the notifications, so they
 * get a budget of their own; a report over it goes to the function's log
 * instead, and the client is told it was not mailed. The budget is per
 * instance, hence `maxInstances: 1`, which also means a report arriving while
 * another is being mailed may be refused.
 */
const sendReportMailBudget = createMailBudget({
  limit: 10,
  windowMilliseconds: 60 ** 2 * 1000,
});

export const sendReport = regionSelected
  .runWith({
    secrets: [runtimeConfig],
    maxInstances: 1,
  })
  .https.onCall((payload: unknown, _context) =>
    handleSendReport(payload, {
      withinBudget: () => sendReportMailBudget(Date.now()),
      send: sendReportImpl,
    }),
  );
