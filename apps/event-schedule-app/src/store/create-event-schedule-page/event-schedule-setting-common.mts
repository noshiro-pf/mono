import {
  type EventSchedule,
  UserId,
  UserName,
} from 'event-schedule-app-shared';
import { type InitializedObservable, createState, derive, map } from 'synstate';
import { Arr, Obj, Optional, mapNullable, pipe } from 'ts-data-forge';
import {
  answerDeadlineInitialValue,
  eventScheduleInitialValue,
  notificationSettingsInitialValue,
} from '../../constants/index.mjs';
import {
  normalizeEventSchedule,
  validateEventSchedule,
  validateEventScheduleAll,
} from '../../functions/index.mjs';
import type {
  EventScheduleSettingCommonState,
  EventScheduleSettingCommonStateHandler,
  EventScheduleValidation,
  NotificationSettingsWithEmail,
} from '../../types/index.mjs';
import { mapNoneToUndefined } from '../../utils/index.mjs';
import { createToggleSectionState } from '../utils/index.mjs';

type ReturnValues = Readonly<{
  commonState$: InitializedObservable<EventScheduleSettingCommonState>;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
  /** The empty form of this visit: what the resets return to. */
  baseline$: InitializedObservable<EventSchedule>;
  /** Builds the empty form anew, from today, and resets every field to it. */
  startVisit: () => void;
}>;

export type EventScheduleSettingDeps = Readonly<{
  /** The signed-in user: the event's author, and the email notified by default. */
  fireAuthUser$: InitializedObservable<EventScheduleSettingUser | undefined>;
}>;

export const createEventScheduleSettingStore = (
  deps: EventScheduleSettingDeps,
): ReturnValues => {
  // Per visit, not per store, which lives as long as the tab: a tab left open
  // past midnight would otherwise offer, and reset to, the day it was loaded.
  const [baseline$, setBaseline, { getSnapshot: getBaseline }] =
    createState<EventSchedule>(eventScheduleInitialValue());

  const initial = getBaseline();

  const [title$, setTitle] = createState<string>(initial.title);

  const resetTitle = (): void => {
    setTitle(getBaseline().title);
  };

  const [notes$, setNotes] = createState<string>(initial.notes);

  const resetNotes = (): void => {
    setNotes(getBaseline().notes);
  };

  const [datetimeSpecification$, setDatetimeSpecification] =
    createState<DatetimeSpecificationEnumType>(initial.datetimeSpecification);

  const resetDatetimeSpecification = (): void => {
    setDatetimeSpecification(getBaseline().datetimeSpecification);
  };

  const [datetimeRangeList$, setDatetimeRangeList] = createState<
    readonly DatetimeRange[]
  >(initial.datetimeRangeList);

  const resetDatetimeRangeList = (): void => {
    setDatetimeRangeList(getBaseline().datetimeRangeList);
  };

  const {
    toggleState$: useAnswerDeadline$,
    toggle: toggleAnswerDeadlineSection_,
    value$: answerDeadline$,
    setValue: setAnswerDeadline,
    resetState: resetAnswerDeadlineSection,
    turnOff: turnOffAnswerDeadlineSection_,
    turnOn: turnOnAnswerDeadlineSection,
  } = createToggleSectionState<Ymdhm | undefined>({
    // The empty form has no deadline and no notifications on any day, so these
    // two sections reset to their initial state.
    initialToggleState: initial.answerDeadline !== 'none',
    initialState: mapNoneToUndefined(initial.answerDeadline),
    valueToBeSetWhenTurnedOff: () => undefined,
    valueToBeSetWhenTurnedOn: answerDeadlineInitialValue,
  });

  const [answerIcons$, setAnswerIcons] = createState<AnswerIconSettings>(
    initial.answerIcons,
  );

  const resetAnswerIcons = (): void => {
    setAnswerIcons(getBaseline().answerIcons);
  };

  const initialNotificationSettingsWithEmailFilled$ = derive(
    [deps.fireAuthUser$, answerDeadline$],
    (user, answerDeadline) => ({
      ...notificationSettingsInitialValue,
      email: user?.email ?? '',
      notifyAfterAnswerDeadline: answerDeadline !== undefined,
      notify00daysBeforeAnswerDeadline: answerDeadline !== undefined,
    }),
  );

  const {
    toggleState$: useNotification$,
    toggle: toggleNotificationSection,
    value$: notificationSettingsWithEmail$,
    setValue: setNotificationSettingsWithEmail,
    updateValue: updateNotificationSettingsWithEmail,
    resetState: resetNotificationSettingsSection,
    turnOff: turnOffNotificationSection,
    turnOn: turnOnNotificationSection,
  } = createToggleSectionState<NotificationSettingsWithEmail | undefined>({
    initialToggleState: initial.notificationSettings !== 'none',
    initialState: pipe(
      mapNoneToUndefined(initial.notificationSettings),
    ).mapNullable((a) => ({ ...a, email: '' })).value,
    valueToBeSetWhenTurnedOff: () => undefined,
    valueToBeSetWhenTurnedOn: () =>
      Optional.unwrap(
        initialNotificationSettingsWithEmailFilled$.getSnapshot(),
      ),
  });

  // 回答期限をオフにしたら通知設定の回答期限関連のチェックもオフにする
  const toggleAnswerDeadlineSection = (): void => {
    toggleAnswerDeadlineSection_();

    if (!Optional.unwrap(useAnswerDeadline$.getSnapshot())) {
      updateNotificationSettingsWithEmail((prev) =>
        prev === undefined
          ? prev
          : {
              email: prev.email,
              notifyOnAnswerChange: prev.notifyOnAnswerChange,
              notifyAfterAnswerDeadline: false,
              notify00daysBeforeAnswerDeadline: false,
              notify01daysBeforeAnswerDeadline: false,
              notify03daysBeforeAnswerDeadline: false,
              notify07daysBeforeAnswerDeadline: false,
              notify14daysBeforeAnswerDeadline: false,
              notify28daysBeforeAnswerDeadline: false,
            },
      );
    }
  };

  // 回答期限をオフにしたら通知設定の回答期限関連のチェックもオフにする
  const turnOffAnswerDeadlineSection = (): void => {
    turnOffAnswerDeadlineSection_();

    updateNotificationSettingsWithEmail((prev) =>
      prev === undefined
        ? prev
        : {
            email: prev.email,
            notifyOnAnswerChange: prev.notifyOnAnswerChange,
            notifyAfterAnswerDeadline: false,
            notify00daysBeforeAnswerDeadline: false,
            notify01daysBeforeAnswerDeadline: false,
            notify03daysBeforeAnswerDeadline: false,
            notify07daysBeforeAnswerDeadline: false,
            notify14daysBeforeAnswerDeadline: false,
            notify28daysBeforeAnswerDeadline: false,
          },
    );
  };

  const setNotificationSettings = (a: NotificationSettings): void => {
    updateNotificationSettingsWithEmail((b) => ({
      ...a,
      email: b?.email ?? '',
    }));
  };

  const eventScheduleNormalized$: InitializedObservable<EventSchedule> = derive(
    [
      title$,
      notes$,
      datetimeSpecification$,
      datetimeRangeList$,
      answerDeadline$,
      answerIcons$,
      notificationSettingsWithEmail$,
      deps.fireAuthUser$,
      baseline$,
    ],
    (
      title,
      notes,
      datetimeSpecification,
      datetimeRangeList,
      answerDeadline,
      answerIcons,
      notificationSettingsWithEmail,
      fireAuthUser,
      baseline,
    ) =>
      normalizeEventSchedule({
        title,
        notes,
        datetimeSpecification,
        datetimeRangeList: Arr.isNonEmpty(datetimeRangeList)
          ? datetimeRangeList
          : baseline.datetimeRangeList,
        answerDeadline: answerDeadline ?? 'none',
        answerIcons,
        notificationSettings:
          notificationSettingsWithEmail === undefined
            ? 'none'
            : Obj.omit(notificationSettingsWithEmail, ['email']),
        timezoneOffsetMinutes: baseline.timezoneOffsetMinutes,
        author: {
          id: mapNullable(fireAuthUser?.uid, UserId.cast) ?? null,
          name: UserName.cast(fireAuthUser?.displayName ?? ''),
        },
        archivedBy: [],
      }),
  );

  const eventScheduleValidation$: InitializedObservable<EventScheduleValidation> =
    derive(
      [
        title$,
        datetimeRangeList$,
        answerIcons$,
        notificationSettingsWithEmail$,
      ],
      (title, datetimeRangeList, answerIcons, notificationSettingsWithEmail) =>
        validateEventSchedule({
          title,
          datetimeRangeList,
          answerIcons,
          notificationSettingsWithEmail:
            notificationSettingsWithEmail ?? 'none',
        }),
    );

  const eventScheduleValidationOk$ = eventScheduleValidation$.pipe(
    map(validateEventScheduleAll),
  );

  const commonState$: InitializedObservable<EventScheduleSettingCommonState> =
    derive(
      [
        title$,
        notes$,
        datetimeSpecification$,
        datetimeRangeList$,
        useAnswerDeadline$,
        answerDeadline$,
        answerIcons$,
        useNotification$,
        notificationSettingsWithEmail$,
        eventScheduleValidation$,
        eventScheduleNormalized$,
        eventScheduleValidationOk$,
      ],
      (
        title,
        notes,
        datetimeSpecification,
        datetimeRangeList,
        useAnswerDeadline,
        answerDeadline,
        answerIcons,
        useNotification,
        notificationSettingsWithEmail,
        eventScheduleValidation,
        eventScheduleNormalized,
        eventScheduleValidationOk,
      ) => ({
        title,
        notes,
        datetimeSpecification,
        datetimeRangeList,
        useAnswerDeadline,
        answerDeadline,
        answerIcons,
        useNotification,
        notificationSettingsWithEmail,
        eventScheduleValidation,
        eventScheduleNormalized,
        eventScheduleValidationOk,
      }),
    );

  const commonStateHandlers: EventScheduleSettingCommonStateHandler = {
    setTitle,
    resetTitle,

    setNotes,
    resetNotes,

    setDatetimeSpecification,
    resetDatetimeSpecification,

    setDatetimeRangeList,
    resetDatetimeRangeList,

    toggleAnswerDeadlineSection,
    setAnswerDeadline,
    resetAnswerDeadlineSection,
    turnOffAnswerDeadlineSection,
    turnOnAnswerDeadlineSection,

    setAnswerIcons,
    resetAnswerIcons,

    toggleNotificationSection,
    setNotificationSettings,
    setNotificationSettingsWithEmail,
    resetNotificationSettingsSection,
    turnOffNotificationSection,
    turnOnNotificationSection,
  } as const;

  const startVisit = (): void => {
    setBaseline(eventScheduleInitialValue());

    resetTitle();

    resetNotes();

    resetDatetimeSpecification();

    resetDatetimeRangeList();

    resetAnswerDeadlineSection();

    resetNotificationSettingsSection();

    resetAnswerIcons();
  };

  return { commonState$, commonStateHandlers, baseline$, startVisit };
};

/** What the settings read of the signed-in user. */
export type EventScheduleSettingUser = Readonly<{
  uid: string;
  displayName: string | null;
  email: string | null;
}>;
