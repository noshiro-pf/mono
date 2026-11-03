import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import {
  constant,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
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
  const isWaitingResponse = view(state, (s) => s.formState.isWaitingResponse);

  const emailIntent = view(state, (s) => s.emailFormIntent);

  const passwordIntent = view(state, (s) => s.passwordFormIntent);

  const passwordIsOpen = view(state, (s) => s.passwordIsOpen);

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
            helperText={view(state, (s) => s.formState.email.error)}
            intent={emailIntent}
            label={constant(dc.updateEmail.newEmail)}
          >
            <InputGroup
              autoComplete={'username'}
              autoFocus
              data-e2e={constant('new-email')}
              disabled={isWaitingResponse}
              intent={emailIntent}
              type={'email'}
              value={view(state, (s) => s.formState.email.inputValue)}
              onInput={({ currentTarget }) => {
                UpdateEmailPageStore.inputEmailHandler(currentTarget.value);
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
              value={view(state, (s) => s.formState.password.inputValue)}
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
          disabled={view(state, (s) => s.enterButtonDisabled)}
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
