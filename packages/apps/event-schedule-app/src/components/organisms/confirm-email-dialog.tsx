import { Button, Classes, FormGroup } from '@blueprintjs/core';
import { useKeyEventListener } from '@noshiro/react-utils';
import { Auth, ConfirmEmailDialogStore } from '../../store';
import { BpInput, DialogWithMaxWidth } from '../bp';
import { ButtonsWrapperAlignEnd } from '../styled';

const dc = dict.answerPage.eventInfo.verifyEmailDialog;

type ConfirmEmailDialogProps = Readonly<{
  isOpen: boolean;
}>;

export const ConfirmEmailDialog = memoNamed<ConfirmEmailDialogProps>(
  'ConfirmEmailDialog',
  ({ isOpen }) => {
    const state = useObservableValue(ConfirmEmailDialogStore.state$);

    const helperText = useMemo(
      () =>
        pipe(state.formState.email.error).chainOptional((s) => <div>{s}</div>)
          .value,
      [state.formState.email.error],
    );

    const onKeyDown = useCallback(
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      (ev: KeyboardEvent) => {
        if (ev.key === 'Enter') {
          ConfirmEmailDialogStore.enterClickHandler();
        }
      },
      [],
    );

    useKeyEventListener(onKeyDown, noop);

    const fireAuthUser = Auth.useFireAuthUser();

    /**
     * ログイン済みならemailを自動入力してsubmit
     */
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
        hasBackdrop={false}
        icon='key'
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
                autoFocus={true}
                intent={state.emailFormIntent}
                rightElement={
                  <Button
                    icon={'cross'}
                    minimal={true}
                    onClick={ConfirmEmailDialogStore.resetInput}
                  />
                }
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
