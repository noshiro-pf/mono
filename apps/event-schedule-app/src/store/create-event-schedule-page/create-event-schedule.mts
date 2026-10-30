import type { Toaster } from '@blueprintjs/core';
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
import {
  Result,
  fastDeepEqual,
  isNotUndefined,
  mapNullable,
  pipe,
} from 'ts-data-forge';
import { compareYearMonthDate } from 'ts-fortress-types';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../../api/index.mjs';
import {
  Routes,
  dict,
  eventScheduleInitialValue,
} from '../../constants/index.mjs';
import {
  type EventScheduleAppLocalStorage,
  showToast,
} from '../../functions/index.mjs';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
} from '../../types/index.mjs';
import {
  type EventScheduleSettingUser,
  createEventScheduleSettingStore,
} from './event-schedule-setting-common.mjs';

export type CreateEventScheduleDeps = Readonly<{
  api: Readonly<{ event: StrictPick<Api['event'], 'add' | 'setAuthorsEmail'> }>;
  auth: Readonly<{
    fireAuthUser$: InitializedObservable<EventScheduleSettingUser | undefined>;
    getFireAuthUserSnapshot: () => EventScheduleSettingUser | undefined;
  }>;
  /** Where the settings being written survive a reload. */
  storage: Readonly<{
    restore: (typeof EventScheduleAppLocalStorage)['restoreCreateEventPageTemp'];
    save: (typeof EventScheduleAppLocalStorage)['saveCreateEventPageTemp'];
  }>;
  writeToClipboard: (text: string) => Promise<void>;
  toAbsolutePath: (relativePath: string) => string;
  /** Dates up to this one are not restored from storage. */
  now: () => Ymdhm;
  /** How long the settings have to stay still before they are saved. */
  saveDelayMs: number;
  /** Where the page says that creating the event failed. */
  toast: Promise<Toaster>;
}>;

/**
 * The create page: the settings being written, kept in local storage as they
 * change, and the event saved through `deps.api` with the link to it.
 */
export const createCreateEventScheduleStore = (
  deps: CreateEventScheduleDeps,
): CreateEventSchedule => {
  const { commonState$, commonStateHandlers } = createEventScheduleSettingStore(
    {
      fireAuthUser$: deps.auth.fireAuthUser$,
    },
  );

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
    const fromStorage = deps.storage.restore();

    if (Result.isErr(fromStorage)) {
      return;
    }

    const ev = fromStorage.value;

    if (ev === undefined) {
      return;
    }

    commonStateHandlers.setTitle(ev.title);

    commonStateHandlers.setNotes(ev.notes);

    commonStateHandlers.setDatetimeSpecification(ev.datetimeSpecification);

    // 過去日（今日含む）は復元しない
    commonStateHandlers.setDatetimeRangeList(
      ev.datetimeRangeList.filter(
        (d) => compareYearMonthDate(d.ymd, deps.now()) > 0,
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
        email: deps.auth.getFireAuthUserSnapshot()?.email ?? '',
      });
    }
  };

  const saveToLocalStorage = (
    commonState: EventScheduleSettingCommonState,
  ): void => {
    const saveResult = deps.storage.save({
      answerDeadline: commonState.answerDeadline ?? 'none',
      answerIcons: commonState.answerIcons,
      datetimeRangeList: commonState.datetimeRangeList,
      datetimeSpecification: commonState.datetimeSpecification,
      notes: commonState.notes,
      notificationSettings:
        pipe(commonState.notificationSettingsWithEmail).mapNullable(
          NotificationSettings.fill,
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

    const fireAuthUser = deps.auth.getFireAuthUserSnapshot();

    const {
      eventScheduleNormalized,
      eventScheduleValidationOk,
      notificationSettingsWithEmail,
    } = commonState;

    if (!eventScheduleValidationOk) {
      return Result.ok(undefined);
    }

    const email = notificationSettingsWithEmail?.email ?? '';

    setIsLoadingTrue();

    openCreateResultDialog();

    const res = await deps.api.event.add({
      ...eventScheduleNormalized,
      author: {
        id: mapNullable(fireAuthUser?.uid, UserId.cast) ?? null,
        name: UserName.cast(fireAuthUser?.displayName ?? ''),
      },
    });

    if (Result.isErr(res)) {
      return Result.err(res.value);
    }

    const eventId = res.value;

    if (email !== '') {
      const res2 = await deps.api.event.setAuthorsEmail(eventId, email);

      if (Result.isErr(res2)) {
        return Result.err(res2.value);
      }
    }

    setIsLoadingFalse();

    setUrl(deps.toAbsolutePath(`..${Routes.routes.answerPage(eventId)}`));

    // reset local storage
    deps.storage.save({
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
          toast: deps.toast,
          message: dict.eventSettingsPage.createEventResultMessage.error,
          intent: 'danger',
        });
      })
      .catch(() => {});
  };

  const onClipboardButtonClick = (): void => {
    const url = getUrlSnapshot();

    // TODO: use toast
    deps.writeToClipboard(url).catch(console.error);
  };

  /** Starts saving the settings as they change; returns what stops it. */
  const start = (): (() => void) => {
    const subscription = commonState$
      .pipe(debounce(deps.saveDelayMs))
      .pipe(skip(1))
      .pipe(filter(isNotUndefined))
      .subscribe(saveToLocalStorage);

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    start,
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
};

export type CreateEventSchedule = Readonly<{
  /** Starts saving the settings as they change; returns what stops it. */
  start: () => () => void;
  closeCreateResultDialog: () => void;
  commonState$: InitializedObservable<EventScheduleSettingCommonState>;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
  useCreateResultDialogIsOpen: () => boolean;
  hasNoChanges$: InitializedObservable<boolean>;
  useIsLoading: () => boolean;
  onClipboardButtonClick: () => void;
  onCreateEventClick: () => void;
  resetAllState: () => void;
  restoreFromLocalStorage: () => void;
  /** The link to the event just created. */
  useUrl: () => string;
}>;
