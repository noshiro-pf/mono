import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { useRegisterPageState } from '../../hooks';
import { RegisterPageStore } from '../../store';
import { Label } from '../atoms';
import { BpInput } from '../bp';
import { LockButton } from '../molecules';
import { NavBar } from '../organisms';

const dc = dict.register;

const returnFalse = (): false => false;

export const RegisterPage = memoNamed('RegisterPage', () => {
  const {
    state,
    enterClickHandler,
    usernameFormIntent,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
    enterButtonDisabled,
  } = useRegisterPageState();

  return (
    <Wrapper>
      <NavBar />

      <Centering>
        <FormRect onSubmit={returnFalse}>
          <Title>{dc.title.register}</Title>
          <FormGroups>
            <FormGroup
              helperText={state.username.error}
              intent={usernameFormIntent}
              label={<Label>{dc.username}</Label>}
            >
              <BpInput
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={usernameFormIntent}
                type={'text'}
                value={state.username.inputValue}
                onValueChange={RegisterPageStore.inputUsernameHandler}
              />
            </FormGroup>

            <FormGroup
              helperText={state.email.error}
              intent={emailFormIntent}
              label={<Label>{dc.email}</Label>}
            >
              <BpInput
                autoComplete={'username'}
                disabled={state.isWaitingResponse}
                intent={emailFormIntent}
                placeholder={'sample@gmail.com'}
                type={'email'}
                value={state.email.inputValue}
                onValueChange={RegisterPageStore.inputEmailHandler}
              />
            </FormGroup>

            <FormGroup
              helperText={state.password.password.error}
              intent={passwordFormIntent}
              label={<Label>{dc.password}</Label>}
            >
              <BpInput
                autoComplete={'new-password'}
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                type={'password'}
                value={state.password.password.inputValue}
                onValueChange={RegisterPageStore.inputPasswordHandler}
              />
            </FormGroup>

            <FormGroup
              helperText={state.password.passwordConfirmation.error}
              intent={passwordFormIntent}
              label={<Label>{dc.verifyPassword}</Label>}
            >
              <BpInput
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    passwordIsOpen={passwordIsOpen}
                    onLockClick={RegisterPageStore.togglePasswordLock}
                  />
                }
                type={passwordIsOpen ? 'text' : 'password'}
                value={state.password.passwordConfirmation.inputValue}
                onValueChange={
                  RegisterPageStore.inputPasswordConfirmationHandler
                }
              />
            </FormGroup>

            <OtherErrorMessages>{state.otherErrors}</OtherErrorMessages>
          </FormGroups>

          <ButtonWrapper>
            <Button
              disabled={enterButtonDisabled}
              intent={'primary'}
              loading={state.isWaitingResponse}
              type={'submit'}
              onClick={enterClickHandler}
            >
              {dc.registerButton}
            </Button>
          </ButtonWrapper>
        </FormRect>
      </Centering>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Centering = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const FormRect = styled.form`
  width: 400px;
  height: 540px;
  min-height: max-content;
  border-radius: 10px;
  background-color: white;
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));

  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const FormGroups = styled.div`
  margin-bottom: 10px;
  width: 220px;
  max-width: 220px;
`;

const ButtonWrapper = styled.div`
  margin: 10px;
`;

const OtherErrorMessages = styled.div`
  color: red;
  font-size: 12px;
  margin: 10px 0;
  max-height: 50px;
  overflow-y: auto;
`;
