import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { firestorePaths } from './constants/firestore-paths';
import { notifyAnswerDeadline } from './notify-answer-deadline';
import { notifyOnAnswerChangeBody } from './notify-on-answer-change';
import { AnswerJsType } from './types/record/answer';

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
      answerItemAfter: snapshot.data() as AnswerJsType,
    })
  );

export const answerDeletionListener = functions.firestore
  .document(answerDocPath)
  .onDelete((snapshot, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'delete',
      eventId: context.params[wildcard.eventId] as string,
      answerItemBefore: snapshot.data() as AnswerJsType,
      answerItemAfter: undefined,
    })
  );

export const answerUpdateListener = functions.firestore
  .document(answerDocPath)
  .onUpdate((change, context) =>
    notifyOnAnswerChangeBody({
      eventType: 'update',
      eventId: context.params[wildcard.eventId] as string,
      answerItemBefore: change.before.data() as AnswerJsType,
      answerItemAfter: change.after.data() as AnswerJsType,
    })
  );

export const notifyAnswerDeadlineEveryday = functions.pubsub
  .schedule('00 12 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(notifyAnswerDeadline);
