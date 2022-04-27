import { deepEqual } from '@noshiro/fast-deep-equal';
import { toAbsolutePath } from '@noshiro/ts-utils-additional';
import { api } from '../../api';
import { initialEventSchedule, routes } from '../../constants';
import { EventScheduleAppLocalStorage } from '../../functions';
import type { EventScheduleSettingCommonState } from '../../types';
import { fireAuthUser$ } from '../auth';
import { createEventScheduleSettingStore } from './event-schedule-setting-common';

export namespace CreateEventScheduleStore {
  export const { commonState$, commonStateHandlers } =
    createEventScheduleSettingStore();

  export const hasNoChanges$: InitializedObservable<boolean> =
    commonState$.chain(
      mapI(({ eventScheduleNormalized }) =>
        deepEqual(initialEventSchedule, eventScheduleNormalized)
      )
    );

  export const resetAllState = (): void => {
    commonStateHandlers.resetTitle();
    commonStateHandlers.resetNotes();
    commonStateHandlers.resetDatetimeSpecification();
    commonStateHandlers.resetDatetimeRangeList();
    commonStateHandlers.resetAnswerDeadlineSection();
    commonStateHandlers.resetNotificationSettingsSection();
    commonStateHandlers.resetAnswerIcons();
  };

  export const restoreFromLocalStorage = (): void => {
    const fromStorage =
      EventScheduleAppLocalStorage.restoreCreateEventPageTemp();

    if (Result.isOk(fromStorage)) {
      const ev = fromStorage.value;
      if (ev === undefined) return;

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
        commonStateHandlers.setNotificationSettings(ev.notificationSettings);
      }
    }
  };

  export const saveToLocalStorage = (): void => {
    const { commonState } = mut_subscribedValues;
    if (commonState === undefined) return;

    const saveResult = EventScheduleAppLocalStorage.saveCreateEventPageTemp({
      answerDeadline: commonState.answerDeadline ?? 'none',
      answerIcons: commonState.answerIcons,
      datetimeRangeList: commonState.datetimeRangeList,
      datetimeSpecification: commonState.datetimeSpecification,
      notes: commonState.notes,
      notificationSettings: commonState.notificationSettings ?? 'none',
      title: commonState.title,
    });
    if (Result.isErr(saveResult)) {
      console.warn(saveResult.value);
    }
  };

  export const {
    state$: isLoading$,
    setTrue: setIsLoadingTrue,
    setFalse: setIsLoadingFalse,
  } = createBooleanState(false);

  export const {
    state$: createResultDialogIsOpen$,
    setTrue: openCreateResultDialog,
    setFalse: closeCreateResultDialog,
  } = createBooleanState(false);

  export const { state$: url$, setState: setUrl } = createState<string>('');

  export const createEvent = async (): Promise<void> => {
    const { commonState, fireAuthUser } = mut_subscribedValues;

    if (commonState === undefined) return;

    const { eventScheduleNormalized, eventScheduleValidationOk } = commonState;

    if (!eventScheduleValidationOk) return;

    setIsLoadingTrue();

    openCreateResultDialog();

    const res = await api.event.add(
      IRecord.set(eventScheduleNormalized, 'author', {
        id: fireAuthUser?.uid ?? null,
        name: fireAuthUser?.displayName ?? '',
      })
    );

    if (Result.isErr(res)) {
      console.error(res.value);
    }
    setIsLoadingFalse();
    setUrl(toAbsolutePath(`..${routes.answerPage(res.value)}`));

    // reset local storage
    EventScheduleAppLocalStorage.saveCreateEventPageTemp({
      answerDeadline: initialEventSchedule.answerDeadline,
      answerIcons: initialEventSchedule.answerIcons,
      datetimeRangeList: initialEventSchedule.datetimeRangeList,
      datetimeSpecification: initialEventSchedule.datetimeSpecification,
      notes: initialEventSchedule.notes,
      notificationSettings: initialEventSchedule.notificationSettings,
      title: initialEventSchedule.title,
    });
  };

  export const onCreateEventClick = (): void => {
    createEvent().catch(console.error);
  };

  export const onClipboardButtonClick = (): void => {
    const url = mut_subscribedValues.url;
    // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
    if (
      isNotUndefined(navigator.clipboard) &&
      window.isSecureContext &&
      url !== undefined
    ) {
      navigator.clipboard.writeText(url).catch(console.error);
    }
  };

  /* subscriptions */

  const mut_subscribedValues: {
    commonState: EventScheduleSettingCommonState | undefined;
    fireAuthUser: FireAuthUser | undefined;
    url: string | undefined;
  } = {
    commonState: undefined,
    fireAuthUser: undefined,
    url: undefined,
  };

  commonState$.subscribe((commonState) => {
    mut_subscribedValues.commonState = commonState;
  });

  fireAuthUser$.subscribe((user) => {
    mut_subscribedValues.fireAuthUser = user;
  });
}
