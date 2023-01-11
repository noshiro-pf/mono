import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { firestorePaths } from '@noshiro/event-schedule-app-shared';
import { Arr, assertType, tp } from '@noshiro/ts-utils';
import type { firestore } from 'firebase-admin';
import { logger } from 'firebase-functions';
import {
  createMailBodyForAnswerDeadline,
  todayIsNDaysBeforeDeadline,
} from './functions';
import { getEmail } from './get-event-item';
import { createMailOptions, sendEmail } from './setup-mailer';
import { fillEventScheduleWithCheck } from './types';
import { pad2 } from './utils';

const keys = {
  notificationSettings: 'notificationSettings',
  answerDeadline: 'answerDeadline',
} as const;

assertType<TypeExtends<ValueOf<typeof keys>, keyof EventSchedule>>();

export const notifyAnswerDeadline = async (
  db: firestore.Firestore
): Promise<void> => {
  const querySnapshot = await db
    .collection(firestorePaths.events)
    .where(keys.notificationSettings, '!=', 'none')
    .get();

  const events = querySnapshot.docs
    .map((doc) => tp(doc.id, fillEventScheduleWithCheck(doc.data())))
    .filter(([_id, ev]) => ev.answerDeadline !== 'none');

  const emails = await Promise.all(
    events.map(([eventId]) => getEmail(db, eventId))
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
          [ns.notify01daysBeforeAnswerDeadline, 1],
          [ns.notify03daysBeforeAnswerDeadline, 3],
          [ns.notify07daysBeforeAnswerDeadline, 7],
          [ns.notify14daysBeforeAnswerDeadline, 14],
          [ns.notify28daysBeforeAnswerDeadline, 28],
        ] as const
      )
        .filter(
          ([flag, diff]) =>
            flag &&
            todayIsNDaysBeforeDeadline(diff, answerDeadline) &&
            email !== ''
        )
        .map(([_, diff]) => {
          logger.log(`notify${pad2(diff)}daysBeforeAnswerDeadline`);
          return sendEmail(
            createMailOptions({
              to: email,
              subject: `イベント「${ev.title}」の回答期限${diff}日前になりました。`,
              text: createMailBodyForAnswerDeadline({ eventId, diff }),
            })
          );
        });
    })
  );
};
