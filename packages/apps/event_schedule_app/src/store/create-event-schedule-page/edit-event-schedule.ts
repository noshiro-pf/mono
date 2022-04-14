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
import { fetchAnswers, fetchEventSchedule } from '../fetched-values-state';
import { router } from '../router';
import { createEventScheduleSettingStore } from './event-schedule-setting-common';

export namespace EditEventScheduleStore {
  const toast = createToaster();

  export const { commonState$, commonStateHandlers } =
    createEventScheduleSettingStore();

  export const resetAllState = (): void => {
    commonStateHandlers.resetTitle();
    commonStateHandlers.resetNotes();
    commonStateHandlers.resetDatetimeSpecification();
    commonStateHandlers.resetDatetimeRangeList();
    commonStateHandlers.resetAnswerDeadlineSection();
    commonStateHandlers.resetNotificationSettingsSection();
    commonStateHandlers.resetAnswerIcons();
  };

  export const diff$: InitializedObservable<EventSettingsPageDiffResult> =
    commonState$.chain(
      mapI(({ newEventSchedule }) =>
        collectEventSettingsPageDiff(initialEventSchedule, newEventSchedule)
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

  export const hasNoChanges$: InitializedObservable<boolean> =
    commonState$.chain(
      mapI(({ newEventSchedule }) =>
        deepEqual(initialEventSchedule, newEventSchedule)
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

  export const editEvent = async (): Promise<void> => {
    const { commonState, eventId } = mut_subscribedValues;

    if (commonState === undefined) return;

    const { newEventSchedule, eventScheduleValidationOk } = commonState;

    if (!eventScheduleValidationOk || eventId === undefined) return;

    setIsLoadingTrue();
    const res = await api.event.update(eventId, newEventSchedule);

    if (Result.isErr(res)) {
      console.error('Error creating event schedule: ', res.value);
      showToast({
        toast,
        message: dict.eventSettingsPage.editEventResultMessage.error,
        intent: 'danger',
      });
    }

    setIsLoadingFalse();
    fetchAnswers();
    fetchEventSchedule();
    onBackToAnswerPage();
    showToast({
      toast,
      message: dict.eventSettingsPage.editEventResultMessage.success,
      intent: 'success',
    });
  };

  export const onEditEventClick = (): void => {
    editEvent().catch(console.error);
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
  } = {
    commonState: undefined,
    answerPagePath: undefined,
    url: undefined,
    eventId: undefined,
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
}
