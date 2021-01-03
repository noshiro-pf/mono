import { Classes } from '@blueprintjs/core';
import {
  BpButton,
  BpDialog,
  BpEmailInput,
} from '@mono/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@mono/react-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { texts } from '../../../constants/texts';
import { Description } from '../../atoms/description';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';
import { WidthRestrictedInputWrapper } from '../../styled/width-restricted-input-wrapper';

const vt = texts.answerPage.eventInfo;

interface Props {
  email: string;
  onConfirmClick: () => void;
}

const buttonConfig = {
  name: vt.editButton,
  intent: 'none',
  icon: 'cog',
} as const;

export const GoToEditPageButton = memoNamed<Props>(
  'GoToEditPageButton',
  (props) =>
    props.email === '' ? (
      <BpButton
        intent={buttonConfig.intent}
        icon={buttonConfig.icon}
        onClick={props.onConfirmClick}
      >
        {buttonConfig.name}
      </BpButton>
    ) : (
      <ButtonWithConfirm
        onConfirmClick={props.onConfirmClick}
        emailAnswer={props.email}
      />
    )
);

interface ButtonWithConfirmProps {
  onConfirmClick: () => void;
  emailAnswer: string;
}

const ButtonWithConfirm = memoNamed<ButtonWithConfirmProps>(
  'ButtonWithConfirm',
  ({ onConfirmClick, emailAnswer: emailAnswer }) => {
    const [isOpen, open, close] = useBooleanState(false);

    return (
      <>
        <BpButton
          text={buttonConfig.name}
          intent={buttonConfig.intent}
          icon={buttonConfig.icon}
          onClick={open}
        />
        <ConfirmEmailDialog
          onConfirmClick={onConfirmClick}
          emailAnswer={emailAnswer}
          isOpen={isOpen}
          close={close}
        />
      </>
    );
  }
);

interface ConfirmEmailDialogProps {
  onConfirmClick: () => void;
  emailAnswer: string;
  isOpen: boolean;
  close: () => void;
}

const ConfirmEmailDialog = memoNamed<ConfirmEmailDialogProps>(
  'ConfirmEmailDialog',
  ({ isOpen, close, onConfirmClick, emailAnswer }) => {
    const [email, setEmail] = useState<string>('');

    const [
      showValidationFailedMessage,
      setShowValidationFailedMessage,
    ] = useState<boolean>(false);

    useEffect(() => {
      // 編集したらエラーメッセージを消す
      setShowValidationFailedMessage(false);
    }, [email]);

    const ok = emailAnswer === email;

    const onConfirm = useCallback(() => {
      if (ok) {
        onConfirmClick();
        close();
      } else {
        setShowValidationFailedMessage(true);
      }
    }, [ok, onConfirmClick, close]);

    return (
      <BpDialog
        isOpen={isOpen}
        hasBackdrop={true}
        isCloseButtonShown={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        title={vt.editButtonConfirmDialogTitle}
        icon='key'
      >
        <div className={Classes.DIALOG_BODY}>
          <p>{vt.editButtonConfirmDialogMessage}</p>
          <WidthRestrictedInputWrapper>
            <BpEmailInput
              formGroupLabel={''}
              value={email}
              onValueChange={setEmail}
              invalidMessage={
                texts.eventSettingsPage.errorMessages.invalidEmail
              }
            />
            {showValidationFailedMessage ? (
              <Description
                text={vt.editButtonConfirmDialogValidationFailedMessage}
                error={true}
              />
            ) : undefined}
          </WidthRestrictedInputWrapper>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonsWrapperAlignEnd>
            <BpButton intent={'none'} onClick={close}>
              {texts.buttonText.cancel}
            </BpButton>
            <BpButton
              intent={'primary'}
              onClick={onConfirm}
              disabled={showValidationFailedMessage}
            >
              {texts.buttonText.deside}
            </BpButton>
          </ButtonsWrapperAlignEnd>
        </div>
      </BpDialog>
    );
  }
);
