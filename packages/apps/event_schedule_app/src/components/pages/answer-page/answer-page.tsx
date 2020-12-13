import { Icon, Spinner, Toaster } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { errorFontColor } from '../../../constants/color';
import { texts } from '../../../constants/texts';
import { BpButton } from '../../atoms/blueprint-js-wrapper/bp-button';
import { Description } from '../../atoms/description';
import { CustomIcon } from '../../atoms/icon';
import {
  ButtonsWrapperAlignEnd,
  SingleButtonWrapper,
} from '../../molecules/buttons-wrapper';
import { Section } from '../../molecules/section';
import { AnswerPageEventInfo } from '../../organisms/answer-page-event-info';
import { AnswerTable } from '../../organisms/answer-table/answer-table';
import { MyAnswer } from '../../organisms/my-answer/my-answer';
import { useAnswerPageState } from './answer-page-hooks';

const vt = texts.answerPage;

const toast = Toaster.create({ canEscapeKeyClear: true, position: 'top' });

export const AnswerPage = memoNamed('AnswerPage', () => {
  const {
    eventSchedule: eventSchedule,
    onEditButtonClick: onEditButtonClick,
    answers: answers,
    isError: isError,
    onAnswerClick: onAnswerClick,
    showMyAnswerSection: showMyAnswerSection,
    myAnswerSectionState: myAnswerSectionState,
    answerSectionRef: answerSectionRef,
    myAnswer: myAnswer,
    setMyAnswer: onMyAnswerChange,
    onCancel: onCancel,
    onDeleteAnswer: onDeleteAnswer,
    onSubmitAnswer: onSubmitAnswer,
    submitButtonIsLoading: submitButtonIsLoading,
    submitButtonIsDisabled: submitButtonIsDisabled,
    fetchAnswers: refresh,
    refreshButtonIsLoading: refreshButtonIsLoading,
    refreshButtonIsDisabled: refreshButtonIsDisabled,
    isExpired: isExpired,
  } = useAnswerPageState(toast);

  return (
    <div>
      <TitleWrapper>
        <Title href={'../../'} target='_blank' rel='noopener noreferrer'>
          <Icon icon={'timeline-events'} iconSize={28} />
          <div>{vt.title}</div>
        </Title>
      </TitleWrapper>
      {isError ? (
        <ErrorMessageWrapper>
          <Description
            color={errorFontColor}
            text={vt.errorMessages.eventScheduleNotFound}
          />
        </ErrorMessageWrapper>
      ) : eventSchedule === undefined || answers === undefined ? (
        <Spinner />
      ) : (
        <>
          <Section sectionTitle={vt.eventInfo.title}>
            <AnswerPageEventInfo
              eventSchedule={eventSchedule}
              isExpired={isExpired}
            />
            <ButtonsWrapperAlignEnd>
              <BpButton
                intent='none'
                icon='cog'
                text={vt.eventInfo.editButton}
                onClick={onEditButtonClick}
              />
            </ButtonsWrapperAlignEnd>
          </Section>
          <Section sectionTitle={vt.answers.title}>
            {isExpired ? undefined : (
              <SingleButtonWrapper>
                <BpButton
                  intent={'none'}
                  icon={'refresh'}
                  onClick={refresh}
                  loading={refreshButtonIsLoading}
                  disabled={refreshButtonIsDisabled}
                >
                  {vt.answers.refresh}
                </BpButton>
              </SingleButtonWrapper>
            )}
            <TableWrapper>
              <AnswerTable
                answers={answers}
                eventSchedule={eventSchedule}
                isExpired={isExpired}
                onAnswerClick={onAnswerClick}
              />
            </TableWrapper>
            <SymbolDescriptionWrapper>
              <table>
                <tbody>
                  {eventSchedule.answerSymbolList.map((s) => (
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
            {myAnswerSectionState === 'hidden' && !isExpired ? (
              <ButtonsWrapperAlignEnd>
                <BpButton
                  intent='primary'
                  icon='add'
                  text={vt.answers.addAnswer}
                  onClick={showMyAnswerSection}
                />
              </ButtonsWrapperAlignEnd>
            ) : undefined}
          </Section>
          <div ref={answerSectionRef}>
            {myAnswerSectionState === 'hidden' || isExpired ? undefined : (
              <Section
                sectionTitle={
                  myAnswerSectionState === 'creating'
                    ? vt.myAnswer.title.create
                    : vt.myAnswer.title.update
                }
              >
                <MyAnswer
                  eventSchedule={eventSchedule}
                  myAnswer={myAnswer}
                  onMyAnswerChange={onMyAnswerChange}
                  onCancel={onCancel}
                  onDeleteAnswer={onDeleteAnswer}
                  onSubmitAnswer={onSubmitAnswer}
                  myAnswerSectionState={myAnswerSectionState}
                  submitButtonIsLoading={submitButtonIsLoading}
                  submitButtonIsDisabled={submitButtonIsDisabled}
                />
              </Section>
            )}
          </div>
        </>
      )}
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

const ErrorMessageWrapper = styled.div`
  margin: 20px;
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
