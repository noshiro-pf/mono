import { firestorePaths, type EventSchedule } from 'event-schedule-app-shared';
import { type Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import { Arr, tp } from 'ts-data-forge';
import { type MinutesEnum, type ReadonlyRecord } from 'ts-type-forge';
import {
  createMailBodyForAnswerDeadline,
  createMailBodyForAnswerResult,
  deadlinePassed,
  todayIsNDaysBeforeDeadline,
} from './functions/index.mjs';
import { getEmail } from './get-event-item.mjs';
import { createMailOptions, sendEmail } from './setup-mailer.mjs';
import { fillEventScheduleWithCheck } from './types/index.mjs';
import { pad2 } from './utils/index.mjs';

const keys = {
  notificationSettings: 'notificationSettings',
} as const satisfies ReadonlyRecord<string, keyof EventSchedule>;

export const notifyAnswerDeadline = async (db: Firestore): Promise<void> => {
  const querySnapshot = await db
    .collection(firestorePaths.events)
    .where(keys.notificationSettings, '!=', 'none')
    .get();

  const events = querySnapshot.docs
    .map((doc) => tp(doc.id, fillEventScheduleWithCheck(doc.data())))
    .filter(([_id, ev]) => ev.answerDeadline !== 'none');

  const emails = await Promise.all(
    events.map(([eventId]) => getEmail(db, eventId)),
  );

  const eventsWithEmail = Arr.zip(events, emails);

  await Promise.all(
    eventsWithEmail.flatMap(([[eventId, ev], email]) => {
      const ns = ev.notificationSettings;

      const answerDeadline = ev.answerDeadline;

      if (answerDeadline === 'none' || ns === 'none' || email === '') {
        return Promise.resolve();
      }

      return (
        [
          [ns.notify00daysBeforeAnswerDeadline, 0],
          [ns.notify01daysBeforeAnswerDeadline, 1],
          [ns.notify03daysBeforeAnswerDeadline, 3],
          [ns.notify07daysBeforeAnswerDeadline, 7],
          [ns.notify14daysBeforeAnswerDeadline, 14],
          [ns.notify28daysBeforeAnswerDeadline, 28],
        ] as const
      )
        .filter(
          ([flag, diff]) =>
            flag && todayIsNDaysBeforeDeadline(diff, answerDeadline),
        )
        .map(([_, diff]) => {
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
        });
    }),
  );
};

export const notifyAfterAnswerDeadline = async (
  db: Firestore,
  minutes: MinutesEnum,
): Promise<void> => {
  const querySnapshot = await db
    .collection(firestorePaths.events)
    .where(keys.notificationSettings, '!=', 'none')
    .get();

  const events = querySnapshot.docs
    .map((doc) => tp(doc.id, fillEventScheduleWithCheck(doc.data())))
    .filter(([_id, ev]) => ev.answerDeadline !== 'none');

  const emails = await Promise.all(
    events.map(([eventId]) => getEmail(db, eventId)),
  );

  const eventsWithEmail = Arr.zip(events, emails);

  await Promise.all(
    eventsWithEmail.map(([[eventId, ev], email]) => {
      const ns = ev.notificationSettings;

      const answerDeadline = ev.answerDeadline;

      if (
        answerDeadline !== 'none' &&
        ns !== 'none' &&
        email !== '' &&
        ns.notifyAfterAnswerDeadline &&
        deadlinePassed(answerDeadline, minutes)
      ) {
        return sendEmail(
          createMailOptions({
            to: email,
            subject: `イベント「${ev.title}」の回答を締め切りました。`,
            text: createMailBodyForAnswerResult(eventId),
          }),
        );
      }

      return Promise.resolve();
    }),
  );
};
