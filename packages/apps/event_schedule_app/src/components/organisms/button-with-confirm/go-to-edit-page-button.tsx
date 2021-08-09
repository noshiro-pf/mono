import { Classes } from '@blueprintjs/core';
import {
  BpButton,
  BpDialog,
  BpEmailInput,
} from '@noshiro/react-blueprintjs-utils';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { useCallback, useEffect, useState } from 'react';
import { texts } from '../../../constants';
import { Description } from '../../atoms';
import { ButtonsWrapperAlignEnd } from '../../molecules';
import { WidthRestrictedInputWrapper } from '../../styled';

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
        icon={buttonConfig.icon}
        intent={buttonConfig.intent}
        onClick={props.onConfirmClick}
      >
        {buttonConfig.name}
      </BpButton>
    ) : (
      <ButtonWithConfirm
        emailAnswer={props.email}
        onConfirmClick={props.onConfirmClick}
      />
    )
);

type ButtonWithConfirmProps = Readonly<{
  onConfirmClick: () => void;
  emailAnswer: string;
}>;

const ButtonWithConfirm = memoNamed<ButtonWithConfirmProps>(
  'ButtonWithConfirm',
  ({ onConfirmClick, emailAnswer }) => {
    const [isOpen, handleOpen, handleClose] = useBooleanState(false);

    return (
      <>
        <BpButton
          icon={buttonConfig.icon}
          intent={buttonConfig.intent}
          text={buttonConfig.name}
          onClick={handleOpen}
        />
        <ConfirmEmailDialog
          emailAnswer={emailAnswer}
          isOpen={isOpen}
          onClose={handleClose}
          onConfirmClick={onConfirmClick}
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

    const [showValidationFailedMessage, setShowValidationFailedMessage] =
      useState<boolean>(false);

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
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        hasBackdrop={true}
        icon='key'
        isCloseButtonShown={true}
        isOpen={isOpen}
        title={vt.editButtonConfirmDialogTitle}
        onClose={onClose}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>{vt.editButtonConfirmDialogMessage}</p>
          <WidthRestrictedInputWrapper>
            <BpEmailInput
              autoFocus={true}
              formGroupLabel={''}
              invalidMessage={
                texts.eventSettingsPage.errorMessages.invalidEmail
              }
              value={email}
              onValueChange={setEmail}
            />
            {showValidationFailedMessage ? (
              <Description
                error={true}
                text={vt.editButtonConfirmDialogValidationFailedMessage}
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
              disabled={showValidationFailedMessage}
              intent={'primary'}
              onClick={onConfirm}
            >
              {texts.buttonText.decide}
            </BpButton>
          </ButtonsWrapperAlignEnd>
        </div>
      </BpDialog>
    );
  }
);
