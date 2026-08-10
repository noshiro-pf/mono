import { Button, FormGroup } from '@blueprintjs/core';
import { BpInput } from '@noshiro/react-blueprintjs-utils';
import { GoogleSignInStore, RegisterPageStore } from '../../store';
import { GoogleIcon, Label } from '../atoms';
import { LockButton } from '../molecules';
import { NavBar } from '../organisms';
import { SignInStyled } from '../styled';

const dc = dict.register;

const returnFalse = (): false => false;

export const RegisterPage = memoNamed('RegisterPage', () => {
  const googleSignInButtonDisabled =
    GoogleSignInStore.useGoogleSignInButtonDisabled();

  const {
    formState,
    enterButtonDisabled,
    usernameFormIntent,
    emailFormIntent,
    passwordFormIntent,
    passwordIsOpen,
  } = useObservableValue(RegisterPageStore.state);

  const passwordLockButton = useMemo(
    () => (
      <LockButton
        disabled={formState.isWaitingResponse}
        passwordIsOpen={passwordIsOpen}
        onLockClick={RegisterPageStore.togglePasswordLock}
      />
    ),
    [formState.isWaitingResponse, passwordIsOpen],
  );

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
                label={usernameInputLabel}
              >
                <BpInput
                  // eslint-disable-next-line jsx-a11y/no-autofocus
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
                label={emailInputLabel}
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
                label={newPasswordInputLabel}
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
                label={verifyPasswordInputLabel}
              >
                <BpInput
                  disabled={formState.isWaitingResponse}
                  intent={passwordFormIntent}
                  rightElement={passwordLockButton}
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
                onClick={RegisterPageStore.enterClickHandler}
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
                  onClick={GoogleSignInStore.googleSignInClickHandler}
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

const usernameInputLabel = <Label>{dc.username}</Label>;
const emailInputLabel = <Label>{dc.email}</Label>;
const newPasswordInputLabel = <Label>{dc.password}</Label>;
const verifyPasswordInputLabel = <Label>{dc.verifyPassword}</Label>;
