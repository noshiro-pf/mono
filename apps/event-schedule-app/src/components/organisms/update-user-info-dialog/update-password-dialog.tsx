import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import {
  constant,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { UpdatePasswordPageStore } from '../../../store/index.mjs';
import { LockButton } from '../../molecules/index.mjs';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template.js';
import * as styles from './update-user-info-dialog.module.css';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: Bindable<boolean>;
  currentEmail: Bindable<string | null>;
}>;

const { state } = UpdatePasswordPageStore;

export const UpdatePasswordDialog = ({
  dialogIsOpen,
  currentEmail,
}: Props): JSX.Element => {
  const isWaitingResponse = view(state, (s) => s.formState.isWaitingResponse);

  const oldPasswordIntent = view(state, (s) => s.oldPasswordFormIntent);

  const newPasswordIntent = view(state, (s) => s.newPasswordFormIntent);

  const oldPasswordIsOpen = view(state, (s) => s.oldPasswordIsOpen);

  const newPasswordIsOpen = view(state, (s) => s.newPasswordIsOpen);

  return (
    <UpdateUserInfoDialogTemplate
      body={
        <div class={constant(styles.passwordBody)}>
          {/* The account the password manager files the new password under: https://yuzu441.hateblo.jp/entry/2020/11/16/190229 */}
          <FormGroup
            class={`${styles.field} ${styles.hidden}`}
            intent={'none'}
            label={constant(dc.updatePassword.currentEmail)}
          >
            <InputGroup
              autoComplete={'username'}
              intent={'none'}
              type={'email'}
              value={mapBindable(currentEmail, (email) => email ?? '')}
            />
          </FormGroup>
          <FormGroup
            class={styles.field}
            helperText={view(state, (s) => s.formState.oldPassword.error)}
            intent={oldPasswordIntent}
            label={constant(dc.updatePassword.oldPassword)}
          >
            <InputGroup
              autoComplete={'current-password'}
              autoFocus
              data-e2e={constant('old-password')}
              disabled={isWaitingResponse}
              intent={oldPasswordIntent}
              rightElement={
                <LockButton
                  disabled={isWaitingResponse}
                  passwordIsOpen={oldPasswordIsOpen}
                  onLockClick={UpdatePasswordPageStore.toggleOldPasswordLock}
                />
              }
              type={mapBindable(oldPasswordIsOpen, (open) =>
                open ? 'text' : 'password',
              )}
              value={view(state, (s) => s.formState.oldPassword.inputValue)}
              onInput={({ currentTarget }) => {
                UpdatePasswordPageStore.inputOldPasswordHandler(
                  currentTarget.value,
                );
              }}
            />
          </FormGroup>
          <FormGroup
            class={styles.field}
            helperText={view(
              state,
              (s) => s.formState.newPassword.password.error,
            )}
            intent={newPasswordIntent}
            label={constant(dc.updatePassword.newPassword)}
          >
            <InputGroup
              autoComplete={'new-password'}
              data-e2e={constant('new-password')}
              disabled={isWaitingResponse}
              intent={newPasswordIntent}
              type={'password'}
              value={view(
                state,
                (s) => s.formState.newPassword.password.inputValue,
              )}
              onInput={({ currentTarget }) => {
                UpdatePasswordPageStore.inputNewPasswordHandler(
                  currentTarget.value,
                );
              }}
            />
          </FormGroup>
          <FormGroup
            class={styles.field}
            helperText={view(
              state,
              (s) => s.formState.newPassword.passwordConfirmation.error,
            )}
            intent={newPasswordIntent}
            label={constant(dc.updatePassword.verifyNewPassword)}
          >
            <InputGroup
              autoComplete={'new-password'}
              data-e2e={constant('verify-new-password')}
              disabled={isWaitingResponse}
              intent={newPasswordIntent}
              rightElement={
                <LockButton
                  disabled={isWaitingResponse}
                  passwordIsOpen={newPasswordIsOpen}
                  onLockClick={UpdatePasswordPageStore.toggleNewPasswordLock}
                />
              }
              type={mapBindable(newPasswordIsOpen, (open) =>
                open ? 'text' : 'password',
              )}
              value={view(
                state,
                (s) => s.formState.newPassword.passwordConfirmation.inputValue,
              )}
              onInput={({ currentTarget }) => {
                UpdatePasswordPageStore.inputNewPasswordConfirmationHandler(
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
          intent={'primary'}
          loading={isWaitingResponse}
          text={constant(dc.button.update)}
          onClick={UpdatePasswordPageStore.enterClickHandler}
        />
      }
      title={dc.updatePassword.title}
    />
  );
};
