import { firestorePaths } from 'event-schedule-app-shared';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { https, logger, region } from 'firebase-functions/v1';
import { type MinutesEnum } from 'ts-type-forge';
import { runtimeConfig } from './env.mjs';
import { fetchEventListOfUserImpl } from './fetch-event-list-of-user.mjs';
import {
  notifyAfterAnswerDeadline,
  notifyAnswerDeadline,
} from './notify-answer-deadline.mjs';
import { notifyOnAnswerChangeBody } from './notify-on-answer-change.mjs';
import { onUserDelete } from './on-user-delete.mjs';
import { sendReportImpl } from './send-report-impl.mjs';
import {
  fillAnswerWithCheck,
  isFetchEventListOfUserPayload,
  isSendReportPayload,
  isVerifyEmailPayload,
  toStringWithCheck,
} from './types/index.mjs';
import { verifyEmailImpl } from './verify-email.mjs';

initializeApp();

const regionSelected = region('asia-northeast2');

/** For the functions that send mail, which is what reads `runtimeConfig`. */
const regionSelectedWithConfig = regionSelected.runWith({
  secrets: [runtimeConfig],
});

const db = getFirestore();

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
      answerItemBefore: fillAnswerWithCheck(change.before.data()),
      answerItemAfter: fillAnswerWithCheck(change.after.data()),
    }),
  );

export const notifyAnswerDeadlineEveryday = regionSelectedWithConfig.pubsub
  .schedule('00 12 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(() => notifyAnswerDeadline(db));

const minutes: MinutesEnum = 10;

export const notifyAfterAnswerDeadlineEveryMinutes =
  regionSelectedWithConfig.pubsub
    .schedule(`*/${minutes} * * * *`)
    .timeZone('Asia/Tokyo')
    .onRun(() => notifyAfterAnswerDeadline(db, minutes));

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
  .onDelete((user) => {
    onUserDelete(db, user).catch(console.error);
  });

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

export const sendReport = regionSelectedWithConfig.https.onCall(
  (payload: unknown, _context) => {
    if (!isSendReportPayload(payload)) {
      throw new https.HttpsError(
        'invalid-argument',
        'The payload type is invalid.',
      );
    }

    sendReportImpl(payload).catch(logger.error);
  },
);
