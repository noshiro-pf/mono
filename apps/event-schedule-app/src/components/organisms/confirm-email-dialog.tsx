import { Button, Dialog, FormGroup, InputGroup } from 'blueprint-synstate';
import {
  constant,
  createAfterUpdate,
  isImeKeyDown,
  listenInScope,
  subscribeInScope,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { isString } from 'ts-data-forge';
import { dict } from '../../constants/index.mjs';
import { Auth, ConfirmEmailDialogStore } from '../../store/index.mjs';
import {
  ButtonsWrapperAlignEnd,
  maxWidthModalClass,
} from '../styled/index.mjs';
import * as styles from './dialogs.module.css';

const dc = dict.answerPage.eventInfo.verifyEmailDialog;

type ConfirmEmailDialogProps = Readonly<{ isOpen: Bindable<boolean> }>;

const { state } = ConfirmEmailDialogStore;

export const ConfirmEmailDialog = ({
  isOpen,
}: ConfirmEmailDialogProps): JSX.Element => {
  listenInScope(globalThis, 'keydown', (event) => {
    if (
      event instanceof KeyboardEvent &&
      event.key === 'Enter' &&
      !isImeKeyDown(event)
    ) {
      ConfirmEmailDialogStore.enterClickHandler();
    }
  });

  const afterUpdate = createAfterUpdate();

  // ログイン済みならemailを自動入力してsubmit
  subscribeInScope(Auth.email$, (email) => {
    if (!isString(email)) {
      return;
    }

    // Once the update that brought the user has finished.
    afterUpdate(() => {
      ConfirmEmailDialogStore.inputEmailHandler(email);

      ConfirmEmailDialogStore.enterClickHandler();
    });
  });

  const intent = view(state, (s) => s.emailFormIntent);

  return (
    <Dialog
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      class={maxWidthModalClass}
      icon={'key'}
      isCloseButtonShown={false}
      isOpen={isOpen}
      title={constant(dc.editButtonConfirmDialogTitle)}
    >
      <div class={constant('bp6-dialog-body')}>
        <p>{constant(dc.editButtonConfirmDialogMessage)}</p>
        <div class={constant(styles.inputWrapper)}>
          <FormGroup
            helperText={view(state, (s) => s.formState.email.error)}
            intent={intent}
            label={constant('')}
          >
            <InputGroup
              autoFocus
              intent={intent}
              rightElement={
                <Button
                  icon={'cross'}
                  variant={constant('minimal')}
                  onClick={ConfirmEmailDialogStore.resetInput}
                />
              }
              type={'email'}
              value={view(state, (s) => s.formState.email.inputValue)}
              onInput={({ currentTarget }) => {
                ConfirmEmailDialogStore.inputEmailHandler(currentTarget.value);
              }}
            />
          </FormGroup>
        </div>
      </div>
      <div class={constant('bp6-dialog-footer')}>
        <ButtonsWrapperAlignEnd>
          <Button
            intent={'none'}
            text={constant(dc.back)}
            onClick={ConfirmEmailDialogStore.cancelClickHandler}
          />
          <Button
            disabled={view(state, (s) => s.enterButtonDisabled)}
            intent={'primary'}
            loading={view(state, (s) => s.formState.isWaitingResponse)}
            text={constant(dict.common.buttonText.decide)}
            onClick={ConfirmEmailDialogStore.enterClickHandler}
          />
        </ButtonsWrapperAlignEnd>
      </div>
    </Dialog>
  );
};
