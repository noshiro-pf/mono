import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { UpdateEmailPageStore } from '../../../store/index.mjs';
import { LockButton } from '../../molecules/index.mjs';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template.js';
import * as styles from './update-user-info-dialog.module.css';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: Bindable<boolean>;
  currentEmail: Bindable<string | null>;
}>;

const { state } = UpdateEmailPageStore;

export const UpdateEmailDialog = ({
  dialogIsOpen,
  currentEmail,
}: Props): JSX.Element => {
  const isWaitingResponse = state.pipe(
    map((s) => s.formState.isWaitingResponse),
  );

  const emailIntent = state.pipe(map((s) => s.emailFormIntent));

  const passwordIntent = state.pipe(map((s) => s.passwordFormIntent));

  const passwordIsOpen = state.pipe(map((s) => s.passwordIsOpen));

  return (
    <UpdateUserInfoDialogTemplate
      body={
        <div class={constant(styles.emailBody)}>
          <FormGroup
            class={styles.field}
            intent={'none'}
            label={constant(dc.updateEmail.currentEmail)}
          >
            <div>{mapBindable(currentEmail, (email) => email ?? '')}</div>
          </FormGroup>
          <FormGroup
            class={styles.field}
            helperText={state.pipe(map((s) => s.formState.email.error))}
            intent={emailIntent}
            label={constant(dc.updateEmail.newEmail)}
          >
            <InputGroup
              autoComplete={'username'}
              // eslint-disable-next-line synstate-dom-a11y/no-autofocus -- focus moves into a dialog as it opens, as the WAI-ARIA dialog pattern asks
              autoFocus
              data-e2e={constant('new-email')}
              disabled={isWaitingResponse}
              intent={emailIntent}
              type={'email'}
              value={state.pipe(map((s) => s.formState.email.inputValue))}
              onInput={({ currentTarget }) => {
                UpdateEmailPageStore.inputEmailHandler(currentTarget.value);
              }}
            />
          </FormGroup>
          <FormGroup
            class={styles.field}
            helperText={state.pipe(map((s) => s.formState.password.error))}
            intent={passwordIntent}
            label={constant(dc.reauthenticate.password)}
          >
            <InputGroup
              autoComplete={'current-password'}
              data-e2e={constant('password')}
              disabled={isWaitingResponse}
              intent={passwordIntent}
              rightElement={
                <LockButton
                  disabled={isWaitingResponse}
                  passwordIsOpen={passwordIsOpen}
                  onLockClick={UpdateEmailPageStore.togglePasswordLock}
                />
              }
              type={mapBindable(passwordIsOpen, (open) =>
                open ? 'text' : 'password',
              )}
              value={state.pipe(map((s) => s.formState.password.inputValue))}
              onInput={({ currentTarget }) => {
                UpdateEmailPageStore.inputPasswordHandler(currentTarget.value);
              }}
            />
          </FormGroup>
        </div>
      }
      dialogIsOpen={dialogIsOpen}
      isWaitingResponse={isWaitingResponse}
      submitButton={
        <Button
          disabled={state.pipe(map((s) => s.enterButtonDisabled))}
          intent={'primary'}
          loading={isWaitingResponse}
          text={constant(dc.button.update)}
          onClick={UpdateEmailPageStore.enterClickHandler}
        />
      }
      title={dc.updateEmail.title}
    />
  );
};
