import { Classes } from '@blueprintjs/core';
import {
  BpButton,
  BpDialog,
  BpEmailInput,
} from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { ButtonsWrapperAlignEnd } from '../../molecules';
import { WidthRestrictedInputWrapper } from '../../styled';

const vt = texts.answerPage.eventInfo.verifyEmailDialog;

type ConfirmEmailDialogProps = Readonly<{
  onSuccess: () => void;
  emailAnswer: string;
  isOpen: boolean;
  back: () => void;
}>;

export const ConfirmEmailDialog = memoNamed<ConfirmEmailDialogProps>(
  'ConfirmEmailDialog',
  ({ isOpen, back, onSuccess, emailAnswer }) => {
    const [emailTemp, setEmailTemp] = useState<string>('');
    const [email, setEmail] = useState<string>('');

    const ok = emailAnswer === email;

    const onConfirm = useCallback(() => {
      if (ok) {
        onSuccess();
      }
    }, [ok, onSuccess]);

    const onBlur = useCallback(() => {
      setEmail(emailTemp);
    }, [emailTemp]);

    const onValueChange = useCallback((value: string) => {
      setEmailTemp(value);
    }, []);

    return (
      <BpDialog
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        hasBackdrop={false}
        icon='key'
        isCloseButtonShown={false}
        isOpen={isOpen}
        title={vt.editButtonConfirmDialogTitle}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>{vt.editButtonConfirmDialogMessage}</p>
          <WidthRestrictedInputWrapperWithMinHeight>
            <BpEmailInput
              autoFocus={true}
              formGroupLabel={''}
              invalidEmailMessage={
                texts.eventSettingsPage.errorMessages.invalidEmail
              }
              otherErrorMessages={
                vt.editButtonConfirmDialogValidationFailedMessage
              }
              showOtherErrorMessages={!ok}
              value={emailTemp}
              onBlur={onBlur}
              onValueChange={onValueChange}
            />
          </WidthRestrictedInputWrapperWithMinHeight>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonsWrapperAlignEnd>
            <BpButton intent={'none'} onClick={back}>
              {vt.back}
            </BpButton>
            <BpButton disabled={!ok} intent={'primary'} onClick={onConfirm}>
              {texts.buttonText.decide}
            </BpButton>
          </ButtonsWrapperAlignEnd>
        </div>
      </BpDialog>
    );
  }
);

const WidthRestrictedInputWrapperWithMinHeight = styled(
  WidthRestrictedInputWrapper
)`
  min-height: 72px;
`;
