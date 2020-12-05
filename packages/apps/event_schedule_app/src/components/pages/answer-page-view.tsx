import { Icon, Spinner } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { RefObject } from 'react';
import styled from 'styled-components';
import { errorFontColor } from '../../constants/color';
import { texts } from '../../constants/texts';
import { IAnswer } from '../../types/record/answer';
import { IEventSchedule } from '../../types/record/event-schedule';
import { IList } from '../../utils/immutable';
import { BpButton } from '../atoms/blueprint-js-wrapper/button';
import { Description } from '../atoms/description';
import { CustomIcon } from '../atoms/icon';
import { SingleButtonWrapper } from '../molecules/buttons-wrapper';
import { Section } from '../molecules/section';
import { AnswerPageEventInfo } from '../organisms/answer-page-event-info';
import { AnswerTable } from '../organisms/answer-table/answer-table';
import { MyAnswer } from '../organisms/my-answer/my-answer';

const vt = texts.answerPage;

interface Props {
  eventSchedule: IEventSchedule | undefined;
  answers: IList<IAnswer> | undefined;
  isError: boolean;
  onAnswerClick: (answer: IAnswer) => void;
  showMyAnswerSection: () => void;
  myAnswerSectionState: 'hidden' | 'creating' | 'editing';
  answerSectionRef: RefObject<HTMLDivElement>;
  myAnswer: IAnswer;
  onMyAnswerChange: (answer: IAnswer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => void;
  onSubmitAnswer: () => void;
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  refresh: () => void;
  refreshButtonIsLoading: boolean;
  refreshButtonIsDisabled: boolean;
  isExpired: boolean;
}

export const AnswerPageView = memoNamed<Props>('AnswerPageView', (props) => (
  <div>
    <Title>
      <Icon icon={'timeline-events'} iconSize={28} />
      <div>{vt.title}</div>
    </Title>
    {props.isError ? (
      <ErrorMessageWrapper>
        <Description
          color={errorFontColor}
          text={vt.errorMessages.eventScheduleNotFound}
        />
      </ErrorMessageWrapper>
    ) : props.eventSchedule === undefined || props.answers === undefined ? (
      <Spinner />
    ) : (
      <>
        <Section sectionTitle={vt.eventInfo.title}>
          <AnswerPageEventInfo
            eventSchedule={props.eventSchedule}
            isExpired={props.isExpired}
          />
        </Section>
        <Section sectionTitle={vt.answers.title}>
          {props.isExpired ? undefined : (
            <SingleButtonWrapper>
              <BpButton
                intent={'none'}
                icon={'refresh'}
                onClick={props.refresh}
                loading={props.refreshButtonIsLoading}
                disabled={props.refreshButtonIsDisabled}
              >
                {vt.answers.refresh}
              </BpButton>
            </SingleButtonWrapper>
          )}
          <TableWrapper>
            <AnswerTable
              answers={props.answers}
              eventSchedule={props.eventSchedule}
              isExpired={props.isExpired}
              onAnswerClick={props.onAnswerClick}
            />
          </TableWrapper>
          <SymbolDescriptionWrapper>
            <table>
              <tbody>
                {props.eventSchedule.answerSymbolList.map((s) => (
                  <tr key={s.iconId}>
                    <th>
                      <AlignCenter>
                        <CustomIcon name={s.iconId} />
                        <span>{texts.colon}</span>
                      </AlignCenter>
                    </th>
                    <td>{s.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SymbolDescriptionWrapper>
          {props.myAnswerSectionState === 'hidden' && !props.isExpired ? (
            <ShowMyAnswerSectionButtonWrapper>
              <BpButton
                intent='primary'
                icon='add'
                text={vt.answers.addAnswer}
                onClick={props.showMyAnswerSection}
              />
            </ShowMyAnswerSectionButtonWrapper>
          ) : undefined}
        </Section>
        <div ref={props.answerSectionRef}>
          {props.myAnswerSectionState === 'hidden' ||
          props.isExpired ? undefined : (
            <Section
              sectionTitle={
                props.myAnswerSectionState === 'creating'
                  ? vt.myAnswer.title.create
                  : vt.myAnswer.title.update
              }
            >
              <MyAnswer
                eventSchedule={props.eventSchedule}
                myAnswer={props.myAnswer}
                onMyAnswerChange={props.onMyAnswerChange}
                onCancel={props.onCancel}
                onDeleteAnswer={props.onDeleteAnswer}
                onSubmitAnswer={props.onSubmitAnswer}
                myAnswerSectionState={props.myAnswerSectionState}
                submitButtonIsLoading={props.submitButtonIsLoading}
                submitButtonIsDisabled={props.submitButtonIsDisabled}
              />
            </Section>
          )}
        </div>
      </>
    )}
  </div>
));

const Title = styled.h1`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 10px;
  }

  margin: 20px;
`;

const ErrorMessageWrapper = styled.div`
  margin: 20px;
`;

const ShowMyAnswerSectionButtonWrapper = styled.div`
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const SymbolDescriptionWrapper = styled.div`
  margin: 10px;
`;

const AlignCenter = styled.div`
  display: flex;
  align-items: center;
`;
