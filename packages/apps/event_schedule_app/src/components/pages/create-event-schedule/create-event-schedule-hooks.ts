import { useDataStream, useStreamValue } from '@mono/react-rxjs-utils';
import { useBooleanState } from '@mono/react-utils';
import { useCallback, useMemo, useState } from 'react';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { api } from '../../../api/api';
import { routePaths } from '../../../routing/routing';
import { DatetimeSpecificationEnumType } from '../../../types/enum/datetime-specification-type';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import {
  createINotificationSettings,
  INotificationSettings,
} from '../../../types/record/base/notification-settings';
import { IYearMonthDate } from '../../../types/record/base/year-month-date';
import { IDatetimeRange } from '../../../types/record/datetime-range';
import {
  createIEventSchedule,
  IEventSchedule,
} from '../../../types/record/event-schedule';
import { RequiredElementsOk } from '../../../types/record/required-elements-ok';
import { createIYmdHm, IYmdHm } from '../../../types/record/ymd-hm';
import { fetchHolidaysJson } from '../../../utils/fetch-holidays';
import { IList, IMap } from '../../../utils/immutable';
import { isEmailString } from '../../../utils/is-email-string';
import { ifthen } from '../../../utils/then';
import { toAbsolutePath } from '../../../utils/to-absolute-url';
import { ymdFromDate } from '../../../utils/ymdhm-from-date';
import {
  defaultAnswerDeadline,
  defaultAnswerSymbolList,
  defaultDatetimeRangeList,
  defaultNotificationSettings,
} from './default-values';
import { normalizeEventSchedule } from './normalize-event-schedule';
import { useToggleSectionState } from './use-toggle-section-state';

interface CreateEventScheduleHooks {
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  datetimeSpecification: DatetimeSpecificationEnumType;
  onDatetimeSpecificationChange: (value: DatetimeSpecificationEnumType) => void;
  datetimeRangeList: IList<IDatetimeRange>;
  onDatetimeListChange: (list: IList<IDatetimeRange>) => void;
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: IYmdHm | undefined;
  onAnswerDeadlineChange: (value: IYmdHm | undefined) => void;
  usePassword: boolean;
  onToggleUsePassword: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: IList<IAnswerSymbol>;
  onAnswerSymbolListValueChange: (value: IList<IAnswerSymbol>) => void;
  useNotification: boolean;
  onToggleUseNotification: () => void;
  notificationSettings: INotificationSettings;
  onNotificationSettingsChange: (value: INotificationSettings) => void;
  requiredElementsOk: RequiredElementsOk;
  onResetClick: () => void;
  createButtonIsEnabled: boolean;
  createButtonIsLoading: boolean;
  onCreateEventClick: () => void;
  createResultDialogIsOpen: boolean;
  closeCreateResultDialog: () => void;
  onClipboardButtonClick: () => void;
  url: string;
  isLoading: boolean;
  holidaysJpDefinition: IMap<IYearMonthDate, string>;
}

export const useCreateEventScheduleHooks = (): CreateEventScheduleHooks => {
  const [title, onTitleChange] = useState<string>('');
  const [notes, onNotesChange] = useState<string>('');

  const [
    // dummy comment to control prettier
    datetimeSpecification,
    onDatetimeSpecificationChange,
  ] = useState<DatetimeSpecificationEnumType>('startSpecified');

  const [
    // dummy comment to control prettier
    datetimeRangeList,
    onDatetimeListChange,
  ] = useState<IList<IDatetimeRange>>(defaultDatetimeRangeList);

  const [
    useAnswerDeadline,
    setUseAnswerDeadline,
    onToggleAnswerDeadline,
    answerDeadline,
    setAnswerDeadline,
    resetAnswerDeadline,
  ] = useToggleSectionState<IYmdHm | undefined>(
    undefined,
    defaultAnswerDeadline
  );

  const [
    usePassword,
    setUsePassword,
    onToggleUsePassword,
    password,
    setPassword,
    resetPassword,
  ] = useToggleSectionState<string>('');

  const [
    customizeSymbolSettings,
    setCustomizeSymbolSettings,
    onToggleCustomizeSymbolSettings,
    answerSymbolList,
    setAnswerSymbolList,
    resetAnswerSymbolList,
  ] = useToggleSectionState<IList<IAnswerSymbol>>(defaultAnswerSymbolList);

  const [
    useNotification,
    setUseNotification,
    onToggleUseNotification,
    notificationSettings,
    setNotificationSettings,
    resetNotificationSettings,
  ] = useToggleSectionState<INotificationSettings>(
    createINotificationSettings(),
    defaultNotificationSettings
  );

  const requiredElementsOk = useMemo<RequiredElementsOk>(
    () => ({
      title: title !== '',
      datetimeRangeList: !datetimeRangeList.isEmpty(),
      answerDeadline: ifthen(useAnswerDeadline, answerDeadline !== undefined),
      password: ifthen(usePassword, password !== ''),
      answerSymbolList: answerSymbolList.size >= 2,
      notificationEmail: ifthen(
        useNotification,
        isEmailString(notificationSettings.email)
      ),
      notificationItems: ifthen(
        useNotification,
        notificationSettings.notifyOnAnswerChange ||
          notificationSettings.notify01daysBeforeAnswerDeadline ||
          notificationSettings.notify03daysBeforeAnswerDeadline ||
          notificationSettings.notify07daysBeforeAnswerDeadline ||
          notificationSettings.notify14daysBeforeAnswerDeadline ||
          notificationSettings.notify28daysBeforeAnswerDeadline
      ),
    }),
    [
      title,
      datetimeRangeList,
      useAnswerDeadline,
      answerDeadline,
      usePassword,
      password,
      answerSymbolList,
      useNotification,
      notificationSettings,
    ]
  );

  const allRequiredElementsOk =
    requiredElementsOk.title &&
    requiredElementsOk.datetimeRangeList &&
    requiredElementsOk.answerDeadline &&
    requiredElementsOk.password &&
    requiredElementsOk.answerSymbolList &&
    requiredElementsOk.notificationEmail &&
    requiredElementsOk.notificationItems;

  const [isLoading, setIsLoadingTrue, setIsLoadingFalse] = useBooleanState(
    false
  );

  const [
    createResultDialogIsOpen,
    openCreateResultDialog,
    closeCreateResultDialog,
  ] = useBooleanState(false);

  const [url, setUrl] = useState<string>('');

  const onCreateEventClick = useCallback(() => {
    if (!allRequiredElementsOk) return;
    const eventSchedule: IEventSchedule = normalizeEventSchedule(
      createIEventSchedule({
        title,
        notes,
        datetimeSpecification,
        datetimeRangeList,
        useAnswerDeadline,
        answerDeadline: answerDeadline ?? createIYmdHm(),
        usePassword,
        password,
        answerSymbolList,
        useNotification,
        notificationSettings,
      })
    );

    setIsLoadingTrue();
    openCreateResultDialog();
    api.event
      .add(eventSchedule)
      .then((id) => {
        setIsLoadingFalse();
        setUrl(toAbsolutePath(`..${routePaths.answerPage}/${id}`));
      })
      .catch((error) => {
        console.error('Error creating event schedule: ', error);
      });
  }, [
    allRequiredElementsOk,
    title,
    notes,
    datetimeSpecification,
    datetimeRangeList,
    useAnswerDeadline,
    answerDeadline,
    usePassword,
    password,
    answerSymbolList,
    useNotification,
    notificationSettings,
    setIsLoadingTrue,
    setIsLoadingFalse,
    openCreateResultDialog,
  ]);

  const onClipboardButtonClick = useCallback(() => {
    navigator.clipboard.writeText(url).catch(console.error);
  }, [url]);

  const createButtonIsEnabled = allRequiredElementsOk;
  const createButtonIsLoading = isLoading;

  const onResetClick = useCallback(() => {
    onTitleChange('');
    onNotesChange('');
    onDatetimeSpecificationChange('startSpecified');
    onDatetimeListChange(defaultDatetimeRangeList);
    setUseAnswerDeadline(false);
    resetAnswerDeadline();
    setUsePassword(false);
    resetPassword();
    setCustomizeSymbolSettings(false);
    resetAnswerSymbolList();
    setUseNotification(false);
    resetNotificationSettings();
  }, [
    setUseAnswerDeadline,
    resetAnswerDeadline,
    setUsePassword,
    resetPassword,
    setCustomizeSymbolSettings,
    resetAnswerSymbolList,
    setUseNotification,
    resetNotificationSettings,
  ]);

  const holidaysJpDefinition$ = useDataStream<IMap<IYearMonthDate, string>>(
    IMap<IYearMonthDate, string>(),
    from(fetchHolidaysJson()).pipe(
      map((record) =>
        IMap(
          Object.keys(record).map((key) => [
            ymdFromDate(new Date(key)),
            record[key],
          ])
        )
      )
    )
  );

  const holidaysJpDefinition = useStreamValue<IMap<IYearMonthDate, string>>(
    holidaysJpDefinition$,
    IMap<IYearMonthDate, string>()
  );

  return {
    title: title,
    onTitleChange: onTitleChange,
    notes: notes,
    onNotesChange: onNotesChange,
    datetimeSpecification: datetimeSpecification,
    onDatetimeSpecificationChange: onDatetimeSpecificationChange,
    datetimeRangeList: datetimeRangeList,
    onDatetimeListChange: onDatetimeListChange,
    useAnswerDeadline: useAnswerDeadline,
    onToggleAnswerDeadline: onToggleAnswerDeadline,
    answerDeadline: answerDeadline,
    onAnswerDeadlineChange: setAnswerDeadline,
    usePassword: usePassword,
    onToggleUsePassword: onToggleUsePassword,
    password: password,
    onPasswordChange: setPassword,
    customizeSymbolSettings: customizeSymbolSettings,
    onToggleCustomizeSymbolSettings: onToggleCustomizeSymbolSettings,
    answerSymbolList: answerSymbolList,
    onAnswerSymbolListValueChange: setAnswerSymbolList,
    useNotification: useNotification,
    onToggleUseNotification: onToggleUseNotification,
    notificationSettings: notificationSettings,
    onNotificationSettingsChange: setNotificationSettings,
    requiredElementsOk: requiredElementsOk,
    createButtonIsEnabled: createButtonIsEnabled,
    createButtonIsLoading: createButtonIsLoading,
    onCreateEventClick: onCreateEventClick,
    createResultDialogIsOpen: createResultDialogIsOpen,
    onResetClick: onResetClick,
    closeCreateResultDialog: closeCreateResultDialog,
    onClipboardButtonClick: onClipboardButtonClick,
    url: url,
    isLoading: isLoading,
    holidaysJpDefinition: holidaysJpDefinition,
  };
};
