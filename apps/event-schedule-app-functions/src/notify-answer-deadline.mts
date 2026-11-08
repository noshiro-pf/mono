import { firestorePaths, type EventSchedule } from 'event-schedule-app-shared';
import type { Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v1';
import { Arr, tp } from 'ts-data-forge';
import type { MinutesEnum, ReadonlyRecord } from 'ts-type-forge';
import {
  createMailBodyForAnswerDeadline,
  createMailBodyForAnswerResult,
  deadlinePassed,
  remindersDue,
} from './functions/index.mjs';
import { getEmail } from './get-event-item.mjs';
import { createMailOptions, sendEmail } from './setup-mailer.mjs';
import { fillEventScheduleWithCheck } from './types/index.mjs';
import { pad2 } from './utils/index.mjs';

const keys = {
  notificationSettings: 'notificationSettings',
} as const satisfies ReadonlyRecord<string, keyof EventSchedule>;

/**
 * Mails the reminders due at `nowMillis` (`remindersDue`): run every hour, it
 * reminds each event at noon in its own zone, the day-of reminder earlier when
 * the deadline is not after noon.
 */
export const notifyAnswerDeadline = async (
  db: Firestore,
  nowMillis: number,
): Promise<void> => {
  const querySnapshot = await db
    .collection(firestorePaths.events)
    .where(keys.notificationSettings, '!=', 'none')
    .get();

  // Before the per-event reads below: in most runs, nothing is due for an event.
  const due = querySnapshot.docs.flatMap((doc) => {
    const ev = fillEventScheduleWithCheck(doc.data());

    const ns = ev.notificationSettings;

    const answerDeadline = ev.answerDeadline;

    if (answerDeadline === 'none' || ns === 'none') {
      return [];
    }

    const days = remindersDue({
      enabled: (
        [
          [ns.notify00daysBeforeAnswerDeadline, 0],
          [ns.notify01daysBeforeAnswerDeadline, 1],
          [ns.notify03daysBeforeAnswerDeadline, 3],
          [ns.notify07daysBeforeAnswerDeadline, 7],
          [ns.notify14daysBeforeAnswerDeadline, 14],
          [ns.notify28daysBeforeAnswerDeadline, 28],
        ] as const
      )
        .filter(([flag]) => flag)
        .map(([, d]) => d),
      answerDeadline,
      timezoneOffsetMinutes: ev.timezoneOffsetMinutes,
      nowMillis,
    });

    return Arr.isEmpty(days) ? [] : [{ eventId: doc.id, ev, days }];
  });

  const emails = await Promise.all(
    due.map(({ eventId }) => getEmail(db, eventId)),
  );

  await Promise.all(
    Arr.zip(due, emails).flatMap(([{ eventId, ev, days }, email]) =>
      email === ''
        ? []
        : days.map((diff) => {
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
          }),
    ),
  );
};

export const notifyAfterAnswerDeadline = async (
  db: Firestore,
  minutes: MinutesEnum,
  nowMillis: number,
): Promise<void> => {
  const querySnapshot = await db
    .collection(firestorePaths.events)
    .where(keys.notificationSettings, '!=', 'none')
    .get();

  const events = querySnapshot.docs
    .map((doc) => tp(doc.id, fillEventScheduleWithCheck(doc.data())))
    .filter(
      ([_id, ev]) =>
        ev.answerDeadline !== 'none' &&
        // Before the per-event reads below: few deadlines fall in a run's window.
        deadlinePassed(
          ev.answerDeadline,
          ev.timezoneOffsetMinutes,
          minutes,
          nowMillis,
        ),
    );

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
        ns.notifyAfterAnswerDeadline
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
