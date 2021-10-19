/* eslint-disable import/no-internal-modules */

import type {
  Answer as AnswerCurr,
  EventSchedule as EventScheduleCurr,
} from '@noshiro/event-schedule-app-shared/cjs/v2';
import { firestorePaths as firestorePathsCurr } from '@noshiro/event-schedule-app-shared/cjs/v2';
import type {
  Answer as AnswerNext,
  EventSchedule as EventScheduleNext,
} from '@noshiro/event-schedule-app-shared/cjs/v3';
import {
  fillAnswer,
  fillEventSchedule,
  firestorePaths as firestorePathsNext,
} from '@noshiro/event-schedule-app-shared/cjs/v3';
import { ituple, recordFromEntries } from '@noshiro/ts-utils';
import * as admin from 'firebase-admin';
import serviceAccount from './service-account-key.json';

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: 'https://event-schedule-app.firebaseio.com',
});

const db = app.firestore();
const collectionNameCurr = firestorePathsCurr.events;
const collectionNameNext = firestorePathsNext.events;
const subCollectionName = firestorePathsNext.answers;

const convertEventSchedule = ({
  answerSymbolList,
  customizeSymbolSettings: _,
  ...curr
}: EventScheduleCurr): EventScheduleNext =>
  fillEventSchedule({
    ...curr,
    answerSymbols: recordFromEntries(
      answerSymbolList.map(({ point, description, iconId }) =>
        ituple(
          iconId === 'handmade-circle'
            ? 'good'
            : iconId === 'handmade-triangle'
            ? 'fair'
            : 'poor',
          {
            description,
            point,
          }
        )
      )
    ),
  });

const convertAnswer = (curr: AnswerCurr): AnswerNext =>
  fillAnswer({
    ...curr,
    selection: curr.selection.map(({ iconId, datetimeRange }) => ({
      datetimeRange,
      iconId:
        iconId === 'handmade-triangle'
          ? 'fair'
          : iconId === 'handmade-circle'
          ? 'good'
          : iconId === 'handmade-cross'
          ? 'poor'
          : 'none',
      point:
        iconId === 'handmade-triangle'
          ? 6
          : iconId === 'handmade-circle'
          ? 10
          : iconId === 'handmade-cross'
          ? 0
          : 0,
    })),
  });

const updateStore = async (): Promise<boolean> => {
  const eventsSnapshotCurr = await db.collection(collectionNameCurr).get();
  const writeBatch = db.batch();

  for (const doc of eventsSnapshotCurr.docs) {
    // read
    const id = doc.id;

    // eslint-disable-next-line no-await-in-loop
    const answersSnapshotCurr = await db
      .collection(`${collectionNameCurr}/${id}/${subCollectionName}`)
      .get();

    // write
    const documentRef = db.doc(`${collectionNameNext}/${id}`);
    writeBatch.set(
      documentRef,
      convertEventSchedule(doc.data() as EventScheduleCurr)
    );

    for (const ans of answersSnapshotCurr.docs) {
      const documentRefForAnswers = db.doc(
        `${collectionNameNext}/${id}/${subCollectionName}/${ans.id}`
      );
      writeBatch.set(
        documentRefForAnswers,
        convertAnswer(ans.data() as AnswerCurr)
      );
    }
  }

  await writeBatch.commit().catch();

  console.log('Successfully executed batch.');

  return true;
};

const main = (): Promise<readonly boolean[]> => Promise.all([updateStore()]);

main().catch(console.error);
