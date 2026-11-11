import {
  createBooleanState,
  createState as createStateBase,
  derive,
  map,
  mapTo,
  type InitializedObservable,
} from 'synstate';
import { Arr, fastDeepEqual, Obj, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../../api/index.mjs';
import { dict, routes } from '../../constants/index.mjs';
import {
  collectEventSettingsPageDiff,
  showToast,
  type EventSettingsPageDiffResult,
} from '../../functions/index.mjs';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
} from '../../types/index.mjs';
import { createReducerWithActions } from '../../utils/index.mjs';
import type {
  AnswersFetcher,
  EventScheduleFetcher,
} from '../fetching-state/index.mjs';
import type { AppRouter } from '../router-store.mjs';
import {
  createEventScheduleSettingStore,
  type EventScheduleSettingUser,
} from './event-schedule-setting-common.mjs';

export type EditEventScheduleDeps = Readonly<{
  api: Readonly<{
    event: StrictPick<Api['event'], 'setAuthorsEmail' | 'update'>;
  }>;
  fireAuthUser$: InitializedObservable<EventScheduleSettingUser | undefined>;
  answers: StrictPick<AnswersFetcher, 'refetchAnswersAfterWrite'>;
  eventSchedule: StrictPick<
    EventScheduleFetcher,
    'refetchEventScheduleAfterWrite'
  >;
  router: StrictPick<AppRouter, 'editPageLeaves$' | 'eventId$' | 'push'>;
  /** Where the page says whether the event was saved. */
  toast: Promise<Toaster>;
}>;

/**
 * The edit page: the event as the database has it, the settings being changed,
 * what differs, and the event saved back through `deps.api`.
 */
export const createEditEventScheduleStore = (
  deps: EditEventScheduleDeps,
): EditEventSchedule => {
  const { commonState$, commonStateHandlers, baseline$, startVisit } =
    createEventScheduleSettingStore({
      fireAuthUser$: deps.fireAuthUser$,
    });

  const [eventScheduleFromDatabase$, setEventScheduleFromDatabase] =
    createStateBase<EventSchedule | undefined>(undefined);

  // The store outlives the page, so the form and the event it was loaded from
  // are forgotten when the page is left: another event's edit page starts empty
  // until its own event is read, not with this one's form.
  deps.router.editPageLeaves$.subscribe(() => {
    setEventScheduleFromDatabase(undefined);

    startVisit();
  });

  // The author email confirmed in the dialog, with the event it was confirmed
  // for. The store outlives the page, so it is forgotten when the edit page is
  // left, and read only on the page of that event: an event without
  // notifications never asks, so nothing else would replace it.
  const [verified$, setVerified] = createReducerWithActions(
    (_: VerifiedEmail | undefined, next: VerifiedEmail | undefined) => next,
    undefined,
    [deps.router.editPageLeaves$.pipe(mapTo(undefined))],
  );

  const emailVerified$: InitializedObservable<string | undefined> = derive(
    [verified$, deps.router.eventId$],
    (verified, eventId) =>
      verified !== undefined && verified.eventId === eventId
        ? verified.email
        : undefined,
  );

  const setEmailVerified = (eventId: string, email: string): void => {
    setVerified({ eventId, email });
  };

  const resetAllState = (): void => {
    commonStateHandlers.resetTitle();

    commonStateHandlers.resetNotes();

    commonStateHandlers.resetDatetimeSpecification();

    commonStateHandlers.resetDatetimeRangeList();

    commonStateHandlers.resetAnswerDeadlineSection();

    commonStateHandlers.resetNotificationSettingsSection();

    commonStateHandlers.resetAnswerIcons();
  };

  const setEventSchedule = (
    ev: EventSchedule,
    emailVerified: string | undefined,
  ): void => {
    setEventScheduleFromDatabase(ev);

    commonStateHandlers.setTitle(ev.title);

    commonStateHandlers.setNotes(ev.notes);

    commonStateHandlers.setDatetimeSpecification(ev.datetimeSpecification);

    commonStateHandlers.setDatetimeRangeList(ev.datetimeRangeList);

    commonStateHandlers.setAnswerIcons(ev.answerIcons);

    if (ev.answerDeadline === 'none') {
      commonStateHandlers.turnOffAnswerDeadlineSection();
    } else {
      commonStateHandlers.turnOnAnswerDeadlineSection();

      commonStateHandlers.setAnswerDeadline(ev.answerDeadline);
    }

    if (ev.notificationSettings === 'none') {
      commonStateHandlers.turnOffNotificationSection();
    } else {
      commonStateHandlers.turnOnNotificationSection();

      commonStateHandlers.setNotificationSettingsWithEmail(
        Obj.merge(ev.notificationSettings, { email: emailVerified ?? '' }),
      );
    }
  };

  // The settings form knows nothing of who made the event or who archived it,
  // so `eventScheduleNormalized` carries the current user as `author` and an
  // empty `archivedBy`. An edit keeps both as the database has them: the
  // Firestore rules refuse an update that changes either.
  const keepIdentityOf = (
    fromDatabase: EventSchedule | undefined,
    eventSchedule: EventSchedule,
  ): EventSchedule =>
    fromDatabase === undefined
      ? eventSchedule
      : ({
          ...eventSchedule,
          author: fromDatabase.author,
          archivedBy: fromDatabase.archivedBy,
        } as const);

  const diff$: InitializedObservable<EventSettingsPageDiffResult> = derive(
    [emailVerified$, eventScheduleFromDatabase$, commonState$, baseline$],
    (
      emailVerified,
      eventScheduleFromDatabase,
      { eventScheduleNormalized, notificationSettingsWithEmail },
      baseline,
    ) =>
      collectEventSettingsPageDiff(
        eventScheduleFromDatabase ?? baseline,
        keepIdentityOf(eventScheduleFromDatabase, eventScheduleNormalized),
        emailVerified,
        notificationSettingsWithEmail?.email,
      ),
  );

  const hasDeletedDatetimeChanges$: InitializedObservable<boolean> = diff$.pipe(
    map(
      (diff) =>
        diff.datetimeRangeList?.deleted !== undefined &&
        Arr.isNonEmpty(diff.datetimeRangeList.deleted),
    ),
  );

  const hasNoChanges$: InitializedObservable<boolean> = derive(
    [emailVerified$, eventScheduleFromDatabase$, commonState$],
    (
      emailVerified,
      eventScheduleFromDatabase,
      { eventScheduleNormalized, notificationSettingsWithEmail },
    ) =>
      emailVerified === notificationSettingsWithEmail?.email &&
      fastDeepEqual(
        eventScheduleFromDatabase,
        keepIdentityOf(eventScheduleFromDatabase, eventScheduleNormalized),
      ),
  );

  const onBackToAnswerPage = (): void => {
    const eventId = deps.router.eventId$.getSnapshot().value;

    if (eventId !== undefined) {
      deps.router.push(routes.event.answer.href({ eventId }));
    }
  };

  const saveToDatabase = async (): Promise<void> => {
    const commonState = commonState$.getSnapshot().value;

    const eventId = deps.router.eventId$.getSnapshot().value;

    const {
      eventScheduleNormalized,
      eventScheduleValidationOk,
      notificationSettingsWithEmail,
    } = commonState;

    if (!eventScheduleValidationOk || eventId === undefined) {
      return;
    }

    const email = notificationSettingsWithEmail?.email ?? '';

    setIsLoadingTrue();

    const res = await deps.api.event.update(
      eventId,
      keepIdentityOf(
        eventScheduleFromDatabase$.getSnapshot().value,
        eventScheduleNormalized,
      ),
    );

    const res2 =
      email === ''
        ? undefined
        : await deps.api.event.setAuthorsEmail(eventId, email);

    setIsLoadingFalse();

    if (Result.isErr(res)) {
      console.error('Error occurred on updating event schedule: ', res.value);

      showToast({
        toast: deps.toast,
        message: dict.eventSettingsPage.editEventResultMessage.error,
        intent: 'danger',
      });

      return;
    }

    if (res2 !== undefined && Result.isErr(res2)) {
      console.error('Error occurred on updating email: ', res2.value);

      showToast({
        toast: deps.toast,
        message: dict.eventSettingsPage.editEventResultMessage.error,
        intent: 'danger',
      });

      return;
    }

    showToast({
      toast: deps.toast,
      message: dict.eventSettingsPage.editEventResultMessage.success,
      intent: 'success',
    });

    deps.answers.refetchAnswersAfterWrite();

    deps.eventSchedule.refetchEventScheduleAfterWrite();

    onBackToAnswerPage();
  };

  const onEditEventClickPromise = saveToDatabase;

  const onEditEventClick = (): void => {
    saveToDatabase().catch(() => {});
  };

  const [
    isLoading$,
    { setTrue: setIsLoadingTrue, setFalse: setIsLoadingFalse },
  ] = createBooleanState(false);

  return {
    commonState$,
    commonStateHandlers,
    isLoading$,
    diff$,
    emailVerified$,
    hasDeletedDatetimeChanges$,
    hasNoChanges$,
    setEmailVerified,
    onBackToAnswerPage,
    onEditEventClick,
    onEditEventClickPromise,
    setEventSchedule,
    resetAllState,
  } as const;
};

export type EditEventSchedule = Readonly<{
  commonState$: InitializedObservable<EventScheduleSettingCommonState>;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
  isLoading$: InitializedObservable<boolean>;
  /** What the settings change from the event as the database has it. */
  diff$: InitializedObservable<EventSettingsPageDiffResult>;
  hasDeletedDatetimeChanges$: InitializedObservable<boolean>;
  hasNoChanges$: InitializedObservable<boolean>;
  /** The author email confirmed for the event whose edit page is open. */
  emailVerified$: InitializedObservable<string | undefined>;
  /** Records `email` as confirmed for event `eventId`. */
  setEmailVerified: (eventId: string, email: string) => void;
  onBackToAnswerPage: () => void;
  onEditEventClick: () => void;
  onEditEventClickPromise: () => Promise<void>;
  setEventSchedule: (
    ev: EventSchedule,
    emailVerified: string | undefined,
  ) => void;
  resetAllState: () => void;
}>;

type VerifiedEmail = Readonly<{
  eventId: string;
  email: string;
}>;
