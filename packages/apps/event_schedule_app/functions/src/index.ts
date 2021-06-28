import type { Answer } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { notifyAnswerDeadline } from './notify-answer-deadline';
import { notifyOnAnswerChangeBody } from './notify-on-answer-change';

admin.initializeApp();

const wildcard = {
  eventId: 'eventId',
  answerId: 'answerId',
} as const;

const answerDocPath = `${firestorePaths.events}/{${wildcard.eventId}}/${firestorePaths.answers}/{${wildcard.answerId}}`;

export const answerCreationListener = functions.firestore
  .document(answerDocPath)
  .onCreate((snapshot, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'create',
      eventId: context.params[wildcard.eventId] as string,
      answerItemBefore: undefined,
      answerItemAfter: snapshot.data() as Answer,
    })
  );

export const answerDeletionListener = functions.firestore
  .document(answerDocPath)
  .onDelete((snapshot, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'delete',
      eventId: context.params[wildcard.eventId] as string,
      answerItemBefore: snapshot.data() as Answer,
      answerItemAfter: undefined,
    })
  );

export const answerUpdateListener = functions.firestore
  .document(answerDocPath)
  .onUpdate((change, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'update',
      eventId: context.params[wildcard.eventId] as string,
      answerItemBefore: change.before.data() as Answer,
      answerItemAfter: change.after.data() as Answer,
    })
  );

export const notifyAnswerDeadlineEveryday = functions.pubsub
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
