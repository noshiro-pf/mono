import {
  compareYmd,
  fillNotificationSettings,
} from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { toAbsolutePath } from '@noshiro/ts-utils-additional';
import { api } from '../../api';
import { eventScheduleInitialValue, Routes } from '../../constants';
import {
  createToaster,
  EventScheduleAppLocalStorage,
  showToast,
} from '../../functions';
import type { EventScheduleSettingCommonState } from '../../types';
import { now } from '../../utils';
import { fireAuthUser$ } from '../auth';
import { createEventScheduleSettingStore } from './event-schedule-setting-common';

export namespace CreateEventScheduleStore {
  const toast = createToaster();

  export const { commonState$, commonStateHandlers } =
    createEventScheduleSettingStore();

  export const hasNoChanges$: InitializedObservable<boolean> =
    commonState$.chain(
      mapI(({ eventScheduleNormalized }) =>
        deepEqual(eventScheduleInitialValue, eventScheduleNormalized)
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
      // 過去日は復元しない
      commonStateHandlers.setDatetimeRangeList(
        ev.datetimeRangeList.filter((d) => compareYmd(d.ymd, now()) >= 0)
      );
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

  export const saveToLocalStorage = (
    commonState: EventScheduleSettingCommonState
  ): void => {
    const saveResult = EventScheduleAppLocalStorage.saveCreateEventPageTemp({
      answerDeadline: commonState.answerDeadline ?? 'none',
      answerIcons: commonState.answerIcons,
      datetimeRangeList: commonState.datetimeRangeList,
      datetimeSpecification: commonState.datetimeSpecification,
      notes: commonState.notes,
      notificationSettings:
        pipe(commonState.notificationSettingsWithEmail).chainNullable(
          fillNotificationSettings
        ).value ?? 'none',
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

  export const createEvent = async (): Promise<Result<undefined, string>> => {
    const { commonState, fireAuthUser } = mut_subscribedValues;

    if (commonState === undefined) return Result.ok(undefined);

    const {
      eventScheduleNormalized,
      eventScheduleValidationOk,
      notificationSettingsWithEmail,
    } = commonState;

    const email = notificationSettingsWithEmail?.email ?? '';

    if (!eventScheduleValidationOk) return Result.ok(undefined);

    setIsLoadingTrue();

    openCreateResultDialog();

    const res = await api.event.add(
      IRecord.set(eventScheduleNormalized, 'author', {
        id: fireAuthUser?.uid ?? null,
        name: fireAuthUser?.displayName ?? '',
      })
    );

    if (Result.isErr(res)) {
      return Result.err(res.value);
    }

    const eventId = res.value;

    if (email !== '') {
      const res2 = await api.event.setAuthorsEmail(eventId, email);
      if (Result.isErr(res2)) {
        return Result.err(res2.value);
      }
    }

    setIsLoadingFalse();
    setUrl(toAbsolutePath(`..${Routes.routes.answerPage(eventId)}`));

    // reset local storage
    EventScheduleAppLocalStorage.saveCreateEventPageTemp({
      answerDeadline: eventScheduleInitialValue.answerDeadline,
      answerIcons: eventScheduleInitialValue.answerIcons,
      datetimeRangeList: eventScheduleInitialValue.datetimeRangeList,
      datetimeSpecification: eventScheduleInitialValue.datetimeSpecification,
      notes: eventScheduleInitialValue.notes,
      notificationSettings: eventScheduleInitialValue.notificationSettings,
      title: eventScheduleInitialValue.title,
    });

    return Result.ok(undefined);
  };

  export const onCreateEventClick = (): void => {
    createEvent()
      .then((res) => {
        if (Result.isErr(res)) {
          console.error(res.value);
          showToast({
            toast,
            message: dict.eventSettingsPage.createEventResultMessage.error,
            intent: 'danger',
          });
        }
      })
      .catch(noop);
  };

  export const onClipboardButtonClick = (): void => {
    const url = mut_subscribedValues.url;

    // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
    if (
      isNotUndefined(navigator.clipboard) &&
      window.isSecureContext &&
      isNotUndefined(url)
    ) {
      // TODO: use toast
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

  commonState$
    .chain(debounceTime(500))
    .chain(skip(1))
    .chain(filter(isNotUndefined))
    .subscribe(saveToLocalStorage);

  fireAuthUser$.subscribe((user) => {
    mut_subscribedValues.fireAuthUser = user;
  });

  url$.subscribe((url) => {
    mut_subscribedValues.url = url;
  });
}
