import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import {
  constant,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { DeleteAccountPageStore } from '../../../store/index.mjs';
import { LockButton } from '../../molecules/index.mjs';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template.js';
import * as styles from './update-user-info-dialog.module.css';

const dc = dict.accountSettings;

type Props = Readonly<{ dialogIsOpen: Bindable<boolean> }>;

const { state } = DeleteAccountPageStore;

export const DeleteAccountDialog = ({ dialogIsOpen }: Props): JSX.Element => {
  const isWaitingResponse = view(state, (s) => s.formState.isWaitingResponse);

  const emailIntent = view(state, (s) => s.emailFormIntent);

  const passwordIntent = view(state, (s) => s.passwordFormIntent);

  const passwordIsOpen = view(state, (s) => s.passwordIsOpen);

  return (
    <UpdateUserInfoDialogTemplate
      body={
        <div class={constant(styles.deleteAccountBody)}>
          <FormGroup
            class={styles.field}
            helperText={view(state, (s) => s.formState.email.error)}
            intent={emailIntent}
            label={constant(dc.deleteAccount.verifyEmail)}
          >
            <InputGroup
              // suppress auto complete
              autoComplete={'new-password'}
              autoFocus
              data-e2e={constant('verify-email')}
              disabled={isWaitingResponse}
              intent={emailIntent}
              type={'email'}
              value={view(state, (s) => s.formState.email.inputValue)}
              onInput={({ currentTarget }) => {
                DeleteAccountPageStore.inputEmailHandler(currentTarget.value);
              }}
            />
          </FormGroup>
          <FormGroup
            class={styles.field}
            helperText={view(state, (s) => s.formState.password.error)}
            intent={passwordIntent}
            label={constant(dc.reauthenticate.password)}
          >
            <InputGroup
              // suppress auto complete
              autoComplete={'new-password'}
              data-e2e={constant('password')}
              disabled={isWaitingResponse}
              intent={passwordIntent}
              rightElement={
                <LockButton
                  disabled={isWaitingResponse}
                  passwordIsOpen={passwordIsOpen}
                  onLockClick={DeleteAccountPageStore.togglePasswordLock}
                />
              }
              type={mapBindable(passwordIsOpen, (open) =>
                open ? 'text' : 'password',
              )}
              value={view(state, (s) => s.formState.password.inputValue)}
              onInput={({ currentTarget }) => {
                DeleteAccountPageStore.inputPasswordHandler(
                  currentTarget.value,
                );
              }}
            />
          </FormGroup>
        </div>
      }
      dialogIsOpen={dialogIsOpen}
      isWaitingResponse={isWaitingResponse}
      submitButton={
        <Button
          disabled={view(state, (s) => s.enterButtonDisabled)}
          intent={'danger'}
          loading={isWaitingResponse}
          text={constant(dc.button.deleteAccount)}
          onClick={DeleteAccountPageStore.enterClickHandler}
        />
      }
      title={dc.deleteAccount.title}
    />
  );
};
