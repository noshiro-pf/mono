import { Icon } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { BpButton } from '../../atoms/blueprint-js-wrapper/bp-button';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';
import { Section } from '../../molecules/section';
import { CreateEventResultDialog } from '../../organisms/create-event-result-dialog';
import { EventSchedulePropertiesErrors } from '../../organisms/errors';
import { EventSettings } from '../../organisms/event-settings/event-settings';
import { NameAndNotes } from '../../organisms/name-and-note';
import { ResetButton } from '../../organisms/reset-button/reset-button';
import { SelectDatetimes } from '../../organisms/select-datetimes/select-datetimes/select-datetimes';
import { useCreateEventScheduleHooks } from './create-event-schedule-hooks';

const vt = texts.createEventPage;

export const CreateEventSchedule = memoNamed('CreateEventSchedule', () => {
  const {
    title,
    onTitleChange,
    notes,
    onNotesChange,
    datetimeSpecification,
    onDatetimeSpecificationChange,
    datetimeRangeList,
    onDatetimeListChange,
    useAnswerDeadline,
    onToggleAnswerDeadline,
    answerDeadline,
    onAnswerDeadlineChange,
    usePassword,
    onToggleUsePassword,
    password,
    onPasswordChange,
    customizeSymbolSettings,
    onToggleCustomizeSymbolSettings,
    answerSymbolList,
    onAnswerSymbolListValueChange,
    useNotification,
    onToggleUseNotification,
    notificationSettings,
    onNotificationSettingsChange,
    requiredElementsOk,
    createButtonIsEnabled,
    createButtonIsLoading,
    onCreateEventClick,
    createResultDialogIsOpen,
    onResetClick,
    closeCreateResultDialog,
    onClipboardButtonClick,
    url,
    isLoading,
    holidaysJpDefinition,
  } = useCreateEventScheduleHooks();

  return (
    <div>
      <TitleWrapper>
        <Title href={'../'} target='_blank' rel='noopener noreferrer'>
          <Icon icon={'timeline-events'} iconSize={28} />
          <div>{vt.title}</div>
        </Title>
      </TitleWrapper>
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
          holidaysJpDefinition={holidaysJpDefinition}
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
          useNotification={useNotification}
          onToggleUseNotification={onToggleUseNotification}
          notificationSettings={notificationSettings}
          onNotificationSettingsChange={onNotificationSettingsChange}
        />
      </Section>
      <EventSchedulePropertiesErrors requiredElementsOk={requiredElementsOk} />
      <ButtonsWrapperModified>
        <ResetButton onResetClick={onResetClick} />
        <BpButton
          intent='primary'
          text={vt.createEventButton}
          disabled={!createButtonIsEnabled}
          loading={createButtonIsLoading}
          onClick={onCreateEventClick}
        />
      </ButtonsWrapperModified>
      <CreateEventResultDialog
        isOpen={createResultDialogIsOpen}
        close={closeCreateResultDialog}
        onClipboardButtonClick={onClipboardButtonClick}
        url={url}
        isLoading={isLoading}
      />
    </div>
  );
});

const TitleWrapper = styled.div`
  display: flex;
`;

const Title = styled.a`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 10px;
  }

  margin: 20px;

  /* h1 style */
  font-size: 2em;
  font-weight: bold;
  color: black !important;
  text-decoration: none !important;
`;

const ButtonsWrapperModified = styled(ButtonsWrapperAlignEnd)`
  justify-content: flex-start;
  margin: 20px;
`;
