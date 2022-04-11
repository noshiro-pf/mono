import { Button, Classes, FormGroup } from '@blueprintjs/core';
import { useKeyEventListener } from '@noshiro/react-utils';
import { useConfirmEmailDialogState } from '../../../hooks';
import { BpInput, DialogWithMaxWidth } from '../../bp';
import { ButtonsWrapperAlignEnd } from '../../styled';

const dc = dict.answerPage.eventInfo.verifyEmailDialog;

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

    const onKeyDown = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: KeyboardEvent) => {
        if (ev.key === 'Enter') {
          enterClickHandler();
        }
      },
      [enterClickHandler]
    );

    useKeyEventListener(onKeyDown, noop);

    return (
      <DialogWithMaxWidth
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        hasBackdrop={false}
        icon='key'
        isCloseButtonShown={false}
        isOpen={isOpen}
        title={dc.editButtonConfirmDialogTitle}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>{dc.editButtonConfirmDialogMessage}</p>
          <InputWrapperWithMinHeight>
            <FormGroup helperText={helperText} intent={'danger'} label={''}>
              <BpInput
                autoFocus={true}
                intent={hasError ? 'danger' : 'primary'}
                placeholder={'sample@gmail.com'}
                type='email'
                value={state.emailBeingEdited}
                onValueChange={inputEmailHandler}
              />
            </FormGroup>
          </InputWrapperWithMinHeight>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonsWrapperAlignEnd>
            <Button intent={'none'} onClick={cancelClickHandler}>
              {dc.back}
            </Button>
            <Button
              disabled={hasError}
              intent={'primary'}
              onClick={enterClickHandler}
            >
              {dict.common.buttonText.decide}
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
