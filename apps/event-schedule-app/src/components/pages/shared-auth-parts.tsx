import { Button } from 'blueprint-synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { GoogleSignInStore } from '../../store/index.mjs';
import { GoogleIcon } from '../atoms/index.mjs';
import * as styles from './sign-in.module.css';

type Props = Readonly<{ text: string }>;

/** The "or" rule and the Google button below a sign-in or register form. */
export const GoogleSignInSection = ({ text }: Props): JSX.Element => (
  <>
    <div class={constant(styles.separatorWrapper)}>
      <hr class={constant(styles.separator)} />
      <div class={constant(styles.sepText)}>
        {constant(dict.register.separator)}
      </div>
    </div>

    <div class={constant(styles.buttonWrapper)}>
      <Button
        class={styles.googleButton}
        disabled={GoogleSignInStore.googleSignInButtonDisabledState}
        fill
        intent={'none'}
        variant={constant('outlined')}
        onClick={GoogleSignInStore.googleSignInClickHandler}
      >
        <span class={constant(styles.googleButtonContentWrapper)}>
          <span class={constant(styles.googleIconWrapper)}>
            <GoogleIcon />
          </span>
          <span class={constant(styles.googleLoginButtonText)}>
            {constant(text)}
          </span>
        </span>
      </Button>
    </div>
  </>
);

/** Errors the form has no field for, under its button. */
export const OtherErrorMessages = ({
  otherErrors,
}: Readonly<{ otherErrors: Bindable<string | undefined> }>): JSX.Element => (
  <div class={constant(styles.otherErrorMessages)}>
    {mapBindable(otherErrors, (e) => e ?? '')}
  </div>
);

/** Enter in a form of one field submits it, which would reload the page. */
export const preventSubmit = (event: Event): void => {
  event.preventDefault();
};
