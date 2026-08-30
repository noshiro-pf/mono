import {
  NotificationSettings,
  UserId,
  UserName,
} from 'event-schedule-app-shared';
import {
  type InitializedObservable,
  debounce,
  filter,
  map,
  skip,
} from 'synstate';
import { createBooleanState, createState } from 'synstate-react-hooks';
import { Result, fastDeepEqual, isNotUndefined, pipe } from 'ts-data-forge';
import { compareYearMonthDate } from 'ts-fortress-types';
import { api } from '../../api/index.mjs';
import { Routes, eventScheduleInitialValue } from '../../constants/index.mjs';
import {
  EventScheduleAppLocalStorage,
  createToaster,
  showToast,
} from '../../functions/index.mjs';
import { type EventScheduleSettingCommonState } from '../../types/index.mjs';
import {
  mapOptional,
  noop,
  toAbsolutePath,
} from '../../utils-ported/index.mjs';
import { now } from '../../utils/index.mjs';
import { Auth } from '../auth.mjs';
import { createEventScheduleSettingStore } from './event-schedule-setting-common.mjs';

const toast = createToaster();

const { commonState$, commonStateHandlers } = createEventScheduleSettingStore();

const hasNoChanges$: InitializedObservable<boolean> = commonState$.pipe(
  map(({ eventScheduleNormalized }) =>
    fastDeepEqual(eventScheduleInitialValue, eventScheduleNormalized),
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
      ev.datetimeRangeList.filter(
        (d) => compareYearMonthDate(d.ymd, now()) > 0,
      ),
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
        email: Auth.getFireAuthUserSnapshot()?.email ?? '',
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
      pipe(commonState.notificationSettingsWithEmail).map((__v) =>
        mapOptional(__v, NotificationSettings.fill),
      ).value ?? 'none',
    title: commonState.title,
  });

  if (Result.isErr(saveResult)) {
    console.warn(saveResult.value);
  }
};

const [
  useIsLoading,
  { setTrue: setIsLoadingTrue, setFalse: setIsLoadingFalse },
] = createBooleanState(false);

const [
  useCreateResultDialogIsOpen,
  { setTrue: openCreateResultDialog, setFalse: closeCreateResultDialog },
] = createBooleanState(false);

const [useUrl, setUrl, { getSnapshot: getUrlSnapshot }] =
  createState<string>('');

const createEvent = async (): Promise<Result<undefined, string>> => {
  const commonState = commonState$.getSnapshot().value;

  const fireAuthUser = Auth.getFireAuthUserSnapshot();

  const {
    eventScheduleNormalized,
    eventScheduleValidationOk,
    notificationSettingsWithEmail,
  } = commonState;

  if (!eventScheduleValidationOk) return Result.ok(undefined);

  const email = notificationSettingsWithEmail?.email ?? '';

  setIsLoadingTrue();

  openCreateResultDialog();

  const res = await api.event.add({
    ...eventScheduleNormalized,
    author: {
      id: mapOptional(fireAuthUser?.uid, UserId.cast) ?? null,
      name: UserName.cast(fireAuthUser?.displayName ?? ''),
    },
  });

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
      if (!Result.isErr(res)) {
        return;
      }

      console.error(res.value);

      showToast({
        toast,
        message: dict.eventSettingsPage.createEventResultMessage.error,
        intent: 'danger',
      });
    })
    .catch(noop);
};

const onClipboardButtonClick = (): void => {
  const url = getUrlSnapshot();

  // eslint-disable-next-line unicorn/prefer-global-this
  const clipboard = window.navigator.clipboard;

  // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
  // eslint-disable-next-line unicorn/prefer-global-this
  if (window.isSecureContext) {
    // TODO: use toast
    clipboard.writeText(url).catch(console.error);
  }
};

/* subscriptions */

commonState$
  .pipe(debounce(500))
  .pipe(skip(1))
  .pipe(filter(isNotUndefined))
  .subscribe(saveToLocalStorage);

export const CreateEventScheduleStore = {
  closeCreateResultDialog,
  commonState$,
  commonStateHandlers,
  useCreateResultDialogIsOpen,
  hasNoChanges$,
  useIsLoading,
  onClipboardButtonClick,
  onCreateEventClick,
  resetAllState,
  restoreFromLocalStorage,
  useUrl,
} as const;
