import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import { createBooleanState } from 'synstate';
import { constant, If, mapBindable, view, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { SignInPageStore } from '../../store/index.mjs';
import { LockButton } from '../molecules/index.mjs';
import { NavBar } from '../organisms/index.mjs';
import { ResetPasswordPage } from './reset-password-page.js';
import {
  GoogleSignInSection,
  OtherErrorMessages,
  preventSubmit,
} from './shared-auth-parts.js';
import * as styles from './sign-in.module.css';

const dc = dict.register;

const { state } = SignInPageStore;

export const SignInPage = (): JSX.Element => {
  const [
    isPasswordResetForm$,
    { setTrue: showResetForm, setFalse: hideResetForm },
  ] = createBooleanState(false);

  const isWaitingResponse = view(state, (s) => s.formState.isWaitingResponse);

  const emailIntent = view(state, (s) => s.emailFormIntent);

  const passwordIntent = view(state, (s) => s.passwordFormIntent);

  const passwordIsOpen = view(state, (s) => s.passwordIsOpen);

  return (
    <div class={constant(styles.wrapper)} data-e2e={constant('sign-in-page')}>
      <NavBar />

      <div class={constant(styles.centering)}>
        <If
          cond={isPasswordResetForm$}
          else={
            <div
              class={constant(`${styles.formRectWrapper} ${styles.signInRect}`)}
            >
              <form class={constant(styles.formRect)} onSubmit={preventSubmit}>
                <div>
                  <FormGroup
                    class={styles.field}
                    helperText={view(state, (s) => s.formState.email.error)}
                    intent={emailIntent}
                    label={constant(dc.email)}
                  >
                    <InputGroup
                      autoComplete={'email'}
                      autoFocus
                      data-e2e={constant('email')}
                      disabled={isWaitingResponse}
                      fill
                      intent={emailIntent}
                      placeholder={constant('sample@gmail.com')}
                      type={'email'}
                      value={view(state, (s) => s.formState.email.inputValue)}
                      onInput={({ currentTarget }) => {
                        SignInPageStore.inputEmailHandler(currentTarget.value);
                      }}
                    />
                  </FormGroup>

                  <FormGroup
                    class={styles.field}
                    helperText={view(state, (s) => s.formState.password.error)}
                    intent={passwordIntent}
                    label={constant(dc.password)}
                  >
                    <InputGroup
                      autoComplete={'current-password'}
                      data-e2e={constant('password')}
                      disabled={isWaitingResponse}
                      fill
                      intent={passwordIntent}
                      rightElement={
                        <LockButton
                          disabled={isWaitingResponse}
                          passwordIsOpen={passwordIsOpen}
                          onLockClick={SignInPageStore.togglePasswordLock}
                        />
                      }
                      type={mapBindable(passwordIsOpen, (open) =>
                        open ? 'text' : 'password',
                      )}
                      value={view(
                        state,
                        (s) => s.formState.password.inputValue,
                      )}
                      onInput={({ currentTarget }) => {
                        SignInPageStore.inputPasswordHandler(
                          currentTarget.value,
                        );
                      }}
                    />
                  </FormGroup>
                </div>

                <div class={constant(styles.passwordResetWrapper)}>
                  <button
                    class={constant(styles.passwordReset)}
                    data-e2e={constant('password-reset-link')}
                    type={constant('button')}
                    onClick={showResetForm}
                  >
                    {constant(dc.resetPassword)}
                  </button>
                </div>

                <div class={constant(styles.buttonWrapper)}>
                  <Button
                    data-e2e={constant('sign-in-button')}
                    disabled={view(state, (s) => s.enterButtonDisabled)}
                    fill
                    intent={'primary'}
                    loading={isWaitingResponse}
                    text={constant(dc.signInButton)}
                    onClick={SignInPageStore.enterClickHandler}
                  />
                </div>

                <OtherErrorMessages
                  otherErrors={view(state, (s) => s.formState.otherErrors)}
                />
              </form>

              <GoogleSignInSection text={dc.google.signIn} />
            </div>
          }
          then={<ResetPasswordPage hidePasswordResetForm={hideResetForm} />}
        />
      </div>
    </div>
  );
};
