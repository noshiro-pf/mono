import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import { constant, view, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { ResetPasswordPageStore } from '../../store/index.mjs';
import { preventSubmit } from './shared-auth-parts.js';
import * as styles from './sign-in.module.css';

const dc = dict.register;

type Props = Readonly<{ hidePasswordResetForm: () => void }>;

const { state } = ResetPasswordPageStore;

export const ResetPasswordPage = ({
  hidePasswordResetForm,
}: Props): JSX.Element => {
  const isWaitingResponse = view(state, (s) => s.formState.isWaitingResponse);

  const intent = view(state, (s) => s.emailFormIntent);

  return (
    <div
      class={constant(`${styles.formRectWrapper} ${styles.resetPasswordRect}`)}
    >
      <form class={constant(styles.formRect)} onSubmit={preventSubmit}>
        <div class={constant(styles.backButtonWrapper)}>
          <Button
            icon={'chevron-left'}
            intent={'none'}
            text={constant(dc.resetPasswordMode.back)}
            variant={constant('minimal')}
            onClick={hidePasswordResetForm}
          />
        </div>

        <div class={constant(styles.content)}>
          <h1 class={constant(styles.title)}>
            {constant(dc.resetPasswordMode.title)}
          </h1>

          <div>
            <FormGroup
              class={styles.field}
              helperText={view(state, (s) => s.formState.email.error)}
              intent={intent}
              label={constant(dc.email)}
            >
              <InputGroup
                autoComplete={'email'}
                autoFocus
                data-e2e={constant('email')}
                disabled={isWaitingResponse}
                intent={intent}
                type={'email'}
                value={view(state, (s) => s.formState.email.inputValue)}
                onInput={({ currentTarget }) => {
                  ResetPasswordPageStore.inputEmailHandler(currentTarget.value);
                }}
              />
            </FormGroup>
          </div>

          <div class={constant(styles.buttonWrapper)}>
            <Button
              data-e2e={constant('reset-password-button')}
              disabled={view(state, (s) => s.enterButtonDisabled)}
              fill
              intent={'primary'}
              loading={isWaitingResponse}
              text={constant(dc.resetPasswordMode.submit)}
              onClick={ResetPasswordPageStore.enterClickHandler}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
