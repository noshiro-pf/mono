import { Button, FormGroup } from '@blueprintjs/core';
import { BpInput } from '@noshiro/react-blueprintjs-utils';
import {
  DeleteAccountPageStore,
  UpdateUserInfoDialogStore,
} from '../../../store';
import { Label } from '../../atoms';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = Readonly<{
  dialogIsOpen: boolean;
}>;

export const DeleteAccountDialog = memoNamed<Props>(
  'DeleteAccountDialog',
  ({ dialogIsOpen }) => {
    const {
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    } = useObservableValue(DeleteAccountPageStore.state);

    const passwordLockButton = useMemo(
      () => (
        <LockButton
          disabled={formState.isWaitingResponse}
          passwordIsOpen={passwordIsOpen}
          onLockClick={DeleteAccountPageStore.togglePasswordLock}
        />
      ),
      [formState.isWaitingResponse, passwordIsOpen],
    );

    const body = useMemo(
      () => (
        <div
          css={css`
            width: 300px;
            height: 160px;
          `}
        >
          <FormGroup
            helperText={formState.email.error}
            intent={emailFormIntent}
            label={verifyEmailInputLabel}
          >
            <BpInput
              // suppress auto complete
              autoComplete={'new-password'}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              disabled={formState.isWaitingResponse}
              intent={emailFormIntent}
              type={'email'}
              value={formState.email.inputValue}
              onValueChange={DeleteAccountPageStore.inputEmailHandler}
            />
          </FormGroup>
          <FormGroup
            helperText={formState.password.error}
            intent={passwordFormIntent}
            label={passwordInputLabel}
          >
            <BpInput
              // suppress auto complete
              autoComplete={'new-password'}
              disabled={formState.isWaitingResponse}
              intent={passwordFormIntent}
              rightElement={passwordLockButton}
              type={passwordIsOpen ? 'text' : 'password'}
              value={formState.password.inputValue}
              onValueChange={DeleteAccountPageStore.inputPasswordHandler}
            />
          </FormGroup>
        </div>
      ),
      [
        emailFormIntent,
        formState.email.error,
        formState.email.inputValue,
        formState.isWaitingResponse,
        formState.password.error,
        formState.password.inputValue,
        passwordFormIntent,
        passwordIsOpen,
        passwordLockButton,
      ],
    );

    const submitButton = useMemo(
      () => (
        <Button
          disabled={enterButtonDisabled}
          intent={'danger'}
          loading={formState.isWaitingResponse}
          onClick={DeleteAccountPageStore.enterClickHandler}
        >
          {dc.button.deleteAccount}
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
        title={dc.deleteAccount.title}
      />
    );
  },
);

const passwordInputLabel = <Label>{dc.reauthenticate.password}</Label>;
const verifyEmailInputLabel = <Label>{dc.deleteAccount.verifyEmail}</Label>;
