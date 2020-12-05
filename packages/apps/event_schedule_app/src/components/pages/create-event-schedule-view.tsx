import { Icon } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../constants/texts';
import { DatetimeSpecificationEnumType } from '../../types/enum/datetime-specification-type';
import { IAnswerSymbol } from '../../types/record/base/answer-symbol';
import { IDatetimeRange } from '../../types/record/datetime-range';
import { IYmdHm } from '../../types/record/ymd-hm';
import { IList } from '../../utils/immutable';
import { BpButton } from '../atoms/blueprint-js-wrapper/button';
import { ButtonsWrapperAlignEnd } from '../molecules/buttons-wrapper';
import { Section } from '../molecules/section';
import { CreateEventResultDialog } from '../organisms/create-event-result-dialog';
import { CreateEventSchedulePageErrors } from '../organisms/errors';
import { EventSettings } from '../organisms/event-settings/event-settings';
import { NameAndNotes } from '../organisms/name-and-note';
import { ResetButton } from '../organisms/reset-button/reset-button';
import { SelectDatetimes } from '../organisms/select-datetimes/select-datetimes/select-datetimes';

const vt = texts.createEventPage;

interface Props {
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
  requiredElementsOk: {
    title: boolean;
    datetimeRangeList: boolean;
    answerDeadline: boolean;
    password: boolean;
    answerSymbolList: boolean;
  };
  onResetClick: () => void;
  createButtonIsEnabled: boolean;
  createButtonIsLoading: boolean;
  onCreateEventClick: () => void;
  createResultDialogIsOpen: boolean;
  closeCreateResultDialog: () => void;
  discardAndCloseCreateResultDialog: () => void;
  onClipboardButtonClick: () => void;
  url: string;
  isLoading: boolean;
}

export const CreateEventScheduleView = memoNamed<Props>(
  'CreateEventScheduleView',
  (props) => (
    <div>
      <Title>
        <Icon icon={'timeline-events'} iconSize={28} />
        <div>{vt.title}</div>
      </Title>
      <Section sectionTitle={vt.section1.titleAndNotesSectionTitle}>
        <NameAndNotes
          title={props.title}
          onTitleChange={props.onTitleChange}
          notes={props.notes}
          onNotesChange={props.onNotesChange}
        />
      </Section>
      <Section sectionTitle={vt.section2.selectDatesSectionTitle}>
        <SelectDatetimes
          datetimeSpecification={props.datetimeSpecification}
          onDatetimeSpecificationChange={props.onDatetimeSpecificationChange}
          datetimeList={props.datetimeRangeList}
          onDatetimeListChange={props.onDatetimeListChange}
        />
      </Section>
      <Section sectionTitle={vt.section3.otherSettingsTitle}>
        <EventSettings
          useAnswerDeadline={props.useAnswerDeadline}
          onToggleAnswerDeadline={props.onToggleAnswerDeadline}
          answerDeadline={props.answerDeadline}
          onAnswerDeadlineChange={props.onAnswerDeadlineChange}
          usePassword={props.usePassword}
          onToggleUsePassword={props.onToggleUsePassword}
          password={props.password}
          onPasswordChange={props.onPasswordChange}
          customizeSymbolSettings={props.customizeSymbolSettings}
          onToggleCustomizeSymbolSettings={
            props.onToggleCustomizeSymbolSettings
          }
          answerSymbolList={props.answerSymbolList}
          onAnswerSymbolListChange={props.onAnswerSymbolListValueChange}
        />
      </Section>
      <CreateEventSchedulePageErrors
        requiredElementsOk={props.requiredElementsOk}
      />
      <ButtonsWrapperModified>
        <ResetButton onResetClick={props.onResetClick} />
        <BpButton
          intent='primary'
          text={vt.createEventButton}
          disabled={!props.createButtonIsEnabled}
          loading={props.createButtonIsLoading}
          onClick={props.onCreateEventClick}
        />
      </ButtonsWrapperModified>
      <CreateEventResultDialog
        isOpen={props.createResultDialogIsOpen}
        close={props.closeCreateResultDialog}
        discardAndClose={props.discardAndCloseCreateResultDialog}
        onClipboardButtonClick={props.onClipboardButtonClick}
        url={props.url}
        isLoading={props.isLoading}
      />
    </div>
  )
);

const Title = styled.h1`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 10px;
  }

  margin: 20px;
`;

const ButtonsWrapperModified = styled(ButtonsWrapperAlignEnd)`
  justify-content: flex-start;
  margin: 20px;
`;
