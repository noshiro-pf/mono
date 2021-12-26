import { AnchorButton, Button, Icon, Spinner } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { IList } from '@noshiro/ts-utils';
import styled from 'styled-components';
import { routes, texts } from '../../../constants';
import { useAnswerPageState } from '../../../hooks';
import { refreshAnswers, setYearMonth$ } from '../../../store';
import { CustomIcon, Description, RequiredParticipantIcon } from '../../atoms';
import { Section } from '../../molecules';
import { MultipleDatePicker } from '../../multiple-date-picker';
import {
  AnswerBeingEdited,
  AnswerPageEventInfo,
  AnswerTable,
} from '../../organisms';
import { ButtonsWrapperAlignEnd, SingleButtonWrapper } from '../../styled';
import { NotFoundPage } from '../not-found-page';
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
    onAddAnswerButtonClick,
    answerBeingEditedSectionState,
    answerSectionRef,
    answerBeingEdited,
    updateAnswerBeingEdited,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    refreshButtonIsLoading,
    refreshButtonIsDisabled,
    isExpired,
    selectedAnswerUserName,
    requiredParticipantsExist,
    selectedDates,
    holidaysJpDefinition,
  } = useAnswerPageState();

  return errorType !== undefined && errorType.type === 'not-found' ? (
    <NotFoundPage />
  ) : (
    <div>
      <TitleWrapper>
        <Title
          href={routes.createPage}
          rel='noopener noreferrer'
          target='_blank'
        >
          <Icon icon={'timeline-events'} iconSize={28} />
          <div>{vt.title}</div>
        </Title>
        <CreateNewButtonWrapper>
          <AnchorButton
            href={routes.createPage}
            icon='add'
            intent={'primary'}
            rel='noopener noreferrer'
            target='_blank'
          >
            <NoWrapSpan>{vt.createNew}</NoWrapSpan>
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
              <Button icon={'cog'} intent={'none'} onClick={onEditButtonClick}>
                {vt.eventInfo.editButton}
              </Button>
            </ButtonsWrapperAlignEnd>
          </Section>
          <Section sectionTitle={vt.answers.title}>
            <CalendarWrapper>
              <MultipleDatePicker
                holidaysJpDefinition={holidaysJpDefinition}
                selectedDates={selectedDates}
                setYearMonth$={setYearMonth$}
              />
            </CalendarWrapper>

            {isExpired ? undefined : (
              <SingleButtonWrapper>
                <Button
                  disabled={refreshButtonIsDisabled}
                  icon={'refresh'}
                  intent={'none'}
                  loading={refreshButtonIsLoading}
                  onClick={refreshAnswers}
                >
                  {vt.answers.refresh}
                </Button>
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
              {requiredParticipantsExist ? (
                <RequiredParticipantIconWrapper>
                  <AlignCenter>
                    <RequiredParticipantIcon />
                    {texts.colon}
                  </AlignCenter>
                  {vt.answers.requiredParticipant}
                  {vt.requiredParticipantDescription}
                </RequiredParticipantIconWrapper>
              ) : undefined}
              <table>
                <tbody>
                  <tr>
                    <th>
                      <AlignCenter>
                        <CustomIcon iconName={'good'} />
                      </AlignCenter>
                    </th>
                    <td>{vt.point(eventSchedule.answerSymbols.good.point)}</td>
                    <td>{texts.colon}</td>
                    <td>{eventSchedule.answerSymbols.good.description}</td>
                  </tr>
                  <tr>
                    <th>
                      <AlignCenter>
                        <CustomIcon iconName={'fair'} />
                      </AlignCenter>
                    </th>
                    <td>{vt.point(eventSchedule.answerSymbols.fair.point)}</td>
                    <td>{texts.colon}</td>
                    <td>{eventSchedule.answerSymbols.fair.description}</td>
                  </tr>
                  <tr>
                    <th>
                      <AlignCenter>
                        <CustomIcon iconName={'poor'} />
                      </AlignCenter>
                    </th>
                    <td>{vt.point(eventSchedule.answerSymbols.poor.point)}</td>
                    <td>{texts.colon}</td>
                    <td>{eventSchedule.answerSymbols.poor.description}</td>
                  </tr>
                </tbody>
              </table>
              <NoteForPointOfFair>
                {IList.map(
                  vt.noteForPointOfFair(eventSchedule.answerSymbols.fair.point),
                  (s, i) => (
                    <Description key={i} text={s} />
                  )
                )}
              </NoteForPointOfFair>
            </SymbolDescriptionWrapper>

            {answerBeingEditedSectionState === 'hidden' && !isExpired ? (
              <ButtonsWrapperAlignEnd>
                <Button
                  icon='add'
                  intent='primary'
                  text={vt.answers.addAnswer}
                  onClick={onAddAnswerButtonClick}
                />
              </ButtonsWrapperAlignEnd>
            ) : undefined}
          </Section>

          <div ref={answerSectionRef}>
            {answerBeingEditedSectionState === 'hidden' ||
            isExpired ? undefined : (
              <Section
                sectionTitle={
                  answerBeingEditedSectionState === 'creating'
                    ? vt.answerBeingEdited.title.create
                    : vt.answerBeingEdited.title.update
                }
                onCloseClick={onCancel}
              >
                <AnswerBeingEdited
                  answerBeingEdited={answerBeingEdited}
                  answerBeingEditedSectionState={answerBeingEditedSectionState}
                  answers={answers}
                  eventSchedule={eventSchedule}
                  selectedAnswerUserName={selectedAnswerUserName}
                  submitButtonIsDisabled={submitButtonIsDisabled}
                  submitButtonIsLoading={submitButtonIsLoading}
                  updateAnswerBeingEdited={updateAnswerBeingEdited}
                  onCancel={onCancel}
                  onDeleteAnswer={onDeleteAnswer}
                  onSubmitAnswer={onSubmitAnswer}
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

const NoWrapSpan = styled.span`
  white-space: nowrap;
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

const CalendarWrapper = styled.div`
  margin: 10px;
  display: flex;
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

const RequiredParticipantIconWrapper = styled(AlignCenter)`
  margin: 10px 3px;
`;

const NoteForPointOfFair = styled.div`
  margin: 10px 3px;
`;
