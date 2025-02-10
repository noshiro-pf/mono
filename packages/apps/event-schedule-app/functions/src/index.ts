// initializeApp must be imported as default import.
// https://github.com/firebase/firebase-admin-node/issues/593
import {
  type EventListItem,
  firestorePaths,
} from '@noshiro/event-schedule-app-shared';
import admin from 'firebase-admin';
import { auth } from 'firebase-functions/v1';
import { https, logger, setGlobalOptions } from 'firebase-functions/v2';
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { fetchEventListOfUserImpl } from './fetch-event-list-of-user.js';
import {
  notifyAfterAnswerDeadline,
  notifyAnswerDeadline,
} from './notify-answer-deadline.js';
import { notifyOnAnswerChangeBody } from './notify-on-answer-change.js';
import { onUserDelete } from './on-user-delete.js';
import { sendReportImpl } from './send-report-impl.js';
import {
  fillAnswerWithCheck,
  isFetchEventListOfUserPayload,
  isSendReportPayload,
  isVerifyEmailPayload,
  toStringWithCheck,
} from './types/index.js';
import { verifyEmailImpl } from './verify-email.js';

admin.initializeApp();

setGlobalOptions({ region: 'asia-northeast2' });

const db = admin.firestore();

const wildcard = {
  eventId: 'eventId',
  answerId: 'answerId',
} as const;

const answerDocPath = `${firestorePaths.events}/{${wildcard.eventId}}/${firestorePaths.answers}/{${wildcard.answerId}}`;

export const answerCreationListener = onDocumentCreated(
  answerDocPath,
  (event) =>
    notifyOnAnswerChangeBody(db, {
      eventType: 'create',
      eventId: toStringWithCheck(event.params[wildcard.eventId]),
      answerItemBefore: undefined,
      answerItemAfter: fillAnswerWithCheck(event.data?.data()),
    }),
);

export const answerDeletionListener = onDocumentDeleted(
  answerDocPath,
  (event) =>
    notifyOnAnswerChangeBody(db, {
      eventType: 'delete',
      eventId: toStringWithCheck(event.params[wildcard.eventId]),
      answerItemBefore: fillAnswerWithCheck(event.data?.data()),
      answerItemAfter: undefined,
    }),
);

export const answerUpdateListener = onDocumentUpdated(answerDocPath, (event) =>
  notifyOnAnswerChangeBody(db, {
    eventType: 'update',
    eventId: toStringWithCheck(event.params[wildcard.eventId]),
    answerItemBefore: fillAnswerWithCheck(event.data?.before.data()),
    answerItemAfter: fillAnswerWithCheck(event.data?.after.data()),
  }),
);

export const notifyAnswerDeadlineEveryday = onSchedule(
  {
    schedule: '00 12 * * *',
    timeZone: 'Asia/Tokyo',
  },
  () => notifyAnswerDeadline(db),
);

const minutes: MinutesEnum = 10;

export const notifyAfterAnswerDeadlineEveryMinutes = onSchedule(
  {
    schedule: `*/${minutes} * * * *`,
    timeZone: 'Asia/Tokyo',
  },
  () => notifyAfterAnswerDeadline(db, minutes),
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

export const userDeletionListener = auth.user().onDelete((user) => {
  onUserDelete(db, user).catch(console.error);
});

// https://firebase.google.com/docs/functions/manage-functions?hl=ja
export const fetchEventListOfUser = onCall<
  unknown,
  Promise<readonly EventListItem[]>
>((request) => {
  const uid = request.auth?.uid;
  const data = request.data;

  if (!isFetchEventListOfUserPayload(data)) {
    throw new https.HttpsError(
      'invalid-argument',
      'The payload type is invalid.',
    );
  }

  return fetchEventListOfUserImpl(db, data, uid);
});

// .https.onCall((payload: unknown, context) => {
// });

export const verifyEmail = onCall((request) => {
  if (!isVerifyEmailPayload(request.data)) {
    throw new https.HttpsError(
      'invalid-argument',
      'The payload type is invalid.',
    );
  }

  return verifyEmailImpl(db, request.data);
});

export const sendReport = onCall((request) => {
  if (!isSendReportPayload(request.data)) {
    throw new https.HttpsError(
      'invalid-argument',
      'The payload type is invalid.',
    );
  }

  sendReportImpl(request.data).catch(logger.error);
});
