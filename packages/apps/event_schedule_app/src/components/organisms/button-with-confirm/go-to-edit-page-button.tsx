import { Classes } from '@blueprintjs/core';
import {
  BpButton,
  BpDialog,
  BpEmailInput,
} from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback, useEffect, useState } from 'react';
import { texts } from '../../../constants/texts';
import { Description } from '../../atoms/description';
import { ButtonsWrapperAlignEnd } from '../../molecules/buttons-wrapper';
import { WidthRestrictedInputWrapper } from '../../styled/width-restricted-input-wrapper';

const vt = texts.answerPage.eventInfo;

type Props = Readonly<{
  email: string;
  onConfirmClick: () => void;
}>;

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

type ButtonWithConfirmProps = Readonly<{
  onConfirmClick: () => void;
  emailAnswer: string;
}>;

const ButtonWithConfirm = memoNamed<ButtonWithConfirmProps>(
  'ButtonWithConfirm',
  ({ onConfirmClick, emailAnswer: emailAnswer }) => {
    const [isOpen, handleOpen, handleClose] = useBooleanState(false);

    return (
      <>
        <BpButton
          text={buttonConfig.name}
          intent={buttonConfig.intent}
          icon={buttonConfig.icon}
          onClick={handleOpen}
        />
        <ConfirmEmailDialog
          onConfirmClick={onConfirmClick}
          emailAnswer={emailAnswer}
          isOpen={isOpen}
          onClose={handleClose}
        />
      </>
    );
  }
);

type ConfirmEmailDialogProps = Readonly<{
  onConfirmClick: () => void;
  emailAnswer: string;
  isOpen: boolean;
  onClose: () => void;
}>;

const ConfirmEmailDialog = memoNamed<ConfirmEmailDialogProps>(
  'ConfirmEmailDialog',
  ({ isOpen, onClose, onConfirmClick, emailAnswer }) => {
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
        onClose();
      } else {
        setShowValidationFailedMessage(true);
      }
    }, [ok, onConfirmClick, onClose]);

    return (
      <BpDialog
        isOpen={isOpen}
        onClose={onClose}
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
              autoFocus={true}
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
            <BpButton intent={'none'} onClick={onClose}>
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
