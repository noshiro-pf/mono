import { api } from '../api';
import {
  confirmEmailDialogFormInitialState,
  confirmEmailDialogFormStateReducer,
  confirmEmailDialogHasError,
  createToaster,
  showToast,
} from '../functions';
import { EditEventScheduleStore } from './create-event-schedule-page';
import { eventSchedule$ } from './fetching-state';
import { Router } from './router';

const dc = dict.answerPage.eventInfo.verifyEmailDialog;

const toast = createToaster();

const {
  state: formState$,
  dispatch,
  getSnapshot: getFormStateSnapshot,
} = createReducer(
  confirmEmailDialogFormStateReducer,
  confirmEmailDialogFormInitialState,
);

const enterButtonDisabled$ = formState$.chain(
  map((st) => st.isWaitingResponse || confirmEmailDialogHasError(st)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.chain(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const emailIsVerified = createBooleanState(false);

const isOpen$ = combine([emailIsVerified.state, eventSchedule$]).chain(
  map(
    ([verified, eventSchedule]) =>
      eventSchedule?.notificationSettings !== 'none' && !verified,
  ),
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

const enterClickHandler = (): void => {
  const eventId = Router.eventId$.getSnapshot().value;
  const formState = getFormStateSnapshot();
  const enterButtonDisabled = enterButtonDisabled$.getSnapshot().value;

  if (enterButtonDisabled) return;

  const email = formState.email.inputValue;

  if (eventId === undefined || eventId === '' || email === '') {
    throw new Error('eventId and email input value must be non null string');
  }

  // TODO: use toast
  submit(eventId, email).catch(console.error);
};

const cancelClickHandler = (): void => {
  Router.back();
};

const inputEmailHandler = (value: string): void => {
  dispatch({
    type: 'inputEmail',
    payload: value,
  });
};

const resetInput = (): void => {
  dispatch({ type: 'reset' });
};

const resetAllState = (): void => {
  resetInput();
  emailIsVerified.resetState();
};

/* subscriptions */

Router.isRoute.editPage$.subscribe((isEditPage) => {
  if (!isEditPage) {
    resetAllState();
  }
});

isOpen$.subscribe((isOpen) => {
  if (!isOpen) {
    resetInput();
  }
});

export const ConfirmEmailDialogStore = {
  state,
  isOpen$,
  enterClickHandler,
  inputEmailHandler,
  resetInput,
  cancelClickHandler,
} as const;
