import type { EventSchedule } from '@noshiro/event-schedule-app-shared';
import { assertType, tp } from '@noshiro/ts-utils';
import { firestore } from 'firebase-admin';
import { logger } from 'firebase-functions';
import { createMailBodyForAnswerDeadline } from './create-mail-body';
import { collectionPath } from './firestore-paths';
import { createMailOptions, sendEmail } from './setup-mailer';
import { todayIsNDaysBeforeDeadline } from './today-is-n-day-before-deadline';
import { fillEventScheduleWithCheck } from './type-check';
import { pad2 } from './utils';

const keys = {
  notificationSettings: 'notificationSettings',
  answerDeadline: 'answerDeadline',
} as const;

assertType<TypeExtends<ValueOf<typeof keys>, keyof EventSchedule>>();

export const notifyAnswerDeadline = async (): Promise<void> => {
  const querySnapshot = await firestore()
    .collection(collectionPath.events)
    .where(keys.notificationSettings, '!=', 'none')
    .where(keys.answerDeadline, '!=', 'none')
    .get();

  const events = querySnapshot.docs.map((doc) =>
    tp(doc.id, fillEventScheduleWithCheck(doc.data()))
  );

  await Promise.all(
    events.flatMap(([eventId, ev]) => {
      const ns = ev.notificationSettings;
      const answerDeadline = ev.answerDeadline;

      if (answerDeadline === 'none' || ns === 'none') {
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
            flag && todayIsNDaysBeforeDeadline(diff, answerDeadline)
        )
        .map(([_, diff]) => {
          logger.log(`notify${pad2(diff)}daysBeforeAnswerDeadline`);
          return sendEmail(
            createMailOptions({
              to: ns.email,
              subject: `イベント「${ev.title}」の回答期限${diff}日前になりました。`,
              text: createMailBodyForAnswerDeadline({ eventId, diff }),
            })
          );
        });
    })
  );
};
