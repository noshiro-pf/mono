import { Button, FormGroup } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict } from '../../constants';
import { experimentalFeature } from '../../env';
import { useSignInPageState } from '../../hooks';
import { SignInPageStore } from '../../store';
import { GoogleIcon, Label } from '../atoms';
import { BpInput } from '../bp';
import { LockButton, SignInStyled } from '../molecules';
import { NavBar } from '../organisms';
import { ResetPasswordPage } from './reset-password-page';

const dc = dict.register;

const returnFalse = (): false => false;

export const SignInPage = memoNamed('SignInPage', () => {
  const {
    emailFormIntent,
    enterButtonDisabled,
    enterClickHandler,
    googleSignInButtonDisabled,
    googleSignInClickHandler,
    passwordFormIntent,
    passwordIsOpen,
    state,
  } = useSignInPageState();

  const [isPasswordResetForm, passwordIsOpenResetForm, hidePasswordResetForm] =
    useBooleanState(false);

  return (
    <SignInStyled.Wrapper>
      <NavBar />

      <SignInStyled.Centering>
        {isPasswordResetForm ? (
          <ResetPasswordPage hidePasswordResetForm={hidePasswordResetForm} />
        ) : (
          <FormRectWrapper>
            <SignInStyled.FormRect onSubmit={returnFalse}>
              <SignInStyled.FormGroups>
                <FormGroup
                  helperText={state.email.error}
                  intent={emailFormIntent}
                  label={<Label>{dc.email}</Label>}
                >
                  <BpInput
                    autoComplete={'email'}
                    autoFocus={true}
                    disabled={state.isWaitingResponse}
                    fill={true}
                    intent={emailFormIntent}
                    placeholder={'sample@gmail.com'}
                    type={'email'}
                    value={state.email.inputValue}
                    onValueChange={SignInPageStore.inputEmailHandler}
                  />
                </FormGroup>

                <FormGroup
                  helperText={state.password.error}
                  intent={passwordFormIntent}
                  label={<Label>{dc.password}</Label>}
                >
                  <BpInput
                    autoComplete={'current-password'}
                    disabled={state.isWaitingResponse}
                    fill={true}
                    intent={passwordFormIntent}
                    rightElement={
                      <LockButton
                        disabled={state.isWaitingResponse}
                        passwordIsOpen={passwordIsOpen}
                        onLockClick={SignInPageStore.togglePasswordLock}
                      />
                    }
                    type={passwordIsOpen ? 'text' : 'password'}
                    value={state.password.inputValue}
                    onValueChange={SignInPageStore.inputPasswordHandler}
                  />
                </FormGroup>
              </SignInStyled.FormGroups>

              <SignInStyled.PasswordResetWrapper>
                <SignInStyled.PasswordReset onClick={passwordIsOpenResetForm}>
                  {dc.resetPassword}
                </SignInStyled.PasswordReset>
              </SignInStyled.PasswordResetWrapper>

              <SignInStyled.ButtonWrapper>
                <Button
                  disabled={enterButtonDisabled}
                  fill={true}
                  intent={'primary'}
                  loading={state.isWaitingResponse}
                  onClick={enterClickHandler}
                >
                  {dc.signInButton}
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
                        {dc.google.signIn}
                      </SignInStyled.GoogleLoginButtonText>
                    </SignInStyled.GoogleButtonContentWrapper>
                  </SignInStyled.GoogleButton>
                </SignInStyled.ButtonWrapper>
              </>
            )}
          </FormRectWrapper>
        )}
      </SignInStyled.Centering>
    </SignInStyled.Wrapper>
  );
});

const FormRectWrapper = styled(SignInStyled.FormRectWrapperBase)`
  height: ${340 + (experimentalFeature.googleAuth === 'shown' ? 80 : 0)}px;
`;
