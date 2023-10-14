import {
  compareYmd,
  fillNotificationSettings,
  toUserId,
  toUserName,
} from '@noshiro/event-schedule-app-shared';
import { deepEqual } from '@noshiro/fast-deep-equal';
import { toAbsolutePath } from '@noshiro/ts-utils-additional';
import { api } from '../../api';
import { Routes, eventScheduleInitialValue } from '../../constants';
import {
  EventScheduleAppLocalStorage,
  createToaster,
  showToast,
} from '../../functions';
import { type EventScheduleSettingCommonState } from '../../types';
import { now } from '../../utils';
import { Auth } from '../auth';
import { createEventScheduleSettingStore } from './event-schedule-setting-common';

const toast = createToaster();

const { commonState$, commonStateHandlers } = createEventScheduleSettingStore();

const hasNoChanges$: InitializedObservable<boolean> = commonState$.chain(
  mapI(({ eventScheduleNormalized }) =>
    deepEqual(eventScheduleInitialValue, eventScheduleNormalized),
  ),
);

const resetAllState = (): void => {
  commonStateHandlers.resetTitle();
  commonStateHandlers.resetNotes();
  commonStateHandlers.resetDatetimeSpecification();
  commonStateHandlers.resetDatetimeRangeList();
  commonStateHandlers.resetAnswerDeadlineSection();
  commonStateHandlers.resetNotificationSettingsSection();
  commonStateHandlers.resetAnswerIcons();
};

const restoreFromLocalStorage = (): void => {
  const fromStorage = EventScheduleAppLocalStorage.restoreCreateEventPageTemp();

  if (Result.isOk(fromStorage)) {
    const ev = fromStorage.value;
    if (ev === undefined) return;

    commonStateHandlers.setTitle(ev.title);
    commonStateHandlers.setNotes(ev.notes);
    commonStateHandlers.setDatetimeSpecification(ev.datetimeSpecification);
    // 過去日（今日含む）は復元しない
    commonStateHandlers.setDatetimeRangeList(
      ev.datetimeRangeList.filter((d) => compareYmd(d.ymd, now()) > 0),
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
      commonStateHandlers.setNotificationSettingsWithEmail({
        ...ev.notificationSettings,
        email: Auth.fireAuthUser$.snapshot.value?.email ?? '',
      });
    }
  }
};

const saveToLocalStorage = (
  commonState: EventScheduleSettingCommonState,
): void => {
  const saveResult = EventScheduleAppLocalStorage.saveCreateEventPageTemp({
    answerDeadline: commonState.answerDeadline ?? 'none',
    answerIcons: commonState.answerIcons,
    datetimeRangeList: commonState.datetimeRangeList,
    datetimeSpecification: commonState.datetimeSpecification,
    notes: commonState.notes,
    notificationSettings:
      pipe(commonState.notificationSettingsWithEmail).chainOptional(
        fillNotificationSettings,
      ).value ?? 'none',
    title: commonState.title,
  });
  if (Result.isErr(saveResult)) {
    console.warn(saveResult.value);
  }
};

const {
  state$: isLoading$,
  setTrue: setIsLoadingTrue,
  setFalse: setIsLoadingFalse,
} = createBooleanState(false);

const {
  state$: createResultDialogIsOpen$,
  setTrue: openCreateResultDialog,
  setFalse: closeCreateResultDialog,
} = createBooleanState(false);

const { state$: url$, setState: setUrl } = createState<string>('');

const createEvent = async (): Promise<Result<undefined, string>> => {
  const commonState = commonState$.snapshot.value;
  const fireAuthUser = Auth.fireAuthUser$.snapshot.value;

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
    Obj.set(eventScheduleNormalized, 'author', {
      id: mapOptional(fireAuthUser?.uid, toUserId) ?? null,
      name: toUserName(fireAuthUser?.displayName ?? ''),
    }),
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

const onCreateEventClick = (): void => {
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

const onClipboardButtonClick = (): void => {
  const url = url$.snapshot.value;

  // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
  if (
    isNotUndefined(window.navigator.clipboard) &&
    window.isSecureContext &&
    isNotUndefined(url)
  ) {
    // TODO: use toast
    window.navigator.clipboard.writeText(url).catch(console.error);
  }
};

/* subscriptions */

commonState$
  .chain(debounceTime(500))
  .chain(skip(1))
  .chain(filter(isNotUndefined))
  .subscribe(saveToLocalStorage);

export const CreateEventScheduleStore = {
  closeCreateResultDialog,
  commonState$,
  commonStateHandlers,
  createResultDialogIsOpen$,
  hasNoChanges$,
  isLoading$,
  onClipboardButtonClick,
  onCreateEventClick,
  resetAllState,
  restoreFromLocalStorage,
  url$,
} as const;
