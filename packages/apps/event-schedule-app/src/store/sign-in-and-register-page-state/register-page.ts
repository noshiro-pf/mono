import { api } from '../../api';
import { Routes } from '../../constants';
import {
  createToaster,
  registerPageHasError,
  registerPageInitialState,
  registerPageStateReducer,
  showToast,
} from '../../functions';
import { router } from '../router';
import { GoogleSignInStore } from './google-sign-in-state';

const dc = dict.register;

const toast = createToaster();

const [formState$, dispatch] = createReducer(
  registerPageStateReducer,
  registerPageInitialState
);

const enterButtonDisabled$ = formState$.chain(
  mapI((state) => state.isWaitingResponse || registerPageHasError(state))
);

const usernameFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) => (state.username.error === undefined ? 'primary' : 'danger'))
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) => (state.email.error === undefined ? 'primary' : 'danger'))
);

const passwordFormIntent$: InitializedObservable<Intent> = formState$.chain(
  mapI((state) =>
    state.password.password.error === undefined &&
    state.password.passwordConfirmation.error === undefined
      ? 'primary'
      : 'danger'
  )
);

const passwordIsOpenState = createBooleanState(false);

const togglePasswordLock = passwordIsOpenState.toggle;

const { state$: passwordIsOpen$, setFalse: hidePassword } = passwordIsOpenState;

const state$ = combineLatestI([
  formState$,
  enterButtonDisabled$,
  usernameFormIntent$,
  emailFormIntent$,
  passwordFormIntent$,
  passwordIsOpen$,
]).chain(
  mapI(
    ([
      formState,
      enterButtonDisabled,
      usernameFormIntent,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    ]) => ({
      formState,
      enterButtonDisabled,
      usernameFormIntent,
      emailFormIntent,
      passwordFormIntent,
      passwordIsOpen,
    })
  )
);

const submit = async (pageToBack: string | undefined): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (registerPageHasError(s)) return;

  const createUserResult = await api.auth.createUser(
    s.email.inputValue,
    s.password.password.inputValue
  );

  if (Result.isErr(createUserResult)) {
    switch (createUserResult.value.code) {
      case 'auth/invalid-email':
        dispatch({
          type: 'setEmailError',
          payload: dc.message.error.invalidEmail,
        });
        return;

      case 'auth/email-already-in-use':
        dispatch({
          type: 'setEmailError',
          payload: dc.message.error.emailAlreadyInUse,
        });
        return;

      case 'auth/weak-password':
        dispatch({
          type: 'setPasswordError',
          payload: dc.message.error.weakPassword,
        });

        return;

      default:
        console.error(createUserResult.value);

        dispatch({
          type: 'setOtherError',
          payload: createUserResult.value.message,
        });

        showToast({
          toast,
          message: dc.message.error.unknownErrorOnRegister,
          intent: 'danger',
        });
        return;
    }
  }

  const user = createUserResult.value.user;

  const [updateProfileResult] = await Promise.all([
    api.auth.update.displayName(user, s.username.inputValue),
    api.auth.sendEmailVerification(user),
  ]);

  if (Result.isErr(updateProfileResult)) {
    // TODO: use toast
    console.error(updateProfileResult.value);
    dispatch({
      type: 'setUsernameError',
      payload: updateProfileResult.value.message,
    });
    return;
  }

  dispatch({ type: 'done' });

  showToast({
    toast,
    message: dc.message.success.register,
    intent: 'success',
  });

  if (pageToBack !== undefined) {
    router.redirect(pageToBack);
  } else {
    router.redirect(Routes.routes.createPage);
  }
};

const inputUsernameHandler = (value: string): void => {
  dispatch({
    type: 'inputUsername',
    payload: value,
  });
};

const inputEmailHandler = (value: string): void => {
  dispatch({
    type: 'inputEmail',
    payload: value,
  });
};

const inputPasswordHandler = (value: string): void => {
  dispatch({
    type: 'inputPassword',
    payload: value,
  });
};

const inputPasswordConfirmationHandler = (value: string): void => {
  dispatch({
    type: 'inputPasswordConfirmation',
    payload: value,
  });
};

const mut_subscribedValues: {
  enterButtonDisabled: boolean;
  googleSignInButtonDisabled: boolean;
  pageToBack: string | undefined;
} = {
  enterButtonDisabled: true,
  googleSignInButtonDisabled: true,
  pageToBack: undefined,
};

enterButtonDisabled$.subscribe((v) => {
  mut_subscribedValues.enterButtonDisabled = v;
});

GoogleSignInStore.googleSignInButtonDisabled$.subscribe((v) => {
  mut_subscribedValues.googleSignInButtonDisabled = v;
});

router.pageToBack$.subscribe((v) => {
  mut_subscribedValues.pageToBack = v;
});

const enterClickHandler = (): void => {
  if (
    mut_subscribedValues.enterButtonDisabled ||
    mut_subscribedValues.googleSignInButtonDisabled
  )
    return;

  // TODO: use toast
  submit(mut_subscribedValues.pageToBack).catch(console.error);
};

const resetAllState = (): void => {
  dispatch({ type: 'reset' });
  hidePassword();
};

router.isRoute.registerPage$.subscribe((isRegisterPage) => {
  if (!isRegisterPage) {
    resetAllState();
  }
});

export const RegisterPageStore = {
  state$,
  togglePasswordLock,
  inputUsernameHandler,
  inputEmailHandler,
  inputPasswordHandler,
  inputPasswordConfirmationHandler,
  enterClickHandler,
} as const;
