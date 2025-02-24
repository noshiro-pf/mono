import { Button, FormGroup } from '@blueprintjs/core';
import { BpInput } from '@noshiro/react-blueprintjs-utils';
import {
  UpdateEmailPageStore,
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

export const UpdateEmailDialog = memoNamed<Props>(
  'UpdateEmailDialog',
  ({ dialogIsOpen, currentEmail }) => {
    const {
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    } = useObservableValue(UpdateEmailPageStore.state);

    const passwordLockButton = useMemo(
      () => (
        <LockButton
          disabled={formState.isWaitingResponse}
          passwordIsOpen={passwordIsOpen}
          onLockClick={UpdateEmailPageStore.togglePasswordLock}
        />
      ),
      [formState.isWaitingResponse, passwordIsOpen],
    );

    const body = useMemo(
      () => (
        <div
          css={css`
            width: 300px;
            height: 200px;
          `}
        >
          <FormGroup intent={'none'} label={currentEmailInputLabel}>
            <div>{currentEmail ?? ''}</div>
          </FormGroup>
          <FormGroup
            helperText={formState.email.error}
            intent={emailFormIntent}
            label={newEmailInputLabel}
          >
            <BpInput
              autoComplete={'username'}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus={true}
              disabled={formState.isWaitingResponse}
              intent={emailFormIntent}
              type={'email'}
              value={formState.email.inputValue}
              onValueChange={UpdateEmailPageStore.inputEmailHandler}
            />
          </FormGroup>
          <FormGroup
            helperText={formState.password.error}
            intent={passwordFormIntent}
            label={passwordInputLabel}
          >
            <BpInput
              autoComplete={'current-password'}
              disabled={formState.isWaitingResponse}
              intent={passwordFormIntent}
              rightElement={passwordLockButton}
              type={passwordIsOpen ? 'text' : 'password'}
              value={formState.password.inputValue}
              onValueChange={UpdateEmailPageStore.inputPasswordHandler}
            />
          </FormGroup>
        </div>
      ),
      [
        currentEmail,
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
          intent={'primary'}
          loading={formState.isWaitingResponse}
          onClick={UpdateEmailPageStore.enterClickHandler}
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
        title={dc.updateEmail.title}
      />
    );
  },
);

const passwordInputLabel = <Label>{dc.reauthenticate.password}</Label>;
const currentEmailInputLabel = <Label>{dc.updateEmail.currentEmail}</Label>;
const newEmailInputLabel = <Label>{dc.updateEmail.newEmail}</Label>;
