import { AnchorButton, Icon, Spinner } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { CustomIcon } from '../../atoms/icon';
import {
  ButtonsWrapperAlignEnd,
  SingleButtonWrapper,
} from '../../molecules/buttons-wrapper';
import { Section } from '../../molecules/section';
import { AnswerPageEventInfo } from '../../organisms/answer-page-event-info';
import { AnswerTable } from '../../organisms/answer-table/answer-table';
import { GoToEditPageButton } from '../../organisms/button-with-confirm/go-to-edit-page-button';
import { MyAnswer } from '../../organisms/my-answer/my-answer';
import { NotFoundPage } from '../not-found-page';
import { useAnswerPageState } from './answer-page-hooks';
import { AnswerPageError } from './error';

const vt = texts.answerPage;

export const AnswerPage = memoNamed('AnswerPage', () => {
  const {
    eventId,
    eventSchedule,
    onEditButtonClick,
    answers,
    errorType,
    onAnswerClick,
    showMyAnswerSection,
    myAnswerSectionState,
    answerSectionRef,
    myAnswer,
    setMyAnswer: onMyAnswerChange,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    fetchAnswers: refresh,
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
    isExpired,
    usernameDuplicateCheckException,
  } = useAnswerPageState();

  return errorType !== undefined && errorType.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div>
      <TitleWrapper>
        <Title href={'../../'} target='_blank' rel='noopener noreferrer'>
          <Icon icon={'timeline-events'} iconSize={28} />
          <div>{vt.title}</div>
        </Title>
        <CreateNewButtonWrapper>
          <AnchorButton
            intent={'primary'}
            href={'../../'}
            target='_blank'
            rel='noopener noreferrer'
            icon='add'
          >
            {vt.createNew}
          </AnchorButton>
        </CreateNewButtonWrapper>
      </TitleWrapper>
      {errorType !== undefined ? (
        <AnswerPageError errorType={errorType} />
      ) : eventId === undefined ||
        eventSchedule === undefined ||
        answers === undefined ? (
        <Spinner />
      ) : (
        <>
          <Section sectionTitle={vt.eventInfo.title}>
            <AnswerPageEventInfo
              eventSchedule={eventSchedule}
              isExpired={isExpired}
            />
            <ButtonsWrapperAlignEnd>
              <GoToEditPageButton
                email={eventSchedule.notificationSettings.email}
                onConfirmClick={onEditButtonClick}
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
                          <CustomIcon iconName={s.iconId} />
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
                  answers={answers}
                  myAnswer={myAnswer}
                  onMyAnswerChange={onMyAnswerChange}
                  onCancel={onCancel}
                  onDeleteAnswer={onDeleteAnswer}
                  onSubmitAnswer={onSubmitAnswer}
                  myAnswerSectionState={myAnswerSectionState}
                  submitButtonIsLoading={submitButtonIsLoading}
                  submitButtonIsDisabled={submitButtonIsDisabled}
                  usernameDuplicateCheckException={
                    usernameDuplicateCheckException
                  }
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
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
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

const CreateNewButtonWrapper = styled.div`
  flex: 1;
  margin: 10px;
  display: flex;
  flex-wrap: wrap;
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
