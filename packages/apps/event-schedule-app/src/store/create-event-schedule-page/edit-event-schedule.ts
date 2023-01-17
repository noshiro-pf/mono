import { deepEqual } from '@noshiro/fast-deep-equal';
import { api } from '../../api';
import { eventScheduleInitialValue, Routes } from '../../constants';
import type { EventSettingsPageDiffResult } from '../../functions';
import {
  collectEventSettingsPageDiff,
  createToaster,
  showToast,
} from '../../functions';
import type { EventScheduleSettingCommonState } from '../../types';
import { AnswersStore, EventScheduleStore } from '../fetching-state';
import { router } from '../router';
import { createEventScheduleSettingStore } from './event-schedule-setting-common';

const toast = createToaster();

const { commonState$, commonStateHandlers } = createEventScheduleSettingStore();

const {
  state$: eventScheduleFromDatabase$,
  setState: setEventScheduleFromDatabase,
} = createState<EventSchedule | undefined>(undefined);

const {
  state$: emailVerified$,
  setState: setEmailVerified,
  resetState: resetEmailVerified,
} = createState<string | undefined>(undefined);

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
  emailVerified: string | undefined
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
      Obj.merge(ev.notificationSettings, { email: emailVerified ?? '' })
    );
  }
};

const diff$: InitializedObservable<EventSettingsPageDiffResult> =
  combineLatestI([
    emailVerified$,
    eventScheduleFromDatabase$,
    commonState$,
  ]).chain(
    mapI(
      ([
        emailVerified,
        eventScheduleFromDatabase,
        { eventScheduleNormalized, notificationSettingsWithEmail },
      ]) =>
        collectEventSettingsPageDiff(
          eventScheduleFromDatabase ?? eventScheduleInitialValue,
          eventScheduleNormalized,
          emailVerified,
          notificationSettingsWithEmail?.email
        )
    )
  );

const hasDeletedDatetimeChanges$: InitializedObservable<boolean> = diff$.chain(
  mapI(
    (diff) =>
      diff.datetimeRangeList?.deleted !== undefined &&
      Arr.isNonEmpty(diff.datetimeRangeList.deleted)
  )
);

const hasNoChanges$: InitializedObservable<boolean> = combineLatestI([
  emailVerified$,
  eventScheduleFromDatabase$,
  commonState$,
]).chain(
  mapI(
    ([
      emailVerified,
      eventScheduleFromDatabase,
      { eventScheduleNormalized, notificationSettingsWithEmail },
    ]) =>
      emailVerified === notificationSettingsWithEmail?.email &&
      deepEqual(eventScheduleFromDatabase, eventScheduleNormalized)
  )
);

const answerPagePath$ = router.eventId$.chain(
  mapI((eventId) => Routes.routes.answerPage(eventId ?? ''))
);

const onBackToAnswerPage = (): void => {
  const { answerPagePath } = mut_subscribedValues;
  if (answerPagePath !== undefined) {
    router.push(answerPagePath);
  }
};

const saveToDatabase = async (): Promise<void> => {
  const { commonState, eventId } = mut_subscribedValues;

  if (commonState === undefined) return;

  const {
    eventScheduleNormalized,
    eventScheduleValidationOk,
    notificationSettingsWithEmail,
  } = commonState;

  const email = notificationSettingsWithEmail?.email ?? '';

  if (!eventScheduleValidationOk || eventId === undefined) return;

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

  if (Result.isErr(res2)) {
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

const {
  state$: isLoading$,
  setTrue: setIsLoadingTrue,
  setFalse: setIsLoadingFalse,
} = createBooleanState(false);

/* subscriptions */

const mut_subscribedValues: {
  commonState: EventScheduleSettingCommonState | undefined;
  answerPagePath: string | undefined;
  url: string | undefined;
  eventId: string | undefined;
  emailVerified: string | undefined;
} = {
  commonState: undefined,
  answerPagePath: undefined,
  url: undefined,
  eventId: undefined,
  emailVerified: undefined,
};

commonState$.subscribe((commonState) => {
  mut_subscribedValues.commonState = commonState;
});

answerPagePath$.subscribe((user) => {
  mut_subscribedValues.answerPagePath = user;
});

router.eventId$.subscribe((user) => {
  mut_subscribedValues.eventId = user;
});

emailVerified$.subscribe((v) => {
  mut_subscribedValues.emailVerified = v;
});

export const EditEventScheduleStore = {
  commonState$,
  commonStateHandlers,
  diff$,
  emailVerified$,
  hasDeletedDatetimeChanges$,
  hasNoChanges$,
  isLoading$,
  setEmailVerified,
  onBackToAnswerPage,
  onEditEventClick,
  onEditEventClickPromise,
  setEventSchedule,
  resetEmailVerified,
  resetAllState,
} as const;
