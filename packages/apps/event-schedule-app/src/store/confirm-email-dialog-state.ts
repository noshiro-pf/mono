import { api } from '../api';
import type { ConfirmEmailDialogFormState } from '../functions';
import {
  confirmEmailDialogFormInitialState,
  confirmEmailDialogFormStateReducer,
  confirmEmailDialogHasError,
  createToaster,
  showToast,
} from '../functions';
import { EditEventScheduleStore } from './create-event-schedule-page';
import { eventSchedule$ } from './fetch-state';
import { router } from './router';

const dc = dict.answerPage.eventInfo.verifyEmailDialog;

const toast = createToaster();

export namespace ConfirmEmailDialogStore {
  const [formState$, dispatch] = createReducer(
    confirmEmailDialogFormStateReducer,
    confirmEmailDialogFormInitialState
  );

  const enterButtonDisabled$ = formState$.chain(
    mapI(
      (state) => state.isWaitingResponse || confirmEmailDialogHasError(state)
    )
  );

  const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
    mapI((state) => (state.email.error === undefined ? 'primary' : 'danger'))
  );

  const emailIsVerified = createBooleanState(false);

  export const isOpen$ = combineLatestI([
    emailIsVerified.state$,
    eventSchedule$,
  ]).chain(
    mapI(
      ([verified, eventSchedule]) =>
        eventSchedule?.notificationSettings !== 'none' && !verified
    )
  );

  export const state$ = combineLatestI([
    formState$,
    enterButtonDisabled$,
    emailFormIntent$,
  ]).chain(
    mapI(([formState, enterButtonDisabled, emailFormIntent]) => ({
      formState,
      enterButtonDisabled,
      emailFormIntent,
    }))
  );

  const submit = async (eventId: string, email: string): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (confirmEmailDialogHasError(s)) return;

    const verifyEmailResult = await api.event.verifyEmail(eventId, email);

    if (Result.isErr(verifyEmailResult)) {
      console.error(verifyEmailResult.value);
      dispatch({
        type: 'setOtherError',
        payload: verifyEmailResult.value.message,
      });

      showToast({
        toast,
        message: dc.error,
        intent: 'danger',
      });
      return;
    }

    switch (verifyEmailResult.value) {
      case 'ng':
        dispatch({
          type: 'setEmailDoesNotMatchError',
        });
        break;

      case 'ok':
        dispatch({ type: 'done' });

        EditEventScheduleStore.setEmailVerified(email);

        showToast({
          toast,
          message: dc.success,
          intent: 'success',
        });

        emailIsVerified.setTrue();
        break;
    }
  };

  export const enterClickHandler = (): void => {
    const { eventId, enterButtonDisabled, formState } = mut_subscribedValues;

    if (enterButtonDisabled) return;

    const email = formState?.email.inputValue;

    if (
      eventId === undefined ||
      eventId === '' ||
      email === undefined ||
      email === ''
    ) {
      throw new Error('eventId and email input value must be non null string');
    }

    submit(eventId, email).catch(console.error);
  };

  export const cancelClickHandler = (): void => {
    router.back();
  };

  export const inputEmailHandler = (value: string): void => {
    dispatch({
      type: 'inputEmail',
      payload: value,
    });
  };

  export const resetInput = (): void => {
    dispatch({ type: 'reset' });
  };

  const resetAllState = (): void => {
    resetInput();
    emailIsVerified.reset();
  };

  /* subscriptions */

  const mut_subscribedValues: {
    formState: ConfirmEmailDialogFormState | undefined;
    enterButtonDisabled: boolean;
    eventId: string | undefined;
    lastSetEmail: string | undefined;
  } = {
    formState: undefined,
    enterButtonDisabled: true,
    eventId: undefined,
    lastSetEmail: undefined,
  };

  router.eventId$.subscribe((eventId) => {
    mut_subscribedValues.eventId = eventId;
  });

  formState$.subscribe((v) => {
    mut_subscribedValues.formState = v;
  });

  enterButtonDisabled$.subscribe((v) => {
    mut_subscribedValues.enterButtonDisabled = v;
  });

  router.isRoute.editPage$.subscribe((isEditPage) => {
    if (!isEditPage) {
      resetAllState();
    }
  });

  isOpen$.subscribe((isOpen) => {
    if (!isOpen) {
      resetInput();
    }
  });
}