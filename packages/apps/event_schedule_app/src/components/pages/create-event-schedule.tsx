import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../api/api';
import { texts } from '../../constants/texts';
import { routePaths } from '../../routing/routing';
import { DatetimeSpecificationEnumType } from '../../types/enum/datetime-specification-type';
import {
  createIAnswerSymbol,
  IAnswerSymbol,
} from '../../types/record/base/answer-symbol';
import {
  createIDatetimeRange,
  IDatetimeRange,
} from '../../types/record/datetime-range';
import {
  createIEventSchedule,
  IEventSchedule,
} from '../../types/record/event-schedule';
import { createIYmdHm, IYmdHm } from '../../types/record/ymd-hm';
import { IList } from '../../utils/immutable';
import { ifthen } from '../../utils/then';
import { toAbsolutePath } from '../../utils/to-absolute-url';
import { CreateEventScheduleView } from './create-event-schedule-view';
import { normalizeEventSchedule } from './normalize-event-schedule';

const datetimeRangeListDefault: IList<IDatetimeRange> = IList([
  createIDatetimeRange(),
]);

const answerSymbolListDefault: IList<IAnswerSymbol> = IList([
  createIAnswerSymbol({
    iconId: 'handmade-circle',
    description: texts.symbolDescriptionDefault.circle,
    point: 10,
  }),
  createIAnswerSymbol({
    iconId: 'handmade-triangle',
    description: texts.symbolDescriptionDefault.triangleUp,
    point: 5,
  }),
  createIAnswerSymbol({
    iconId: 'handmade-cross',
    description: texts.symbolDescriptionDefault.cross,
    point: 0,
  }),
]);

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => {
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
  ] = useState<IList<IDatetimeRange>>(datetimeRangeListDefault);

  const [useAnswerDeadline, setUseAnswerDeadline] = useState<boolean>(false);
  const onToggleAnswerDeadline = useCallback(() => {
    setUseAnswerDeadline((b) => !b);
  }, []);
  const [
    // dummy comment to control prettier
    answerDeadline,
    onAnswerDeadlineChange,
  ] = useState<IYmdHm | undefined>(undefined);
  useEffect(() => {
    if (!useAnswerDeadline) {
      onAnswerDeadlineChange(undefined);
    }
  }, [useAnswerDeadline]);

  const [usePassword, setUsePassword] = useState<boolean>(false);
  const onToggleUsePassword = useCallback(() => {
    setUsePassword((b) => !b);
  }, []);
  const [password, onPasswordChange] = useState<string>('');
  useEffect(() => {
    if (!usePassword) {
      onPasswordChange('');
    }
  }, [usePassword]);

  const [
    //
    customizeSymbolSettings,
    setCustomizeSymbolSettings,
  ] = useState<boolean>(false);
  const onToggleCustomizeSymbolSettings = useCallback(() => {
    setCustomizeSymbolSettings((b) => !b);
  }, []);

  const [
    // dummy comment to control prettier
    answerSymbolList,
    onAnswerSymbolListChange,
  ] = useState<IList<IAnswerSymbol>>(answerSymbolListDefault);

  const requiredElementsOk = useMemo(
    () => ({
      title: title !== '',
      datetimeRangeList: !datetimeRangeList.isEmpty(),
      answerDeadline: ifthen(useAnswerDeadline, answerDeadline !== undefined),
      password: ifthen(usePassword, password !== ''),
      answerSymbolList: answerSymbolList.size >= 2,
    }),
    [
      title,
      datetimeRangeList,
      useAnswerDeadline,
      answerDeadline,
      usePassword,
      password,
      answerSymbolList,
    ]
  );

  const allRequiredElementsOk =
    requiredElementsOk.title &&
    requiredElementsOk.datetimeRangeList &&
    requiredElementsOk.answerDeadline &&
    requiredElementsOk.password &&
    requiredElementsOk.answerSymbolList;

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
        answerSymbolList: answerSymbolList,
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
    setIsLoadingTrue,
    setIsLoadingFalse,
    openCreateResultDialog,
  ]);

  const onClipboardButtonClick = useCallback(() => {
    navigator.clipboard.writeText(url).catch(console.error);
  }, [url]);

  const discardAndCloseCreateResultDialog = useCallback(() => {
    closeCreateResultDialog();
    // TODO: delete event page
  }, [closeCreateResultDialog]);

  const createButtonIsEnabled = allRequiredElementsOk;
  const createButtonIsLoading = isLoading;

  const onResetClick = useCallback(() => {
    onTitleChange('');
    onNotesChange('');
    onDatetimeSpecificationChange('startSpecified');
    onDatetimeListChange(datetimeRangeListDefault);
    setUseAnswerDeadline(false);
    onAnswerDeadlineChange(undefined);
    setUsePassword(false);
    onPasswordChange('');
    setCustomizeSymbolSettings(false);
    onAnswerSymbolListChange(answerSymbolListDefault);
  }, []);

  return (
    <CreateEventScheduleView
      title={title}
      onTitleChange={onTitleChange}
      notes={notes}
      onNotesChange={onNotesChange}
      datetimeSpecification={datetimeSpecification}
      onDatetimeSpecificationChange={onDatetimeSpecificationChange}
      datetimeRangeList={datetimeRangeList}
      onDatetimeListChange={onDatetimeListChange}
      useAnswerDeadline={useAnswerDeadline}
      onToggleAnswerDeadline={onToggleAnswerDeadline}
      answerDeadline={answerDeadline}
      onAnswerDeadlineChange={onAnswerDeadlineChange}
      usePassword={usePassword}
      onToggleUsePassword={onToggleUsePassword}
      password={password}
      onPasswordChange={onPasswordChange}
      customizeSymbolSettings={customizeSymbolSettings}
      onToggleCustomizeSymbolSettings={onToggleCustomizeSymbolSettings}
      answerSymbolList={answerSymbolList}
      onAnswerSymbolListValueChange={onAnswerSymbolListChange}
      requiredElementsOk={requiredElementsOk}
      createButtonIsEnabled={createButtonIsEnabled}
      createButtonIsLoading={createButtonIsLoading}
      onCreateEventClick={onCreateEventClick}
      createResultDialogIsOpen={createResultDialogIsOpen}
      onResetClick={onResetClick}
      closeCreateResultDialog={closeCreateResultDialog}
      discardAndCloseCreateResultDialog={discardAndCloseCreateResultDialog}
      onClipboardButtonClick={onClipboardButtonClick}
      url={url}
      isLoading={isLoading}
    />
  );
});
