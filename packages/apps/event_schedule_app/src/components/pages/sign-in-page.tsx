import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { useResetPasswordPageState, useSignInPageState } from '../../hooks';
import { ResetPasswordPageStore, SignInPageStore } from '../../store';
import { Label } from '../atoms';
import { BpInput } from '../bp';
import { LockButton } from '../molecules';
import { NavBar } from '../organisms';

const dc = dict.register;

const returnFalse = (): false => false;

export const SignInPage = memoNamed('SignInPage', () => {
  const signInState = useSignInPageState();

  const [isPasswordResetForm, passwordIsOpenResetForm, hidePasswordResetForm] =
    useBooleanState(false);

  const resetPasswordState = useResetPasswordPageState();

  return (
    <Wrapper>
      <NavBar />

      <Centering>
        <FormRect onSubmit={returnFalse}>
          {isPasswordResetForm ? (
            <>
              <BackButtonWrapper>
                <Button
                  icon={'chevron-left'}
                  intent={'none'}
                  minimal={true}
                  onClick={hidePasswordResetForm}
                >
                  {dc.resetPasswordMode.back}
                </Button>
              </BackButtonWrapper>

              <Title>{dc.resetPasswordMode.title}</Title>

              <FormGroups>
                <FormGroup
                  helperText={resetPasswordState.state.email.error}
                  intent={resetPasswordState.emailFormIntent}
                  label={<Label>{dc.email}</Label>}
                >
                  <BpInput
                    autoComplete={'email'}
                    autoFocus={true}
                    disabled={resetPasswordState.state.isWaitingResponse}
                    intent={resetPasswordState.emailFormIntent}
                    type={'email'}
                    value={resetPasswordState.state.email.inputValue}
                    onValueChange={ResetPasswordPageStore.inputEmailHandler}
                  />
                </FormGroup>
              </FormGroups>

              <ButtonWrapper>
                <Button
                  disabled={resetPasswordState.enterButtonDisabled}
                  intent={'primary'}
                  loading={resetPasswordState.state.isWaitingResponse}
                  onClick={resetPasswordState.enterClickHandler}
                >
                  {dc.resetPasswordMode.submit}
                </Button>
              </ButtonWrapper>
            </>
          ) : (
            <>
              <Title>{dc.title.signIn}</Title>
              <FormGroups>
                <FormGroup
                  helperText={signInState.state.email.error}
                  intent={signInState.emailFormIntent}
                  label={<Label>{dc.email}</Label>}
                >
                  <BpInput
                    autoComplete={'email'}
                    autoFocus={true}
                    disabled={signInState.state.isWaitingResponse}
                    intent={signInState.emailFormIntent}
                    placeholder={'sample@gmail.com'}
                    type={'email'}
                    value={signInState.state.email.inputValue}
                    onValueChange={SignInPageStore.inputEmailHandler}
                  />
                </FormGroup>

                <FormGroup
                  helperText={signInState.state.password.error}
                  intent={signInState.passwordFormIntent}
                  label={<Label>{dc.password}</Label>}
                >
                  <BpInput
                    autoComplete={'current-password'}
                    disabled={signInState.state.isWaitingResponse}
                    intent={signInState.passwordFormIntent}
                    rightElement={
                      <LockButton
                        disabled={signInState.state.isWaitingResponse}
                        passwordIsOpen={signInState.passwordIsOpen}
                        onLockClick={SignInPageStore.togglePasswordLock}
                      />
                    }
                    type={signInState.passwordIsOpen ? 'text' : 'password'}
                    value={signInState.state.password.inputValue}
                    onValueChange={SignInPageStore.inputPasswordHandler}
                  />
                </FormGroup>

                <OtherErrorMessages>
                  {signInState.state.otherErrors}
                </OtherErrorMessages>
              </FormGroups>

              <PasswordResetWrapper>
                <PasswordReset onClick={passwordIsOpenResetForm}>
                  {dc.resetPassword}
                </PasswordReset>
              </PasswordResetWrapper>

              <ButtonWrapper>
                <Button
                  disabled={signInState.enterButtonDisabled}
                  intent={'primary'}
                  loading={signInState.state.isWaitingResponse}
                  onClick={signInState.enterClickHandler}
                >
                  {dc.signInButton}
                </Button>
              </ButtonWrapper>
            </>
          )}
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
  height: 440px;
  min-height: max-content;
  border-radius: 10px;
  background-color: white;
  filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.25));

  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;

  position: relative;
`;

const BackButtonWrapper = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const FormGroups = styled.div`
  margin-bottom: 10px;
  width: 220px;
  max-width: 220px;
`;

const PasswordResetWrapper = styled.div`
  margin: 10px;
`;

const PasswordReset = styled.div`
  color: #106ba3;
  cursor: pointer;
  font-size: 12px;
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
