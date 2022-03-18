import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import type { User } from 'firebase/auth';
import { useCallback } from 'react';
import styled from 'styled-components';
import { dict } from '../../../constants';
import { UpdateEmailPage, UpdateUserInfoDialogState } from '../../../store';
import { Label } from '../../atoms';
import { BpInput } from '../../bp';
import { LockButton } from '../../molecules';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template';

const dc = dict.accountSettings;

type Props = DeepReadonly<{
  dialogIsOpen: boolean;
  user: User;
}>;

export const UpdateEmailDialog = memoNamed<Props>(
  'UpdateEmailDialog',
  ({ dialogIsOpen, user }) => {
    const {
      formState,
      enterButtonDisabled,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    } = useObservableValue(UpdateEmailPage.state$);

    const enterClickHandler = useCallback(() => {
      if (enterButtonDisabled) return;

      UpdateEmailPage.submit(user).catch(console.error);
    }, [enterButtonDisabled, user]);

    return (
      <UpdateUserInfoDialogTemplate
        body={
          <Content>
            <FormGroup
              intent={'none'}
              label={<Label>{dc.updateEmail.currentEmail}</Label>}
            >
              <div>{user.email ?? ''}</div>
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
                onValueChange={UpdateEmailPage.inputEmailHandler}
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
                    onLockClick={UpdateEmailPage.togglePasswordLock}
                  />
                }
                type={passwordIsOpen ? 'text' : 'password'}
                value={formState.password.inputValue}
                onValueChange={UpdateEmailPage.inputPasswordHandler}
              />
            </FormGroup>
          </Content>
        }
        closeDialog={UpdateUserInfoDialogState.closeDialog}
        dialogIsOpen={dialogIsOpen}
        isWaitingResponse={formState.isWaitingResponse}
        submitButton={
          <Button
            disabled={enterButtonDisabled}
            intent={'primary'}
            loading={formState.isWaitingResponse}
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
