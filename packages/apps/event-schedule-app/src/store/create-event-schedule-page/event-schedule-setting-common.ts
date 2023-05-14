import {
  eventScheduleDefaultValue,
  toUserId,
  toUserName,
} from '@noshiro/event-schedule-app-shared';
import {
  answerDeadlineInitialValue,
  datetimeRangeListInitialValue,
  eventScheduleInitialValue,
  notificationSettingsInitialValue,
} from '../../constants';
import {
  normalizeEventSchedule,
  validateEventSchedule,
  validateEventScheduleAll,
} from '../../functions';
import {
  type EventScheduleSettingCommonState,
  type EventScheduleSettingCommonStateHandler,
  type EventScheduleValidation,
  type NotificationSettingsWithEmail,
} from '../../types';
import { mapNoneToUndefined } from '../../utils';
import { Auth } from '../auth';
import { createToggleSectionState } from '../utils';

type ReturnValues = Readonly<{
  commonState$: InitializedObservable<EventScheduleSettingCommonState>;
  commonStateHandlers: EventScheduleSettingCommonStateHandler;
}>;

export const createEventScheduleSettingStore = (): ReturnValues => {
  const {
    state$: title$,
    setState: setTitle,
    resetState: resetTitle,
  } = createState<string>(eventScheduleInitialValue.title);

  const {
    state$: notes$,
    setState: setNotes,
    resetState: resetNotes,
  } = createState<string>(eventScheduleInitialValue.notes);

  const {
    state$: datetimeSpecification$,
    setState: setDatetimeSpecification,
    resetState: resetDatetimeSpecification,
  } = createState<DatetimeSpecificationEnumType>(
    eventScheduleInitialValue.datetimeSpecification
  );

  const {
    state$: datetimeRangeList$,
    setState: setDatetimeRangeList,
    resetState: resetDatetimeRangeList,
  } = createState<readonly DatetimeRange[]>(
    eventScheduleInitialValue.datetimeRangeList
  );

  const {
    toggleState$: useAnswerDeadline$,
    toggle: toggleAnswerDeadlineSection,
    value$: answerDeadline$,
    setValue: setAnswerDeadline,
    resetState: resetAnswerDeadlineSection,
    turnOff: turnOffAnswerDeadlineSection,
    turnOn: turnOnAnswerDeadlineSection,
  } = createToggleSectionState<Ymdhm | undefined>({
    initialToggleState: eventScheduleInitialValue.answerDeadline !== 'none',
    initialState: mapNoneToUndefined(eventScheduleInitialValue.answerDeadline),
    valueToBeSetWhenTurnedOff: () => undefined,
    valueToBeSetWhenTurnedOn: () => answerDeadlineInitialValue,
  });

  const {
    state$: answerIcons$,
    setState: setAnswerIcons,
    resetState: resetAnswerIcons,
  } = createState<AnswerIconSettings>(eventScheduleInitialValue.answerIcons);

  const initialNotificationSettingsWithEmailFilled$ = Auth.fireAuthUser$.chain(
    mapI((user) => ({
      ...notificationSettingsInitialValue,
      email: user?.email ?? '',
    }))
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
    initialToggleState:
      eventScheduleInitialValue.notificationSettings !== 'none',
    initialState: pipe(
      mapNoneToUndefined(eventScheduleInitialValue.notificationSettings)
    ).chainOptional((a) => ({
      ...a,
      email: '',
    })).value,
    valueToBeSetWhenTurnedOff: () => undefined,
    valueToBeSetWhenTurnedOn: () =>
      initialNotificationSettingsWithEmailFilled$.snapshot.value,
  });

  const setNotificationSettings = (a: NotificationSettings): void => {
    updateNotificationSettingsWithEmail((b) => ({
      ...a,
      email: b?.email ?? '',
    }));
  };

  const eventScheduleNormalized$: InitializedObservable<EventSchedule> =
    combineLatestI([
      title$,
      notes$,
      datetimeSpecification$,
      datetimeRangeList$,
      answerDeadline$,
      answerIcons$,
      notificationSettingsWithEmail$,
      Auth.fireAuthUser$,
    ]).chain(
      mapI(
        ([
          title,
          notes,
          datetimeSpecification,
          datetimeRangeList,
          answerDeadline,
          answerIcons,
          notificationSettingsWithEmail,
          fireAuthUser,
        ]) =>
          normalizeEventSchedule({
            title,
            notes,
            datetimeSpecification,
            datetimeRangeList: Arr.isNonEmpty(datetimeRangeList)
              ? datetimeRangeList
              : datetimeRangeListInitialValue,
            answerDeadline: answerDeadline ?? 'none',
            answerIcons,
            notificationSettings:
              notificationSettingsWithEmail === undefined
                ? 'none'
                : Obj.removeProperties(notificationSettingsWithEmail, [
                    'email',
                  ]),
            timezoneOffsetMinutes:
              eventScheduleDefaultValue.timezoneOffsetMinutes,
            author: {
              id: mapOptional(fireAuthUser?.uid, toUserId) ?? null,
              name: toUserName(fireAuthUser?.displayName ?? ''),
            },
            archivedBy: [],
          })
      )
    );

  const eventScheduleValidation$: InitializedObservable<EventScheduleValidation> =
    combineLatestI([
      title$,
      datetimeRangeList$,
      answerIcons$,
      notificationSettingsWithEmail$,
    ]).chain(
      mapI(
        ([
          title,
          datetimeRangeList,
          answerIcons,
          notificationSettingsWithEmail,
        ]) =>
          validateEventSchedule({
            title,
            datetimeRangeList,
            answerIcons,
            notificationSettingsWithEmail:
              notificationSettingsWithEmail ?? 'none',
          })
      )
    );

  const eventScheduleValidationOk$ = eventScheduleValidation$.chain(
    mapI(validateEventScheduleAll)
  );

  const commonState$: InitializedObservable<EventScheduleSettingCommonState> =
    combineLatestI([
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
    ]).chain(
      mapI(
        ([
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
        ]) => ({
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
        })
      )
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
  };

  return {
    commonState$,
    commonStateHandlers,
  };
};
