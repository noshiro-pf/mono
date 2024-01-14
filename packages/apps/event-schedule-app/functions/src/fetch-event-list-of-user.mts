import {
  compareYmd,
  eventListItemDefaultValue,
  fillAnswer,
  fillEventSchedule,
  firestorePaths,
  type EventListItem,
} from '@noshiro/event-schedule-app-shared';
import { Arr, IMap, Tpl, pipe, tp } from '@noshiro/ts-utils';
import { type firestore } from 'firebase-admin';
import { https } from 'firebase-functions';
import { type CallableContext } from 'firebase-functions/v1/https';
import { type FetchEventListOfUserPayload } from './types/index.mjs';
import { today } from './utils/index.mjs';

/**
 * eventSchedule.author.id === uid であるか、
 * answers に uid が含まれているもの（＝自分が関わっているEventSchedule）
 * のみを返す。
 */
export const fetchEventListOfUserImpl = async (
  db: firestore.Firestore,
  {
    filterText,
    filterOptionState,
    showAllPastDaysEvent,
    showOnlyEventSchedulesICreated,
  }: FetchEventListOfUserPayload,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  context: CallableContext,
): Promise<readonly EventListItem[]> => {
  // Checking that the user is authenticated.
  if (context.auth === undefined) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new https.HttpsError(
      'failed-precondition',
      'The function must be called while authenticated.',
    );
  }

  const uid = context.auth.uid;

  const eventsSnapshot = await pipe(db.collection(firestorePaths.events))
    .chain((ref) =>
      showOnlyEventSchedulesICreated ? ref.where('author.id', '==', uid) : ref,
    )
    .value.get();

  const eventList: readonly Pick<
    EventListItem,
    'eventSchedule' | 'eventScheduleMetadata'
  >[] = eventsSnapshot.docs.map((d) => ({
    eventSchedule: fillEventSchedule(d.data()),
    eventScheduleMetadata: {
      id: d.id,
      createdAt: d.createTime.toDate().toISOString(),
      updatedAt: d.updateTime.toDate().toISOString(),
    },
  }));

  const eventListFiltered = pipe(eventList).chain((list) =>
    list.filter(({ eventSchedule }) => {
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
          !eventSchedule.datetimeRangeList.some(
            (datetimeRange) => compareYmd(datetimeRange.ymd, t) >= 0,
          )
        ) {
          return false;
        }
      }

      return true;
    }),
  ).value;

  const answersOfEvents: readonly Readonly<
    Pick<EventListItem, 'answers' | 'answersMetadata'> & {
      eventId: string;
    }
  >[] = await Promise.all(
    pipe(eventListFiltered).chain((list) =>
      Tpl.map(list, ({ eventScheduleMetadata: { id: eventId } }) =>
        db
          .collection(
            `${firestorePaths.events}/${eventId}/${firestorePaths.answers}`,
          )
          .get()
          .then((answersSnapshot) => ({
            eventId,
            answers: answersSnapshot.docs.map((d) => fillAnswer(d.data())),
            answersMetadata: {
              lastUpdate: pipe(answersSnapshot.docs)
                .chain((ds) => Arr.maxBy(ds, (d) => d.updateTime.toMillis()))
                .chain((d) => d?.updateTime.toDate().toISOString() ?? '').value,
            },
          })),
      ),
    ).value,
  );

  const answersOfEventMap = IMap.new<
    string,
    Pick<EventListItem, 'answers' | 'answersMetadata'>
  >(
    answersOfEvents.map(({ answers, answersMetadata, eventId }) =>
      tp(eventId, { answers, answersMetadata }),
    ),
  );

  const eventListItems: readonly EventListItem[] = eventListFiltered
    .filter(({ eventScheduleMetadata }) => {
      const ans = answersOfEventMap.get(eventScheduleMetadata.id);

      return ans?.answers.some(({ user }) => user.id === uid) ?? false;
    })
    .map(({ eventSchedule, eventScheduleMetadata }): EventListItem => {
      const ans = answersOfEventMap.get(eventScheduleMetadata.id);
      return {
        eventSchedule,
        eventScheduleMetadata,
        answers: ans?.answers ?? [],
        answersMetadata:
          ans?.answersMetadata ?? eventListItemDefaultValue.answersMetadata,
      };
    });

  return eventListItems.filter(
    ({ eventSchedule, answers }) =>
      eventSchedule.author.id === uid ||
      answers.some(({ user }) => user.id === uid),
  );
};
