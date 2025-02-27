import { api } from '../../api';
import { Routes } from '../../constants';
import {
  createToaster,
  resetPasswordPageHasError,
  resetPasswordPageInitialState,
  resetPasswordPageStateReducer,
  showToast,
} from '../../functions';
import { Router } from '../router';

const dc = dict.register;

const toast = createToaster();

const { state: formState$, dispatch } = createReducer(
  resetPasswordPageStateReducer,
  resetPasswordPageInitialState,
);

const enterButtonDisabled$ = formState$.chain(
  map((st) => st.isWaitingResponse || resetPasswordPageHasError(st)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const state = combine([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
]).chain(
  map(([formState, enterButtonDisabled, emailFormIntent]) => ({
    formState,
    enterButtonDisabled,
    emailFormIntent,
  })),
);

const submit = async (pageToBack: string | undefined): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (resetPasswordPageHasError(s)) return;

  const sendPasswordResetEmailResult = await api.auth.sendPasswordResetEmail(
    s.email.inputValue,
  );

  if (Result.isErr(sendPasswordResetEmailResult)) {
    switch (sendPasswordResetEmailResult.value.code) {
      case 'auth/user-not-found':
        dispatch({
          type: 'setEmailError',
          payload: dict.register.message.error.userNotFound,
        });
        return;

      default:
        console.error(sendPasswordResetEmailResult.value);
        dispatch({
          type: 'setOtherError',
          payload: sendPasswordResetEmailResult.value.message,
        });

        showToast({
          toast,
          message: dc.message.error.unknownErrorOnSendingResetPasswordEmail,
          intent: 'danger',
        });
        return;
    }
  }

  dispatch({ type: 'done' });

  showToast({
    toast,
    message: dc.message.success.sendPasswordResetEmail,
    intent: 'success',
  });

  if (pageToBack !== undefined) {
    Router.redirect(pageToBack);
  } else {
    Router.redirect(Routes.routes.createPage);
  }
};

const enterClickHandler = (): void => {
  if (enterButtonDisabled$.getSnapshot().value) return;

  // TODO: use toast
  submit(Maybe.unwrap(Router.pageToBack$.getSnapshot())).catch(console.error);
};

const inputEmailHandler = (value: string): void => {
  dispatch({
    type: 'inputEmail',
    payload: value,
  });
};

const resetAllState = (): void => {
  dispatch({ type: 'reset' });
};

/* subscriptions */

Router.isRoute.signInPage$.subscribe((isSignInPage) => {
  if (!isSignInPage) {
    resetAllState();
  }
});

export const ResetPasswordPageStore = {
  state,
  enterClickHandler,
  inputEmailHandler,
} as const;
