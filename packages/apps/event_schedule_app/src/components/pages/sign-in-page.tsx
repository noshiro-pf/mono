import type { Intent } from '@blueprintjs/core';
import { Button, FormGroup, Spinner } from '@blueprintjs/core';
import {
  memoNamed,
  useBooleanState,
  useToggleState,
} from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { useSignInPageState } from '../../hooks';
import { BpInput } from '../bp';
import { LockButton } from '../molecules';
import { NavBar } from '../organisms';

const dc = dict.register;

const returnFalse = (): false => false;

export const SignInPage = memoNamed('S ignInPage', () => {
  const {
    state,
    hasError,
    enterClickHandler,
    inputEmailHandler,
    inputPasswordHandler,
  } = useSignInPageState();

  const emailFormIntent: Intent =
    state.error.email === undefined ? 'primary' : 'danger';

  const passwordFormIntent: Intent =
    state.error.password === undefined ? 'primary' : 'danger';

  const [showPassword, handleLockClick] = useToggleState(false);

  const [isPasswordResetForm, showPasswordResetForm, hidePasswordResetForm] =
    useBooleanState(false);

  return (
    <Wrapper>
      <NavBar />

      <Centering>
        <FormRect onSubmit={returnFalse}>
          {isPasswordResetForm ? (
            <BackButtonWrapper>
              <Button onClick={hidePasswordResetForm}> {'戻る'}</Button>
            </BackButtonWrapper>
          ) : undefined}
          <Title>{dc.title.signIn}</Title>
          <FormGroups>
            <Label>{dc.email}</Label>
            <FormGroup
              helperText={state.error.email}
              intent={emailFormIntent}
              label={''}
            >
              <BpInput
                autoComplete={'email'}
                autoFocus={true}
                disabled={state.isWaitingResponse}
                intent={emailFormIntent}
                placeholder={'sample@gmail.com'}
                type={'email'}
                value={state.inputValue.email}
                onValueChange={inputEmailHandler}
              />
            </FormGroup>

            <Label>{dc.password}</Label>
            <FormGroup
              helperText={state.error.password}
              intent={passwordFormIntent}
              label={''}
            >
              <BpInput
                autoComplete={'current-password'}
                disabled={state.isWaitingResponse}
                intent={passwordFormIntent}
                rightElement={
                  <LockButton
                    disabled={state.isWaitingResponse}
                    showPassword={showPassword}
                    onLockClick={handleLockClick}
                  />
                }
                type={showPassword ? 'text' : 'password'}
                value={state.inputValue.password}
                onValueChange={inputPasswordHandler}
              />
            </FormGroup>

            <ErrorMessage>{state.error.others}</ErrorMessage>
          </FormGroups>

          <PasswordResetWrapper>
            <PasswordReset onClick={showPasswordResetForm}>
              {dc.resetPassword}
            </PasswordReset>
          </PasswordResetWrapper>

          <ButtonWrapper>
            <Button
              disabled={hasError || state.isWaitingResponse}
              intent={'primary'}
              type={'submit'}
              onClick={enterClickHandler}
            >
              {state.isWaitingResponse ? (
                <Spinner size={20} />
              ) : (
                <span>{dc.signInButton}</span>
              )}
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
  height: 400px;
  min-height: max-content;
  border-radius: 10px;
  background-color: white;
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));

  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;
`;

const BackButtonWrapper = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const FormGroups = styled.div`
  margin-bottom: 10px;
  width: 220px;
  max-width: 220px;
`;

const Label = styled.div`
  color: #757575;
  font-size: 12px;
  margin-bottom: 5px;
`;

const PasswordResetWrapper = styled.div`
  margin: 10px;
`;

const PasswordReset = styled.div`
  color: #106ba3;
  cursor: pointer;
`;

const ButtonWrapper = styled.div`
  margin: 10px;
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 12px;
  margin: 10px 0;
`;
