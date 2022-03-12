import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { initializeApp } from 'firebase-admin';
import { firestore, pubsub } from 'firebase-functions';
import { notifyAnswerDeadline } from './notify-answer-deadline';
import { notifyOnAnswerChangeBody } from './notify-on-answer-change';
import { fillAnswerWithCheck, toStringWithCheck } from './type-check';

initializeApp();

const wildcard = {
  eventId: 'eventId',
  answerId: 'answerId',
} as const;

const answerDocPath = `${firestorePaths.events}/{${wildcard.eventId}}/${firestorePaths.answers}/{${wildcard.answerId}}`;

export const answerCreationListener = firestore
  .document(answerDocPath)
  .onCreate((snapshot, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'create',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      answerItemBefore: undefined,
      answerItemAfter: fillAnswerWithCheck(snapshot.data()),
    })
  );

export const answerDeletionListener = firestore
  .document(answerDocPath)
  .onDelete((snapshot, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'delete',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      answerItemBefore: fillAnswerWithCheck(snapshot.data()),
      answerItemAfter: undefined,
    })
  );

export const answerUpdateListener = firestore
  .document(answerDocPath)
  .onUpdate((change, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'update',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      answerItemBefore: fillAnswerWithCheck(change.before.data()),
      answerItemAfter: fillAnswerWithCheck(change.after.data()),
    })
  );

export const notifyAnswerDeadlineEveryday = pubsub
  .schedule('00 12 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(notifyAnswerDeadline);

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
