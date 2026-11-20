import {
  NotificationSettings,
  UserId,
  UserName,
} from 'event-schedule-app-shared';
import {
  type InitializedObservable,
  createReducer,
  debounce,
  derive,
  filter,
  map,
  skip,
} from 'synstate';
import {
  Arr,
  Optional,
  Result,
  fastDeepEqual,
  isNotUndefined,
  mapNullable,
  pipe,
} from 'ts-data-forge';
import { compareYearMonthDate } from 'ts-fortress-types';
import { defineMachine } from 'ts-fsm-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../../api/index.mjs';
import { dict, routes } from '../../constants/index.mjs';
import {
  type EventScheduleAppLocalStorage,
  normalizeEventSchedule,
  notificationEmailToSave,
  showToast,
} from '../../functions/index.mjs';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
} from '../../types/index.mjs';
import type { AppRouter } from '../router-store.mjs';
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
  router: StrictPick<AppRouter, 'absoluteUrlOf'>;
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
  const { commonState$, commonStateHandlers, baseline$, startVisit } =
    createEventScheduleSettingStore({
      fireAuthUser$: deps.auth.fireAuthUser$,
    });

  const hasNoChanges$: InitializedObservable<boolean> = derive(
    [baseline$, commonState$],
    // The form is compared as it would be saved: normalized, and written by
    // whoever is signed in. The empty form as built is neither.
    (baseline, { eventScheduleNormalized }) =>
      fastDeepEqual(
        normalizeEventSchedule({
          ...baseline,
          author: eventScheduleNormalized.author,
        }),
        eventScheduleNormalized,
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
      console.warn(fromStorage.value);

      return;
    }

    const ev = fromStorage.value;

    if (ev === undefined) {
      return;
    }

    commonStateHandlers.setTitle(ev.title);

    commonStateHandlers.setNotes(ev.notes);

    commonStateHandlers.setDatetimeSpecification(ev.datetimeSpecification);

    // 過去日（今日含む）は復元しない。一つも残らなければ、空のフォームの日付
    // （今日）のままにする。イベントを作成したときに保存される下書きは空の
    // フォームで、その日付は作成した日なので、次の訪問では必ず一つも残らない。
    const upcomingDates = ev.datetimeRangeList.filter(
      (d) => compareYearMonthDate(d.ymd, deps.now()) > 0,
    );

    if (Arr.isNonEmpty(upcomingDates)) {
      commonStateHandlers.setDatetimeRangeList(upcomingDates);
    }

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

  const [creation$, dispatchCreation, { getSnapshot: getCreation }] =
    createReducer(creationMachine.reducer, idle);

  const isLoading$ = creation$.pipe(map((c) => c.type === 'creating'));

  const createResultDialogIsOpen$ = creation$.pipe(
    map((c) => c.type !== 'idle'),
  );

  const url$ = creation$.pipe(map((c) => (c.type === 'created' ? c.url : '')));

  const closeCreateResultDialog = (): void => {
    dispatchCreation({ type: 'close' });
  };

  const createEvent = async (): Promise<Result<undefined, string>> => {
    const commonState = Optional.unwrap(commonState$.getSnapshot());

    const fireAuthUser = deps.auth.getFireAuthUserSnapshot();

    const { eventScheduleNormalized, eventScheduleValidationOk } = commonState;

    if (
      !eventScheduleValidationOk ||
      !creationMachine.can(getCreation(), 'create')
    ) {
      return Result.ok(undefined);
    }

    const email = notificationEmailToSave(commonState) ?? '';

    dispatchCreation({ type: 'create' });

    // `deps.api` returns every failure as an `Err` (`Result.fromPromise`), so
    // each call settles, and `failed` or `succeeded` follows.
    const res = await deps.api.event.add({
      ...eventScheduleNormalized,
      author: {
        id: mapNullable(fireAuthUser?.uid, UserId.cast) ?? null,
        name: UserName.cast(fireAuthUser?.displayName ?? ''),
      },
    });

    if (Result.isErr(res)) {
      dispatchCreation({ type: 'failed' });

      return Result.err(res.value);
    }

    const eventId = res.value;

    if (email !== '') {
      const res2 = await deps.api.event.setAuthorsEmail(eventId, email);

      if (Result.isErr(res2)) {
        dispatchCreation({ type: 'failed' });

        return Result.err(res2.value);
      }
    }

    dispatchCreation({
      type: 'succeeded',
      url: deps.router.absoluteUrlOf(routes.event.answer.href({ eventId })),
    });

    // reset local storage
    const baseline = Optional.unwrap(baseline$.getSnapshot());

    const resetResult = deps.storage.save({
      answerDeadline: baseline.answerDeadline,
      answerIcons: baseline.answerIcons,
      datetimeRangeList: baseline.datetimeRangeList,
      datetimeSpecification: baseline.datetimeSpecification,
      notes: baseline.notes,
      notificationSettings: baseline.notificationSettings,
      title: baseline.title,
    });

    if (Result.isErr(resetResult)) {
      console.warn(resetResult.value);
    }

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
    const creation = getCreation();

    if (creation.type !== 'created') {
      return;
    }

    // TODO: use toast
    deps.writeToClipboard(creation.url).catch(console.error);
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

  const enter = (): void => {
    startVisit();

    restoreFromLocalStorage();
  };

  return {
    start,
    enter,
    isLoading$,
    createResultDialogIsOpen$,
    url$,
    closeCreateResultDialog,
    commonState$,
    commonStateHandlers,
    hasNoChanges$,
    onClipboardButtonClick,
    onCreateEventClick,
    resetAllState,
    restoreFromLocalStorage,
  } as const;
};

/**
 * Creating the event, as the result dialog shows it: closed, a spinner while
 * the event is saved, then its link. A failure closes the dialog again (a toast
 * says why), so that the page is never left behind a spinner with the dialog's
 * buttons disabled; a second create is not started while one is in progress.
 */
type Creation = Readonly<
  { type: 'created'; url: string } | { type: 'creating' } | { type: 'idle' }
>;

type CreationAction = Readonly<
  | { type: 'close' }
  | { type: 'create' }
  | { type: 'failed' }
  | { type: 'succeeded'; url: string }
>;

const idle: Creation = { type: 'idle' } as const;

const creationMachine = defineMachine<Creation, CreationAction>()(
  {
    idle: { create: 'creating' },
    creating: { succeeded: 'created', failed: 'idle' },
    created: { close: 'idle' },
  },
  {
    idle: { create: () => ({ type: 'creating' }) },
    creating: {
      succeeded: (_s, a) => ({ type: 'created', url: a.url }),
      failed: () => idle,
    },
    created: { close: () => idle },
  },
);

export type CreateEventSchedule = Readonly<{
  /** Starts saving the settings as they change; returns what stops it. */
  start: () => () => void;
  /**
   * Called when the page is entered: builds the empty form from today, then
   * restores what local storage kept.
   */
  enter: () => void;
  isLoading$: InitializedObservable<boolean>;
  createResultDialogIsOpen$: InitializedObservable<boolean>;
  /** The link to the event just created. */
  url$: InitializedObservable<string>;
  closeCreateResultDialog: () => void;
  commonState$: InitializedObservable<EventScheduleSettingCommonState>;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
  hasNoChanges$: InitializedObservable<boolean>;
  onClipboardButtonClick: () => void;
  onCreateEventClick: () => void;
  resetAllState: () => void;
  restoreFromLocalStorage: () => void;
}>;
