import { Button, Classes, FormGroup } from '@blueprintjs/core';
import { BpInput, DialogWithMaxWidth } from '@noshiro/react-blueprintjs-utils';
import { useKeyEventListener } from '@noshiro/react-utils';
import { Auth, ConfirmEmailDialogStore } from '../../store';
import { ButtonsWrapperAlignEnd } from '../styled';

const dc = dict.answerPage.eventInfo.verifyEmailDialog;

type ConfirmEmailDialogProps = Readonly<{
  isOpen: boolean;
}>;

export const ConfirmEmailDialog = memoNamed<ConfirmEmailDialogProps>(
  'ConfirmEmailDialog',
  ({ isOpen }) => {
    const state = useObservableValue(ConfirmEmailDialogStore.state);

    const helperText = useMemo(
      () =>
        pipe(state.formState.email.error).chainOptional((s) => <div>{s}</div>)
          .value,
      [state.formState.email.error],
    );

    const onKeyDown = useCallback((ev: KeyboardEvent) => {
      if (ev.key === 'Enter') {
        ConfirmEmailDialogStore.enterClickHandler();
      }
    }, []);

    useKeyEventListener(onKeyDown, noop);

    const fireAuthUser = Auth.useFireAuthUser();

    /** ログイン済みならemailを自動入力してsubmit */
    useEffect(() => {
      const email = fireAuthUser?.email;
      if (isString(email)) {
        ConfirmEmailDialogStore.inputEmailHandler(email);
        ConfirmEmailDialogStore.enterClickHandler();
      }
    }, [fireAuthUser?.email]);

    return (
      <DialogWithMaxWidth
        canEscapeKeyClose={false}
        canOutsideClickClose={false}
        icon={'key'}
        isCloseButtonShown={false}
        isOpen={isOpen}
        title={dc.editButtonConfirmDialogTitle}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>{dc.editButtonConfirmDialogMessage}</p>
          <InputWrapperWithMinHeight>
            <FormGroup
              helperText={helperText}
              intent={state.emailFormIntent}
              label={''}
            >
              <BpInput
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus={true}
                intent={state.emailFormIntent}
                rightElement={resetInputButton}
                type={'email'}
                value={state.formState.email.inputValue}
                onValueChange={ConfirmEmailDialogStore.inputEmailHandler}
              />
            </FormGroup>
          </InputWrapperWithMinHeight>
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <ButtonsWrapperAlignEnd>
            <Button
              intent={'none'}
              onClick={ConfirmEmailDialogStore.cancelClickHandler}
            >
              {dc.back}
            </Button>
            <Button
              disabled={state.enterButtonDisabled}
              intent={'primary'}
              loading={state.formState.isWaitingResponse}
              onClick={ConfirmEmailDialogStore.enterClickHandler}
            >
              {dict.common.buttonText.decide}
            </Button>
          </ButtonsWrapperAlignEnd>
        </div>
      </DialogWithMaxWidth>
    );
  },
);

const InputWrapperWithMinHeight = styled('div')`
  min-height: 72px;
`;

const resetInputButton = (
  <Button
    icon={'cross'}
    minimal={true}
    onClick={ConfirmEmailDialogStore.resetInput}
  />
);
