import {
  combine,
  createState as createStateBase,
  map,
  type InitializedObservable,
} from 'synstate';
import { createBooleanState, createState } from 'synstate-react-hooks';
import { Arr, fastDeepEqual, Obj, Result } from 'ts-data-forge';
import { api } from '../../api/index.mjs';
import { eventScheduleInitialValue, Routes } from '../../constants/index.mjs';
import {
  collectEventSettingsPageDiff,
  createToaster,
  showToast,
  type EventSettingsPageDiffResult,
} from '../../functions/index.mjs';
import { noop } from '../../utils-ported/index.mjs';
import { AnswersStore, EventScheduleStore } from '../fetching-state/index.mjs';
import { Router } from '../router.mjs';
import { createEventScheduleSettingStore } from './event-schedule-setting-common.mjs';

const toast = createToaster();

const { commonState$, commonStateHandlers } = createEventScheduleSettingStore();

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
        eventScheduleNormalized,
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
      fastDeepEqual(eventScheduleFromDatabase, eventScheduleNormalized),
  ),
);

const answerPagePath$ = Router.eventId$.pipe(
  map((eventId) => Routes.routes.answerPage(eventId ?? '')),
);

const onBackToAnswerPage = (): void => {
  const answerPagePath = answerPagePath$.getSnapshot().value;

  Router.push(answerPagePath);
};

const saveToDatabase = async (): Promise<void> => {
  const commonState = commonState$.getSnapshot().value;

  const eventId = Router.eventId$.getSnapshot().value;

  const {
    eventScheduleNormalized,
    eventScheduleValidationOk,
    notificationSettingsWithEmail,
  } = commonState;

  if (!eventScheduleValidationOk || eventId === undefined) return;

  const email = notificationSettingsWithEmail?.email ?? '';

  setIsLoadingTrue();

  const res = await api.event.update(eventId, eventScheduleNormalized);

  const res2 =
    email === '' ? undefined : await api.event.setAuthorsEmail(eventId, email);

  setIsLoadingFalse();

  if (Result.isErr(res)) {
    console.error('Error occurred on updating event schedule: ', res.value);

    showToast({
      toast,
      message: dict.eventSettingsPage.editEventResultMessage.error,
      intent: 'danger',
    });

    return;
  }

  if (res2 !== undefined && Result.isErr(res2)) {
    console.error('Error occurred on updating email: ', res2.value);

    showToast({
      toast,
      message: dict.eventSettingsPage.editEventResultMessage.error,
      intent: 'danger',
    });

    return;
  }

  showToast({
    toast,
    message: dict.eventSettingsPage.editEventResultMessage.success,
    intent: 'success',
  });

  AnswersStore.fetchAnswers();

  EventScheduleStore.fetchEventSchedule();

  onBackToAnswerPage();
};

const onEditEventClickPromise = saveToDatabase;

const onEditEventClick = (): void => {
  saveToDatabase().catch(noop);
};

const [
  useIsLoading,
  { setTrue: setIsLoadingTrue, setFalse: setIsLoadingFalse },
] = createBooleanState(false);

export const EditEventScheduleStore = {
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
