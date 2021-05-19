import { FormGroup, HTMLTable } from '@blueprintjs/core';
import {
  BpButton,
  BpInput,
  BpTextArea,
} from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { texts } from '../../../constants';
import type { IAnswer, IEventSchedule, UserName } from '../../../types';
import type { IList } from '../../../utils';
import { CustomIcon, Td, Th } from '../../atoms';
import { ButtonsWrapperAlignEnd } from '../../molecules';
import { WidthRestrictedInputWrapper } from '../../styled';
import { DatetimeRangeCell } from '../answer-table';
import { DeleteAnswerButton } from './delete-answer-button';
import { useMyAnswerHooks } from './my-answer-hooks';

type Props = Readonly<{
  eventSchedule: IEventSchedule;
  answers: IList<IAnswer>;
  myAnswer: IAnswer;
  onMyAnswerChange: (answer: IAnswer) => void;
  onCancel: () => void;
  onDeleteAnswer: () => Promise<void>;
  onSubmitAnswer: () => Promise<void>;
  myAnswerSectionState: 'creating' | 'editing' | 'hidden';
  submitButtonIsLoading: boolean;
  submitButtonIsDisabled: boolean;
  usernameDuplicateCheckException: UserName | undefined;
}>;

const vt = texts.answerPage.myAnswer;

export const MyAnswer = memoNamed<Props>(
  'MyAnswer',
  ({
    eventSchedule,
    answers,
    myAnswer,
    onMyAnswerChange,
    onCancel,
    onDeleteAnswer,
    onSubmitAnswer,
    myAnswerSectionState,
    submitButtonIsLoading,
    submitButtonIsDisabled,
    usernameDuplicateCheckException,
  }) => {
    const {
      userName,
      showUserNameError,
      theNameIsAlreadyUsed,
      onUserNameBlur,
      onUserNameChange,
      comment,
      onCommentChange,
      symbolHeader,
      myAnswerList,
    } = useMyAnswerHooks(
      eventSchedule,
      answers,
      usernameDuplicateCheckException,
      myAnswer,
      onMyAnswerChange
    );

    return (
      <>
        <WidthRestrictedInputWrapper>
          <FormGroup
            label={vt.yourName}
            helperText={
              showUserNameError
                ? theNameIsAlreadyUsed
                  ? vt.theNameIsAlreadyUsed
                  : vt.nameIsRequired
                : undefined
            }
            intent={showUserNameError ? 'danger' : 'primary'}
          >
            <BpInput
              value={userName}
              onValueChange={onUserNameChange as (v: string) => void}
              autoFocus={true}
              onBlur={onUserNameBlur}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <HTMLTable bordered={true}>
          <thead>
            <tr>
              <Th></Th>
              {symbolHeader.map((s) => (
                <Th key={s.iconId}>
                  <BpButton
                    title={s.symbolDescription}
                    icon={<CustomIcon iconName={s.iconId} />}
                    minimal={true}
                    onClick={s.onClick}
                  />
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {myAnswerList.map(
              ({ datetimeRange, selectedSymbol, buttons }, i) => (
                <tr key={i}>
                  <Td>
                    <DatetimeRangeCell
                      datetimeRange={datetimeRange}
                      datetimeSpecification={
                        eventSchedule.datetimeSpecification
                      }
                    />
                  </Td>
                  {buttons.map((s) => (
                    <Td style={style} key={s.iconId}>
                      <BpButton
                        icon={
                          <CustomIcon
                            iconName={s.iconId}
                            color={
                              s.iconId === selectedSymbol ? 'blue' : 'gray'
                            }
                          />
                        }
                        title={s.symbolDescription}
                        active={s.iconId === selectedSymbol}
                        minimal={true}
                        onClick={s.onClick}
                      />
                    </Td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </HTMLTable>
        <WidthRestrictedInputWrapper>
          <FormGroup label={vt.comments}>
            <BpTextArea
              value={comment}
              onValueChange={onCommentChange}
              fill={true}
            />
          </FormGroup>
        </WidthRestrictedInputWrapper>
        <ButtonsWrapperAlignEnd>
          <BpButton
            intent='none'
            text={texts.buttonText.cancel}
            onClick={onCancel}
            disabled={submitButtonIsLoading}
            nowrap={true}
          />
          {myAnswerSectionState === 'editing' ? (
            <DeleteAnswerButton
              onConfirmDeleteAnswer={onDeleteAnswer}
              loading={submitButtonIsLoading}
            />
          ) : undefined}
          <BpButton
            intent='primary'
            icon='tick'
            text={
              myAnswerSectionState === 'creating'
                ? vt.submitButton.create
                : myAnswerSectionState === 'editing'
                ? vt.submitButton.update
                : ''
            }
            onClick={onSubmitAnswer}
            loading={submitButtonIsLoading}
            disabled={submitButtonIsDisabled}
            nowrap={true}
          />
        </ButtonsWrapperAlignEnd>
      </>
    );
  }
);

const style = {
  padding: '6px',
};
