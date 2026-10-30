import {
  combine,
  filter,
  type InitializedObservable,
  map,
  mapTo,
  merge,
} from 'synstate';
import { Result } from 'ts-data-forge';
import { api } from '../api/index.mjs';
import { dict } from '../constants/index.mjs';
import {
  confirmEmailDialogFormInitialState,
  confirmEmailDialogFormStateReducer,
  confirmEmailDialogHasError,
  createToaster,
  showToast,
} from '../functions/index.mjs';
import { createReducerWithActions } from '../utils/index.mjs';
import { EditEventScheduleStore } from './create-event-schedule-page/index.mjs';
import { eventSchedule$ } from './fetching-state/index.mjs';
import { Router } from './store.mjs';

const dc = dict.answerPage.eventInfo.verifyEmailDialog;

const toast = createToaster();

const leftEditPage$ = Router.isRoute.editPage$.pipe(
  filter((isEditPage) => !isEditPage),
);

const [, dispatchEmailIsVerified, { state: emailIsVerified$ }] =
  createReducerWithActions((_: boolean, verified: boolean) => verified, false, [
    leftEditPage$.pipe(mapTo(false)),
  ]);

const isOpen$ = combine([emailIsVerified$, eventSchedule$]).pipe(
  map(
    ([verified, eventSchedule]) =>
      eventSchedule?.notificationSettings !== 'none' && !verified,
  ),
);

const [, dispatch, { state: formState$, getSnapshot: getFormStateSnapshot }] =
  createReducerWithActions(
    confirmEmailDialogFormStateReducer,
    confirmEmailDialogFormInitialState,
    [
      merge([leftEditPage$, isOpen$.pipe(filter((isOpen) => !isOpen))]).pipe(
        map(() => ({ type: 'reset' }) as const),
      ),
    ],
  );

const enterButtonDisabled$ = formState$.pipe(
  map((st) => st.isWaitingResponse || confirmEmailDialogHasError(st)),
);

const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
  map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
);

const state = combine([
  formState$,
  enterButtonDisabled$,
  emailFormIntent$,
]).pipe(
  map(([formState, enterButtonDisabled, emailFormIntent]) => ({
    formState,
    enterButtonDisabled,
    emailFormIntent,
  })),
);

const submit = async (eventId: string, email: string): Promise<void> => {
  const s = dispatch({ type: 'submit' });

  if (confirmEmailDialogHasError(s)) {
    return;
  }

  const verifyEmailResult = await api.event.verifyEmail(eventId, email);

  if (Result.isErr(verifyEmailResult)) {
    console.error(verifyEmailResult.value);

    dispatch({
      type: 'setOtherError',
      payload: verifyEmailResult.value.message,
    });

    showToast({ toast, message: dc.error, intent: 'danger' });

    return;
  }

  switch (verifyEmailResult.value) {
    case 'ng':
      dispatch({ type: 'setEmailDoesNotMatchError' });

      break;

    case 'ok':
      dispatch({ type: 'done' });

      EditEventScheduleStore.setEmailVerified(email);

      showToast({ toast, message: dc.success, intent: 'success' });

      dispatchEmailIsVerified(true);

      break;
  }
};

const enterClickHandler = (): void => {
  const eventId = Router.eventId$.getSnapshot().value;

  const formState = getFormStateSnapshot();

  const enterButtonDisabled = enterButtonDisabled$.getSnapshot().value;

  if (enterButtonDisabled) {
    return;
  }

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
  dispatch({ type: 'inputEmail', payload: value });
};

const resetInput = (): void => {
  dispatch({ type: 'reset' });
};

export const ConfirmEmailDialogStore = {
  state,
  isOpen$,
  enterClickHandler,
  inputEmailHandler,
  resetInput,
  cancelClickHandler,
} as const;
