import type { Toaster } from '@blueprintjs/core';
import {
  combine,
  createState as createStateBase,
  map,
  type InitializedObservable,
} from 'synstate';
import { createBooleanState, createState } from 'synstate-react-hooks';
import { Arr, fastDeepEqual, Obj, Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../../api/index.mjs';
import {
  dict,
  eventScheduleInitialValue,
  Routes,
} from '../../constants/index.mjs';
import {
  collectEventSettingsPageDiff,
  showToast,
  type EventSettingsPageDiffResult,
} from '../../functions/index.mjs';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
} from '../../types/index.mjs';
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
  router: StrictPick<AppRouter, 'eventId$' | 'push'>;
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
  const { commonState$, commonStateHandlers } = createEventScheduleSettingStore(
    {
      fireAuthUser$: deps.fireAuthUser$,
    },
  );

  const [eventScheduleFromDatabase$, setEventScheduleFromDatabase] =
    createStateBase<EventSchedule | undefined>(undefined);

  const [
    useEmailVerified,
    setEmailVerified,
    { state: emailVerified$, resetState: resetEmailVerified },
  ] = createState<string | undefined>(undefined);

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

  const diff$: InitializedObservable<EventSettingsPageDiffResult> = combine([
    emailVerified$,
    eventScheduleFromDatabase$,
    commonState$,
  ]).pipe(
    map(
      ([
        emailVerified,
        eventScheduleFromDatabase,
        { eventScheduleNormalized, notificationSettingsWithEmail },
      ]) =>
        collectEventSettingsPageDiff(
          eventScheduleFromDatabase ?? eventScheduleInitialValue,
          keepIdentityOf(eventScheduleFromDatabase, eventScheduleNormalized),
          emailVerified,
          notificationSettingsWithEmail?.email,
        ),
    ),
  );

  const hasDeletedDatetimeChanges$: InitializedObservable<boolean> = diff$.pipe(
    map(
      (diff) =>
        diff.datetimeRangeList?.deleted !== undefined &&
        Arr.isNonEmpty(diff.datetimeRangeList.deleted),
    ),
  );

  const hasNoChanges$: InitializedObservable<boolean> = combine([
    emailVerified$,
    eventScheduleFromDatabase$,
    commonState$,
  ]).pipe(
    map(
      ([
        emailVerified,
        eventScheduleFromDatabase,
        { eventScheduleNormalized, notificationSettingsWithEmail },
      ]) =>
        emailVerified === notificationSettingsWithEmail?.email &&
        fastDeepEqual(
          eventScheduleFromDatabase,
          keepIdentityOf(eventScheduleFromDatabase, eventScheduleNormalized),
        ),
    ),
  );

  const answerPagePath$ = deps.router.eventId$.pipe(
    map((eventId) => Routes.routes.answerPage(eventId ?? '')),
  );

  const onBackToAnswerPage = (): void => {
    const answerPagePath = answerPagePath$.getSnapshot().value;

    deps.router.push(answerPagePath);
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
    useIsLoading,
    { setTrue: setIsLoadingTrue, setFalse: setIsLoadingFalse },
  ] = createBooleanState(false);

  return {
    commonState$,
    commonStateHandlers,
    diff$,
    useEmailVerified,
    hasDeletedDatetimeChanges$,
    hasNoChanges$,
    useIsLoading,
    setEmailVerified,
    onBackToAnswerPage,
    onEditEventClick,
    onEditEventClickPromise,
    setEventSchedule,
    resetEmailVerified,
    resetAllState,
  } as const;
};

export type EditEventSchedule = Readonly<{
  commonState$: InitializedObservable<EventScheduleSettingCommonState>;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
  /** What the settings change from the event as the database has it. */
  diff$: InitializedObservable<EventSettingsPageDiffResult>;
  useEmailVerified: () => string | undefined;
  hasDeletedDatetimeChanges$: InitializedObservable<boolean>;
  hasNoChanges$: InitializedObservable<boolean>;
  useIsLoading: () => boolean;
  setEmailVerified: (v: string | undefined) => string | undefined;
  onBackToAnswerPage: () => void;
  onEditEventClick: () => void;
  onEditEventClickPromise: () => Promise<void>;
  setEventSchedule: (
    ev: EventSchedule,
    emailVerified: string | undefined,
  ) => void;
  resetEmailVerified: () => string | undefined;
  resetAllState: () => void;
}>;
