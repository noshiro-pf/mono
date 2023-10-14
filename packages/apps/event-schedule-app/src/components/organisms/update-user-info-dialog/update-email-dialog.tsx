import { Button, FormGroup } from '@blueprintjs/core';
import {
  UpdateEmailPageStore,
  UpdateUserInfoDialogStore,
} from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
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
    } = useObservableValue(UpdateEmailPageStore.state$);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <div
            css={css`
              width: 300px;
              height: 200px;
            `}
          >
            <FormGroup
              intent={'none'}
              label={<Label>{dc.updateEmail.currentEmail}</Label>}
            >
              <div>{currentEmail ?? ''}</div>
            </FormGroup>
            <FormGroup
              helperText={formState.email.error}
              intent={emailFormIntent}
              label={<Label>{dc.updateEmail.newEmail}</Label>}
            >
              <BpInput
                autoComplete={'username'}
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
              label={<Label>{dc.reauthenticate.password}</Label>}
            >
              <BpInput
                autoComplete={'current-password'}
                disabled={formState.isWaitingResponse}
                intent={passwordFormIntent}
                rightElement={
                  <LockButton
                    disabled={formState.isWaitingResponse}
                    passwordIsOpen={passwordIsOpen}
                    onLockClick={UpdateEmailPageStore.togglePasswordLock}
                  />
                }
                type={passwordIsOpen ? 'text' : 'password'}
                value={formState.password.inputValue}
                onValueChange={UpdateEmailPageStore.inputPasswordHandler}
              />
            </FormGroup>
          </div>
        }
        closeDialog={UpdateUserInfoDialogStore.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={formState.isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'primary'}
            loading={formState.isWaitingResponse}
            onClick={UpdateEmailPageStore.enterClickHandler}
          >
            {dc.button.update}
          </Button>
        }
        title={dc.updateEmail.title}
      />
    );
  },
);
