import { useQuery } from '@apollo/react-hooks';
import { Button, Icon } from '@blueprintjs/core';
import { memoNamed, useToggleState } from '@mono/react-utils';
import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { query } from '../../api/gql_defs';
import { texts } from '../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../types/enum/datetime-specification-type';
import {
  IAnswerSymbol,
  IAnswerSymbolType,
} from '../../types/record/answer-symbol';
import {
  IDatetimeRange,
  IDatetimeRangeType,
} from '../../types/record/datetime-range';
import { IEventSchedule } from '../../types/record/event-schedule';
import { IYmdHm, IYmdHmType } from '../../types/record/ymd-hm';
import {
  ForciblyUpdatedValue,
  forciblyUpdatedValue,
} from '../../utils/forcibly-updated-value';
import { IList } from '../../utils/immutable';
import { Description } from '../atoms/description';
import { EventSettings } from '../organisms/event-settings';
import { NameAndNotes } from '../organisms/name-and-note';
import { Section } from '../organisms/section-template';
import { SelectDatetimes } from '../organisms/select-datetimes/select-datetimes/select-datetimes';

const vt = texts.createEventPage;

const Root = styled.div`
  /* max-width: 500px; */
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 10px;
  }

  margin: 20px;
`;

const CreateButtonWrapper = styled.div`
  margin: 10px;
`;

const ErrorMessagesWrapper = styled.div`
  margin: 10px;
`;

const errorFontColor = '#de0f00';

const datetimeRangeListDefault = IList<IDatetimeRangeType>([IDatetimeRange()]);
const answerSymbolListDefault = IList([
  IAnswerSymbol({
    name: 'handmade-circle',
    iconId: 'handmade-circle',
    description: texts.symbolDescriptionDefault.circle,
    point: 10,
  }),
  IAnswerSymbol({
    name: 'handmade-tringle',
    iconId: 'handmade-triangle',
    description: texts.symbolDescriptionDefault.triangleUp,
    point: 5,
  }),
  IAnswerSymbol({
    name: 'handmade-cross',
    iconId: 'handmade-cross',
    description: texts.symbolDescriptionDefault.cross,
    point: 0,
  }),
]);

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => {
  const allTodosResult = useQuery(query.findAllTodos);
  console.log(allTodosResult.loading, allTodosResult.data);

  const [
    createButtonClickedMoreThanOnce,
    setCreateButtonClickedMoreThanOnce,
  ] = useState<boolean>(false);

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
  ] = useState<IList<IDatetimeRangeType>>(datetimeRangeListDefault);

  const [useAnswerDeadline, onToggleAnswerDeadline] = useToggleState(false);
  const [
    // dummy comment to control prettier
    answerDeadline,
    onAnswerDeadlineChange,
  ] = useState<IYmdHmType | undefined>(IYmdHm());

  const [usePassword, onToggleUsePassword] = useToggleState(false);
  const [password, onPasswordChange] = useState<string>('');

  const [
    customizeSymbolSettings,
    onToggleCustomizeSymbolSettings,
  ] = useToggleState(false);

  const [
    // dummy comment to control prettier
    answerSymbolList,
    onAnswerSymbolListChange,
  ] = useState<ForciblyUpdatedValue<IList<IAnswerSymbolType>>>(
    forciblyUpdatedValue(answerSymbolListDefault)
  );

  const onAnswerSymbolListValueChange = useCallback(
    (value: IList<IAnswerSymbolType>) => {
      onAnswerSymbolListChange(forciblyUpdatedValue(value));
    },
    []
  );

  const requiredElementsOk = useMemo(
    () => ({
      title: title !== '',
      datetimeRangeList: !datetimeRangeList.isEmpty(),
      answerDeadline: !(useAnswerDeadline && answerDeadline === undefined),
      password: !(usePassword && password === ''),
      answerSymbolList: answerSymbolList.value.size >= 2,
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

  const allRequiredElementsOk = useMemo<boolean>(
    () =>
      requiredElementsOk.title &&
      requiredElementsOk.datetimeRangeList &&
      requiredElementsOk.answerDeadline &&
      requiredElementsOk.password &&
      requiredElementsOk.answerSymbolList,
    [requiredElementsOk]
  );

  const onCreateEventClick = useCallback(() => {
    setCreateButtonClickedMoreThanOnce(true);
    if (!allRequiredElementsOk) return;
    const eventSchedule = IEventSchedule({
      title,
      notes,
      datetimeSpecification,
      datetimeRangeList,
      useAnswerDeadline,
      answerDeadline,
      usePassword,
      password,
      answerSymbolList: answerSymbolList.value,
    });
    console.log('onCreateEventClick', eventSchedule.toJS());
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
  ]);

  return (
    <Root>
      <Title>
        <Icon icon={'timeline-events'} iconSize={28} />
        <div>{vt.title}</div>
      </Title>
      <Section sectionTitle={vt.section1.titleAndNotesSectionTitle}>
        <NameAndNotes
          title={title}
          onTitleChange={onTitleChange}
          notes={notes}
          onNotesChange={onNotesChange}
        />
      </Section>
      <Section sectionTitle={vt.section2.selectDatesSectionTitle}>
        <SelectDatetimes
          datetimeSpecification={datetimeSpecification}
          onDatetimeSpecificationChange={onDatetimeSpecificationChange}
          datetimeList={datetimeRangeList}
          onDatetimeListChange={onDatetimeListChange}
        />
      </Section>
      <Section sectionTitle={vt.section3.otherSettingsTitle}>
        <EventSettings
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
          onAnswerSymbolListChange={onAnswerSymbolListValueChange}
        />
      </Section>
      <CreateButtonWrapper>
        <Button
          intent='primary'
          text={vt.createEventButton}
          disabled={createButtonClickedMoreThanOnce && !allRequiredElementsOk}
          onClick={onCreateEventClick}
        />
      </CreateButtonWrapper>
      {!createButtonClickedMoreThanOnce ? undefined : (
        <ErrorMessagesWrapper>
          {requiredElementsOk.title ? undefined : (
            <Description
              color={errorFontColor}
              text={vt.errorMessages.titleIsEmpty}
            />
          )}
          {requiredElementsOk.datetimeRangeList ? undefined : (
            <Description
              color={errorFontColor}
              text={vt.errorMessages.datetimeIsEmpty}
            />
          )}
          {requiredElementsOk.answerDeadline ? undefined : (
            <Description
              color={errorFontColor}
              text={vt.errorMessages.answerDeadlineIsEnabledButEmpty}
            />
          )}
          {requiredElementsOk.password ? undefined : (
            <Description
              color={errorFontColor}
              text={vt.errorMessages.passwordIsEnabledButEmpty}
            />
          )}
          {requiredElementsOk.answerSymbolList ? undefined : (
            <Description
              color={errorFontColor}
              text={vt.errorMessages.atLeastTwoSymbolsRequired}
            />
          )}
        </ErrorMessagesWrapper>
      )}
    </Root>
  );
});
