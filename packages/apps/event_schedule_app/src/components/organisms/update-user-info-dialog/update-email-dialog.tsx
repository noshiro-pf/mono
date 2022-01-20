import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { User } from 'firebase/auth';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { useUpdateEmailDialogState } from '../../../hooks';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = DeepReadonly<{
  dialogIsOpen: boolean;
  closeDialog: () => void;
  currentEmail: string;
  user: User;
}>;

export const UpdateEmailDialog = memoNamed<Props>(
  'UpdateEmailDialog',
  ({ dialogIsOpen, closeDialog, currentEmail, user }) => {
    const {
      state,
      enterClickHandler,
      inputEmailHandler,
      inputPasswordHandler,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
      togglePasswordLock,
      enterButtonDisabled,
    } = useUpdateEmailDialogState(
      currentEmail,
      dialogIsOpen,
      closeDialog,
      user
    );

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              intent={'none'}
              label={<Label>{dc.updateEmail.currentEmail}</Label>}
            >
              <div>{currentEmail}</div>
            </FormGroup>
            <FormGroup
              helperText={state.email.error}
              intent={emailFormIntent}
              label={<Label>{dc.updateEmail.label}</Label>}
            >
              <BpInput
                autoComplete={'username'}
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={emailFormIntent}
                type={'email'}
                value={state.email.inputValue}
                onValueChange={inputEmailHandler}
              />
            </FormGroup>
            <FormGroup
              helperText={state.password.error}
              intent={passwordFormIntent}
              label={<Label>{dc.reauthenticate.password}</Label>}
            >
              <BpInput
                autoComplete={'current-password'}
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    passwordIsOpen={passwordIsOpen}
                    onLockClick={togglePasswordLock}
                  />
                }
                type={passwordIsOpen ? 'text' : 'password'}
                value={state.password.inputValue}
                onValueChange={inputPasswordHandler}
              />
            </FormGroup>
          </Content>
        }
        closeDialog={closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={state.isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'primary'}
            loading={state.isWaitingResponse}
            onClick={enterClickHandler}
          >
            {dc.button.update}
          </Button>
        }
        title={dc.updateEmail.title}
      />
    );
  }
);

const Content = styled.div`
  width: 300px;
  height: 200px;
`;
