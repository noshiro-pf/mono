import { Button, FormGroup } from '@blueprintjs/core';
import { BpInput } from '@noshiro/react-blueprintjs-utils';
import {
  UpdatePasswordPageStore,
  UpdateUserInfoDialogStore,
} from '../../../store';
import { Label } from '../../atoms';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: boolean;
  currentEmail: string | null;
}>;

// https://yuzu441.hateblo.jp/entry/2020/11/16/190229
const hideStyle: React.CSSProperties = { display: 'none' };

export const UpdatePasswordDialog = memoNamed<Props>(
  'UpdatePasswordDialog',
  ({ dialogIsOpen, currentEmail }) => {
    const {
      formState,
      enterButtonDisabled,
      oldPasswordFormIntent,
      newPasswordFormIntent,
      oldPasswordIsOpen,
      newPasswordIsOpen,
    } = useObservableValue(UpdatePasswordPageStore.state);

    const newPasswordLockButton = useMemo(
      () => (
        <LockButton
          disabled={formState.isWaitingResponse}
          passwordIsOpen={newPasswordIsOpen}
          onLockClick={UpdatePasswordPageStore.toggleNewPasswordLock}
        />
      ),
      [formState.isWaitingResponse, newPasswordIsOpen],
    );

    const oldPasswordInputButton = useMemo(
      () => (
        <LockButton
          disabled={formState.isWaitingResponse}
          passwordIsOpen={oldPasswordIsOpen}
          onLockClick={UpdatePasswordPageStore.toggleOldPasswordLock}
        />
      ),
      [formState.isWaitingResponse, oldPasswordIsOpen],
    );

    const body = useMemo(
      () => (
        <div
          css={css`
            width: 300px;
            height: 200px;
          `}
        >
          <FormGroup
            intent={'none'}
            label={currentEmailInputLabel}
            style={hideStyle}
          >
            <BpInput
              autoComplete={'current-email'}
              disabled={false}
              intent={'none'}
              type={'email'}
              value={currentEmail ?? ''}
              onValueChange={noop}
            />
          </FormGroup>

          <FormGroup
            helperText={formState.oldPassword.error}
            intent={oldPasswordFormIntent}
            label={oldPasswordInputLabel}
          >
            <BpInput
              autoComplete={'current-password'}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              disabled={formState.isWaitingResponse}
              intent={oldPasswordFormIntent}
              rightElement={oldPasswordInputButton}
              type={oldPasswordIsOpen ? 'text' : 'password'}
              value={formState.oldPassword.inputValue}
              onValueChange={UpdatePasswordPageStore.inputOldPasswordHandler}
            />
          </FormGroup>

          <FormGroup
            helperText={formState.newPassword.password.error}
            intent={newPasswordFormIntent}
            label={newPasswordInputLabel}
          >
            <BpInput
              autoComplete={'new-password'}
              disabled={formState.isWaitingResponse}
              intent={newPasswordFormIntent}
              type={'password'}
              value={formState.newPassword.password.inputValue}
              onValueChange={UpdatePasswordPageStore.inputNewPasswordHandler}
            />
          </FormGroup>

          <FormGroup
            helperText={formState.newPassword.passwordConfirmation.error}
            intent={newPasswordFormIntent}
            label={verifyNewPasswordInputLabel}
          >
            <BpInput
              autoComplete={'new-password'}
              disabled={formState.isWaitingResponse}
              intent={newPasswordFormIntent}
              rightElement={newPasswordLockButton}
              type={newPasswordIsOpen ? 'text' : 'password'}
              value={formState.newPassword.passwordConfirmation.inputValue}
              onValueChange={
                UpdatePasswordPageStore.inputNewPasswordConfirmationHandler
              }
            />
          </FormGroup>
        </div>
      ),
      [
        currentEmail,
        formState.isWaitingResponse,
        formState.newPassword.password.error,
        formState.newPassword.password.inputValue,
        formState.newPassword.passwordConfirmation.error,
        formState.newPassword.passwordConfirmation.inputValue,
        formState.oldPassword.error,
        formState.oldPassword.inputValue,
        newPasswordFormIntent,
        newPasswordIsOpen,
        newPasswordLockButton,
        oldPasswordFormIntent,
        oldPasswordInputButton,
        oldPasswordIsOpen,
      ],
    );

    const submitButton = useMemo(
      () => (
        <Button
          disabled={enterButtonDisabled}
          intent={'primary'}
          loading={formState.isWaitingResponse}
          onClick={UpdatePasswordPageStore.enterClickHandler}
        >
          {dc.button.update}
        </Button>
      ),
      [enterButtonDisabled, formState.isWaitingResponse],
    );

    return (
      <UpdateUserInfoDialogTemplate
        body={body}
        closeDialog={UpdateUserInfoDialogStore.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={formState.isWaitingResponse}
        submitButton={submitButton}
        title={dc.updatePassword.title}
      />
    );
  },
);

const oldPasswordInputLabel = <Label>{dc.updatePassword.oldPassword}</Label>;
const currentEmailInputLabel = <Label>{dc.updatePassword.currentEmail}</Label>;
const newPasswordInputLabel = <Label>{dc.updatePassword.newPassword}</Label>;
const verifyNewPasswordInputLabel = (
  <Label>{dc.updatePassword.verifyNewPassword}</Label>
);
