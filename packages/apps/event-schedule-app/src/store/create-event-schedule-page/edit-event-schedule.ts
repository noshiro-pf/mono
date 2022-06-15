import { deepEqual } from '@noshiro/fast-deep-equal';
import { api } from '../../api';
import { initialEventSchedule, routes } from '../../constants';
import type { EventSettingsPageDiffResult } from '../../functions';
import {
  collectEventSettingsPageDiff,
  createToaster,
  showToast,
} from '../../functions';
import type { EventScheduleSettingCommonState } from '../../types';
import { AnswersFetchState, EventScheduleFetchState } from '../fetch-state';
import { router } from '../router';
import { createEventScheduleSettingStore } from './event-schedule-setting-common';

export namespace EditEventScheduleStore {
  const toast = createToaster();

  export const { commonState$, commonStateHandlers } =
    createEventScheduleSettingStore();

  const {
    state$: eventScheduleFromDatabase$,
    setState: setEventScheduleFromDatabase,
  } = createState<EventSchedule | undefined>(undefined);

  export const {
    state$: emailVerified$,
    setState: setEmailVerified,
    resetState: resetEmailVerified,
  } = createState<string | undefined>(undefined);

  export const resetAllState = (): void => {
    commonStateHandlers.resetTitle();
    commonStateHandlers.resetNotes();
    commonStateHandlers.resetDatetimeSpecification();
    commonStateHandlers.resetDatetimeRangeList();
    commonStateHandlers.resetAnswerDeadlineSection();
    commonStateHandlers.resetNotificationSettingsSection();
    commonStateHandlers.resetAnswerIcons();
  };

  export const setEventSchedule = (
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
        IRecord.merge(ev.notificationSettings, { email: emailVerified ?? '' })
      );
    }
  };

  export const diff$: InitializedObservable<EventSettingsPageDiffResult> =
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
            eventScheduleFromDatabase ?? initialEventSchedule,
            eventScheduleNormalized,
            emailVerified,
            notificationSettingsWithEmail?.email
          )
      )
    );

  export const hasDeletedDatetimeChanges$: InitializedObservable<boolean> =
    diff$.chain(
      mapI(
        (diff) =>
          diff.datetimeRangeList?.deleted !== undefined &&
          IList.isNonEmpty(diff.datetimeRangeList.deleted)
      )
    );

  export const hasNoChanges$: InitializedObservable<boolean> = combineLatestI([
    eventScheduleFromDatabase$,
    commonState$,
  ]).chain(
    mapI(([eventScheduleFromDatabase, { eventScheduleNormalized }]) =>
      deepEqual(eventScheduleFromDatabase, eventScheduleNormalized)
    )
  );

  const answerPagePath$ = router.eventId$.chain(
    mapI((eventId) => routes.answerPage(eventId ?? ''))
  );

  export const onBackToAnswerPage = (): void => {
    const { answerPagePath } = mut_subscribedValues;
    if (answerPagePath !== undefined) {
      router.push(answerPagePath);
    }
  };

  export const saveToDatabase = async (): Promise<void> => {
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
      email === ''
        ? undefined
        : await api.event.updateAuthorsEmail(eventId, email);

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
    AnswersFetchState.fetchAnswers();
    EventScheduleFetchState.fetchEventSchedule();
    onBackToAnswerPage();
  };

  export const onEditEventClick = (): void => {
    saveToDatabase().catch(console.error);
  };

  export const {
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
}
