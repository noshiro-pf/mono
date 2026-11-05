import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, mapBindable, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { RegisterPageStore } from '../../store/index.mjs';
import { LockButton } from '../molecules/index.mjs';
import { NavBar } from '../organisms/index.mjs';
import {
  GoogleSignInSection,
  OtherErrorMessages,
  preventSubmit,
} from './shared-auth-parts.js';
import * as styles from './sign-in.module.css';

const dc = dict.register;

const { state } = RegisterPageStore;

export const RegisterPage = (): JSX.Element => {
  const isWaitingResponse = state.pipe(
    map((s) => s.formState.isWaitingResponse),
  );

  const usernameIntent = state.pipe(map((s) => s.usernameFormIntent));

  const emailIntent = state.pipe(map((s) => s.emailFormIntent));

  const passwordIntent = state.pipe(map((s) => s.passwordFormIntent));

  const passwordIsOpen = state.pipe(map((s) => s.passwordIsOpen));

  return (
    <div class={constant(styles.wrapper)} data-e2e={constant('register-page')}>
      <NavBar />

      <div class={constant(styles.centering)}>
        <div
          class={constant(`${styles.formRectWrapper} ${styles.registerRect}`)}
        >
          <form class={constant(styles.formRect)} onSubmit={preventSubmit}>
            <div>
              <FormGroup
                class={styles.field}
                helperText={state.pipe(map((s) => s.formState.username.error))}
                intent={usernameIntent}
                label={constant(dc.username)}
              >
                <InputGroup
                  autoFocus
                  data-e2e={constant('username')}
                  disabled={isWaitingResponse}
                  intent={usernameIntent}
                  type={'text'}
                  value={state.pipe(
                    map((s) => s.formState.username.inputValue),
                  )}
                  onInput={({ currentTarget }) => {
                    RegisterPageStore.inputUsernameHandler(currentTarget.value);
                  }}
                />
              </FormGroup>

              <FormGroup
                class={styles.field}
                helperText={state.pipe(map((s) => s.formState.email.error))}
                intent={emailIntent}
                label={constant(dc.email)}
              >
                <InputGroup
                  autoComplete={'username'}
                  data-e2e={constant('email')}
                  disabled={isWaitingResponse}
                  intent={emailIntent}
                  placeholder={constant('sample@gmail.com')}
                  type={'email'}
                  value={state.pipe(map((s) => s.formState.email.inputValue))}
                  onInput={({ currentTarget }) => {
                    RegisterPageStore.inputEmailHandler(currentTarget.value);
                  }}
                />
              </FormGroup>

              <FormGroup
                class={styles.field}
                helperText={state.pipe(
                  map((s) => s.formState.password.password.error),
                )}
                intent={passwordIntent}
                label={constant(dc.password)}
              >
                <InputGroup
                  autoComplete={'new-password'}
                  data-e2e={constant('password')}
                  disabled={isWaitingResponse}
                  intent={passwordIntent}
                  type={'password'}
                  value={state.pipe(
                    map((s) => s.formState.password.password.inputValue),
                  )}
                  onInput={({ currentTarget }) => {
                    RegisterPageStore.inputPasswordHandler(currentTarget.value);
                  }}
                />
              </FormGroup>

              <FormGroup
                class={styles.field}
                helperText={state.pipe(
                  map((s) => s.formState.password.passwordConfirmation.error),
                )}
                intent={passwordIntent}
                label={constant(dc.verifyPassword)}
              >
                <InputGroup
                  data-e2e={constant('verify-password')}
                  disabled={isWaitingResponse}
                  intent={passwordIntent}
                  rightElement={
                    <LockButton
                      disabled={isWaitingResponse}
                      passwordIsOpen={passwordIsOpen}
                      onLockClick={RegisterPageStore.togglePasswordLock}
                    />
                  }
                  type={mapBindable(passwordIsOpen, (open) =>
                    open ? 'text' : 'password',
                  )}
                  value={state.pipe(
                    map(
                      (s) =>
                        s.formState.password.passwordConfirmation.inputValue,
                    ),
                  )}
                  onInput={({ currentTarget }) => {
                    RegisterPageStore.inputPasswordConfirmationHandler(
                      currentTarget.value,
                    );
                  }}
                />
              </FormGroup>
            </div>

            <div class={constant(styles.buttonWrapper)}>
              <Button
                data-e2e={constant('register-button')}
                disabled={state.pipe(map((s) => s.enterButtonDisabled))}
                fill
                intent={'primary'}
                loading={isWaitingResponse}
                text={constant(dc.registerButton)}
                onClick={RegisterPageStore.enterClickHandler}
              />
            </div>

            <OtherErrorMessages
              otherErrors={state.pipe(map((s) => s.formState.otherErrors))}
            />
          </form>

          <GoogleSignInSection text={dc.google.register} />
        </div>
      </div>
    </div>
  );
};
