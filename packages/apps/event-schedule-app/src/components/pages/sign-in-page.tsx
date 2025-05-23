import { Button, FormGroup } from '@blueprintjs/core';
import { BpInput } from '@noshiro/react-blueprintjs-utils';
import { GoogleSignInStore, SignInPageStore } from '../../store';
import { GoogleIcon, Label } from '../atoms';
import { LockButton } from '../molecules';
import { NavBar } from '../organisms';
import { SignInStyled } from '../styled';
import { ResetPasswordPage } from './reset-password-page';

const dc = dict.register;

const returnFalse = (): false => false;

export const SignInPage = memoNamed('SignInPage', () => {
  const googleSignInButtonDisabled =
    GoogleSignInStore.useGoogleSignInButtonDisabled();

  const {
    formState,
    enterButtonDisabled,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
  } = useObservableValue(SignInPageStore.state);

  const [
    isPasswordResetForm,
    { setTrue: passwordIsOpenResetForm, setFalse: hidePasswordResetForm },
  ] = useBoolState(false);

  const lockPasswordButton = useMemo(
    () => (
      <LockButton
        disabled={formState.isWaitingResponse}
        passwordIsOpen={passwordIsOpen}
        onLockClick={SignInPageStore.togglePasswordLock}
      />
    ),
    [formState.isWaitingResponse, passwordIsOpen],
  );

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
                  helperText={formState.email.error}
                  intent={emailFormIntent}
                  label={emailInputLabel}
                >
                  <BpInput
                    autoComplete={'email'}
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus={true}
                    disabled={formState.isWaitingResponse}
                    fill={true}
                    intent={emailFormIntent}
                    placeholder={'sample@gmail.com'}
                    type={'email'}
                    value={formState.email.inputValue}
                    onValueChange={SignInPageStore.inputEmailHandler}
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
                    fill={true}
                    intent={passwordFormIntent}
                    rightElement={lockPasswordButton}
                    type={passwordIsOpen ? 'text' : 'password'}
                    value={formState.password.inputValue}
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
                  loading={formState.isWaitingResponse}
                  onClick={SignInPageStore.enterClickHandler}
                >
                  {dc.signInButton}
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
                    onClick={GoogleSignInStore.googleSignInClickHandler}
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
            }
          </FormRectWrapper>
        )}
      </SignInStyled.Centering>
    </SignInStyled.Wrapper>
  );
});

const emailInputLabel = <Label>{dc.email}</Label>;
const passwordInputLabel = <Label>{dc.password}</Label>;

const FormRectWrapper = styled(SignInStyled.FormRectWrapperBase)`
  height: 420px;
`;
