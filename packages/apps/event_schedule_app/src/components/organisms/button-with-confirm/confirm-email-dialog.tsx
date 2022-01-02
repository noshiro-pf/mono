import { Button, Classes, FormGroup } from '@blueprintjs/core';
import { memoNamed, useKeyEventListener } from '@noshiro/react-utils';
import { noop } from '@noshiro/ts-utils';
import { useCallback } from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants';
import { useConfirmEmailDialogState } from '../../../hooks';
import { BpInput, DialogWithMaxWidth } from '../../bp';
import { ButtonsWrapperAlignEnd } from '../../styled';

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
    const {
      state,
      helperText,
      hasError,
      cancelClickHandler,
      enterClickHandler,
      inputEmailHandler,
    } = useConfirmEmailDialogState(onSuccess, back, emailAnswer);

    const onKeyUp = useCallback(
      (ev: Readonly<KeyboardEvent>) => {
        if (ev.key === 'Enter') {
          enterClickHandler();
        }
      },
      [enterClickHandler]
    );

    useKeyEventListener(onKeyUp, noop);

    return (
      <DialogWithMaxWidth
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
          <InputWrapperWithMinHeight>
            <FormGroup helperText={helperText} intent={'danger'} label={''}>
              <BpInput
                autoFocus={true}
                intent={hasError ? 'danger' : 'primary'}
                placeholder={'sample@gmail.com'}
                type='email'
                value={state.emailBeingInput}
                onValueChange={inputEmailHandler}
              />
            </FormGroup>
          </InputWrapperWithMinHeight>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonsWrapperAlignEnd>
            <Button intent={'none'} onClick={cancelClickHandler}>
              {vt.back}
            </Button>
            <Button
              disabled={state.enterButtonDisabled}
              intent={'primary'}
              onClick={enterClickHandler}
            >
              {texts.buttonText.decide}
            </Button>
          </ButtonsWrapperAlignEnd>
        </div>
      </DialogWithMaxWidth>
    );
  }
);

const InputWrapperWithMinHeight = styled('div')`
  min-height: 72px;
`;
