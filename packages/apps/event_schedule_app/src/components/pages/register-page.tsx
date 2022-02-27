import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { experimentalFeature } from '../../env';
import { useRegisterPageState } from '../../hooks';
import { RegisterPageStore } from '../../store';
import { GoogleIcon, Label } from '../atoms';
import { BpInput } from '../bp';
import { LockButton, SignInStyled } from '../molecules';
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
    googleSignInButtonDisabled,
    googleSignInClickHandler,
  } = useRegisterPageState();

  return (
    <SignInStyled.Wrapper>
      <NavBar />

      <SignInStyled.Centering>
        <FormRectWrapper>
          <SignInStyled.FormRect onSubmit={returnFalse}>
            <SignInStyled.FormGroups>
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
            </SignInStyled.FormGroups>

            <SignInStyled.ButtonWrapper>
              <Button
                disabled={enterButtonDisabled}
                fill={true}
                intent={'primary'}
                loading={state.isWaitingResponse}
                onClick={enterClickHandler}
              >
                {dc.registerButton}
              </Button>
            </SignInStyled.ButtonWrapper>

            <SignInStyled.OtherErrorMessages>
              {state.otherErrors}
            </SignInStyled.OtherErrorMessages>
          </SignInStyled.FormRect>

          {experimentalFeature.googleAuth === 'hidden' ? undefined : (
            <>
              <SignInStyled.SeparatorWrapper>
                <SignInStyled.Separator />
                <SignInStyled.SepText>{dc.separator}</SignInStyled.SepText>
              </SignInStyled.SeparatorWrapper>

              <SignInStyled.ButtonWrapper>
                <SignInStyled.GoogleButton
                  disabled={googleSignInButtonDisabled}
                  fill={true}
                  intent={'none'}
                  loading={state.isWaitingResponse}
                  minimal={true}
                  outlined={true}
                  onClick={googleSignInClickHandler}
                >
                  <SignInStyled.GoogleButtonContentWrapper>
                    <SignInStyled.GoogleIconWrapper>
                      <GoogleIcon />
                    </SignInStyled.GoogleIconWrapper>
                    <SignInStyled.GoogleLoginButtonText>
                      {dc.google.register}
                    </SignInStyled.GoogleLoginButtonText>
                  </SignInStyled.GoogleButtonContentWrapper>
                </SignInStyled.GoogleButton>
              </SignInStyled.ButtonWrapper>
            </>
          )}
        </FormRectWrapper>
      </SignInStyled.Centering>
    </SignInStyled.Wrapper>
  );
});

const FormRectWrapper = styled(SignInStyled.FormRectWrapperBase)`
  height: ${430 + (experimentalFeature.googleAuth === 'shown' ? 80 : 0)}px;
`;
