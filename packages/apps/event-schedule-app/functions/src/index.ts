// initializeApp must be imported as default import.
// https://github.com/firebase/firebase-admin-node/issues/593
import { IRecord, isBoolean, isRecord, isString } from '@noshiro/ts-utils';
import admin from 'firebase-admin';
import { https, region } from 'firebase-functions';
import { fetchEventListOfUserImpl } from './fetch-event-list-of-user';
import { fetchEventOfIdImpl } from './fetch-event-schedule';
import { collectionPath } from './firestore-paths';
import { notifyAnswerDeadline } from './notify-answer-deadline';
import { notifyOnAnswerChangeBody } from './notify-on-answer-change';
import { onUserDelete } from './on-user-delete';
import { fillAnswerWithCheck, toStringWithCheck } from './type-check';

admin.initializeApp();

const regionSelected = region('asia-northeast2');

const db = admin.firestore();

const wildcard = {
  eventId: 'eventId',
  answerId: 'answerId',
} as const;

const answerDocPath = `${collectionPath.events}/{${wildcard.eventId}}/${collectionPath.answers}/{${wildcard.answerId}}`;

export const answerCreationListener = regionSelected.firestore
  .document(answerDocPath)
  .onCreate((snapshot, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'create',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      answerItemBefore: undefined,
      answerItemAfter: fillAnswerWithCheck(snapshot.data()),
    })
  );

export const answerDeletionListener = regionSelected.firestore
  .document(answerDocPath)
  .onDelete((snapshot, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'delete',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      answerItemBefore: fillAnswerWithCheck(snapshot.data()),
      answerItemAfter: undefined,
    })
  );

export const answerUpdateListener = regionSelected.firestore
  .document(answerDocPath)
  .onUpdate((change, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'update',
      eventId: toStringWithCheck(context.params[wildcard.eventId]),
      answerItemBefore: fillAnswerWithCheck(change.before.data()),
      answerItemAfter: fillAnswerWithCheck(change.after.data()),
    })
  );

export const notifyAnswerDeadlineEveryday = regionSelected.pubsub
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

export const userDeletionListener = regionSelected.auth
  .user()
  .onDelete((user) => {
    onUserDelete(db, user).catch(console.error);
  });

export const fetchEventListOfUser = region('asia-northeast2').https.onCall(
  (payload: unknown, context) => {
    if (
      !(
        isRecord(payload) &&
        IRecord.hasKeyValue(payload, 'filterText', isString) &&
        IRecord.hasKeyValue(
          payload,
          'filterOptionState',
          (v: unknown): v is 'archive' | 'inProgress' =>
            v === 'archive' || v === 'inProgress'
        ) &&
        IRecord.hasKeyValue(payload, 'showAllPastDaysEvent', isBoolean) &&
        IRecord.hasKeyValue(
          payload,
          'showOnlyEventSchedulesICreated',
          isBoolean
        )
      )
    ) {
      throw new https.HttpsError(
        'invalid-argument',
        'The payload type is invalid.'
      );
    }

    return fetchEventListOfUserImpl(db, payload, context);
  }
);

export const fetchEventOfId = region('asia-northeast2').https.onCall(
  (payload: unknown, _context) => {
    if (!(isRecord(payload) && IRecord.hasKeyValue(payload, 'id', isString))) {
      throw new https.HttpsError(
        'invalid-argument',
        'The payload type is invalid.'
      );
    }

    return fetchEventOfIdImpl(db, payload.id);
  }
);
