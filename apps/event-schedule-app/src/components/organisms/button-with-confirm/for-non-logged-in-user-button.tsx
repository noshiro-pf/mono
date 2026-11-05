import { Alert } from 'blueprint-synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
import { dict, introductionUrl, routes } from '../../../constants/index.mjs';
import { Router } from '../../../store/index.mjs';
import { maxWidthModalClass } from '../../styled/index.mjs';
import * as styles from './for-non-logged-in-user-button.module.css';

const dc = dict.forNonLoggedInUser;

type Props = Readonly<{ isOpen: Bindable<boolean>; cancel: () => void }>;

/** Says that what was pressed needs an account, and offers to sign in. */
export const ForNonLoggedInUserDialog = ({
  isOpen,
  cancel,
}: Props): JSX.Element => (
  <Alert
    canEscapeKeyCancel
    canOutsideClickCancel
    cancelButtonText={constant(dict.common.buttonText.cancel)}
    class={maxWidthModalClass}
    confirmButtonText={constant(dc.confirmButton)}
    icon={'lock'}
    intent={'primary'}
    isOpen={isOpen}
    onCancel={cancel}
    onConfirm={onConfirmClick}
  >
    <p>{constant(dc.message)}</p>
    <div class={constant(styles.paragraph)}>
      <span class={constant(styles.smaller)}>{constant(dc.description)}</span>
    </div>
    <div class={constant(styles.paragraph)}>
      <span class={constant(styles.smaller)}>{constant(dc.link.prefix)}</span>
      <a
        class={constant(styles.link)}
        href={constant(introductionUrl)}
        rel={constant('noopener noreferrer')}
        target={constant('_blank')}
      >
        {constant(dc.link.body)}
      </a>
      <span class={constant(styles.smaller)}>{constant(dc.link.suffix)}</span>
    </div>
  </Alert>
);

const onConfirmClick = (): void => {
  Router.push(routes.signIn.href());
};
