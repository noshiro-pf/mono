import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
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
    formState,
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
                helperText={formState.username.error}
                intent={usernameFormIntent}
                label={<Label>{dc.username}</Label>}
              >
                <BpInput
                  autoFocus={true}
                  disabled={formState.isWaitingResponse}
                  intent={usernameFormIntent}
                  type={'text'}
                  value={formState.username.inputValue}
                  onValueChange={RegisterPageStore.inputUsernameHandler}
                />
              </FormGroup>

              <FormGroup
                helperText={formState.email.error}
                intent={emailFormIntent}
                label={<Label>{dc.email}</Label>}
              >
                <BpInput
                  autoComplete={'username'}
                  disabled={formState.isWaitingResponse}
                  intent={emailFormIntent}
                  placeholder={'sample@gmail.com'}
                  type={'email'}
                  value={formState.email.inputValue}
                  onValueChange={RegisterPageStore.inputEmailHandler}
                />
              </FormGroup>

              <FormGroup
                helperText={formState.password.password.error}
                intent={passwordFormIntent}
                label={<Label>{dc.password}</Label>}
              >
                <BpInput
                  autoComplete={'new-password'}
                  disabled={formState.isWaitingResponse}
                  intent={passwordFormIntent}
                  type={'password'}
                  value={formState.password.password.inputValue}
                  onValueChange={RegisterPageStore.inputPasswordHandler}
                />
              </FormGroup>

              <FormGroup
                helperText={formState.password.passwordConfirmation.error}
                intent={passwordFormIntent}
                label={<Label>{dc.verifyPassword}</Label>}
              >
                <BpInput
                  disabled={formState.isWaitingResponse}
                  intent={passwordFormIntent}
                  rightElement={
                    <LockButton
                      disabled={formState.isWaitingResponse}
                      passwordIsOpen={passwordIsOpen}
                      onLockClick={RegisterPageStore.togglePasswordLock}
                    />
                  }
                  type={passwordIsOpen ? 'text' : 'password'}
                  value={formState.password.passwordConfirmation.inputValue}
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
                loading={formState.isWaitingResponse}
                onClick={enterClickHandler}
              >
                {dc.registerButton}
              </Button>
            </SignInStyled.ButtonWrapper>

            <SignInStyled.OtherErrorMessages>
              {formState.otherErrors}
            </SignInStyled.OtherErrorMessages>
          </SignInStyled.FormRect>

          {
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
          }
        </FormRectWrapper>
      </SignInStyled.Centering>
    </SignInStyled.Wrapper>
  );
});

const FormRectWrapper = styled(SignInStyled.FormRectWrapperBase)`
  height: 510px;
`;
