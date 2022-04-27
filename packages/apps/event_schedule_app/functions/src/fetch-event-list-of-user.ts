import type { EventListItem } from '@noshiro/event-schedule-app-shared';
import {
  compareYmd,
  eventListItemDefaultValue,
  fillAnswer,
  fillEventSchedule,
} from '@noshiro/event-schedule-app-shared';
import { ifThen, IList, IMap, pipe, tp } from '@noshiro/ts-utils';
import type { firestore } from 'firebase-admin';
import { https } from 'firebase-functions';
import type { CallableContext } from 'firebase-functions/v1/https';
import { collectionPath } from './firestore-paths';
import { today } from './utils';

export const fetchEventListOfUserImpl = async (
  db: firestore.Firestore,
  {
    filterText,
    filterOptionState,
    showAllPastDaysEvent,
    showOnlyEventSchedulesICreated,
  }: Readonly<{
    filterText: string;
    filterOptionState: 'archive' | 'inProgress';
    showAllPastDaysEvent: boolean;
    showOnlyEventSchedulesICreated: boolean;
  }>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  context: CallableContext
): Promise<readonly EventListItem[]> => {
  // Checking that the user is authenticated.
  if (context.auth === undefined) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.'
    );
  }

  const uid = context.auth.uid;

  const eventsSnapshot = await db.collection(collectionPath.events).get();

  const answersOfAllEventsList: readonly Readonly<
    Pick<EventListItem, 'answers' | 'answersMetadata'> & {
      eventId: string;
    }
  >[] = await Promise.all(
    eventsSnapshot.docs.map(({ id: eventId }) =>
      db
        .collection(
          `${collectionPath.events}/${eventId}/${collectionPath.answers}`
        )
        .get()
        .then((answersSnapshot) => ({
          eventId,
          answers: answersSnapshot.docs.map((d) => fillAnswer(d.data())),
          answersMetadata: {
            lastUpdate: pipe(answersSnapshot.docs)
              .chain((list) =>
                IList.maxBy(list, (d) => d.updateTime.toMillis())
              )
              .chain((d) => d?.updateTime.toDate().toISOString() ?? '').value,
          },
        }))
    )
  );

  const answersOfEventMap = IMap.new<
    string,
    Pick<EventListItem, 'answers' | 'answersMetadata'>
  >(
    answersOfAllEventsList.map(({ answers, answersMetadata, eventId }) =>
      tp(eventId, { answers, answersMetadata })
    )
  );

  const eventListItems: readonly EventListItem[] = eventsSnapshot.docs.map(
    (d): EventListItem => {
      const ans = answersOfEventMap.get(d.id);
      return {
        eventSchedule: fillEventSchedule(d.data()),
        eventScheduleMetadata: {
          id: d.id,
          createdAt: d.createTime.toDate().toISOString(),
          updatedAt: d.updateTime.toDate().toISOString(),
        },
        answers: ans?.answers ?? [],
        answersMetadata:
          ans?.answersMetadata ?? eventListItemDefaultValue.answersMetadata,
      };
    }
  );

  return eventListItems.filter(({ eventSchedule, answers }) => {
    if (
      !ifThen(showOnlyEventSchedulesICreated, eventSchedule.author.id === uid)
    ) {
      return false;
    }

    if (
      !(
        eventSchedule.author.id === uid ||
        answers.some((ans) => ans.user.id === uid)
      )
    ) {
      return false;
    }

    // 自分がアーカイブしているかどうか
    const isArchived = eventSchedule.archivedBy.some((u) => u.id === uid);

    switch (filterOptionState) {
      case 'archive':
        // 自分がアーカイブしていなければ false
        if (!isArchived) return false;
        break;

      case 'inProgress':
        // 自分がアーカイブしていたら false
        if (isArchived) return false;
        break;
    }

    if (!eventSchedule.title.includes(filterText)) return false;

    if (!showAllPastDaysEvent) {
      const t = today();
      if (
        eventSchedule.datetimeRangeList.every(
          (datetimeRange) => compareYmd(datetimeRange.ymd, t) === -1
        )
      ) {
        return false;
      }
    }

    return true;
  });
};
