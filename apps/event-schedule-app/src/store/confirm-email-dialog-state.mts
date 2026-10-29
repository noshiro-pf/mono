import type { Toaster } from '@blueprintjs/core';
import {
  combine,
  filter,
  type InitializedObservable,
  map,
  mapTo,
  merge,
} from 'synstate';
import { Result } from 'ts-data-forge';
import type { StrictPick } from 'ts-type-forge';
import type { Api } from '../api/index.mjs';
import { dict } from '../constants/index.mjs';
import {
  confirmEmailDialogFormInitialState,
  type ConfirmEmailDialogFormState,
  confirmEmailDialogFormStateReducer,
  confirmEmailDialogHasError,
  showToast,
} from '../functions/index.mjs';
import { createReducerWithActions } from '../utils/index.mjs';
import type { EditEventSchedule } from './create-event-schedule-page/index.mjs';
import type { AppRouter } from './router-store.mjs';

export type ConfirmEmailDialogDeps = Readonly<{
  api: Readonly<{ event: StrictPick<Api['event'], 'verifyEmail'> }>;
  router: StrictPick<AppRouter, 'back' | 'eventId$' | 'isRoute'>;
  eventSchedule$: InitializedObservable<EventSchedule | undefined>;
  /** Told the email once it is confirmed. */
  editEventSchedule: StrictPick<EditEventSchedule, 'setEmailVerified'>;
  /** Where the dialog says whether the email was confirmed. */
  toast: Promise<Toaster>;
}>;

/**
 * The dialog the edit page opens until the author's email is confirmed: the
 * form, and the check through `deps.api`. Left closed for an event with no
 * notifications.
 */
export const createConfirmEmailDialogStore = (
  deps: ConfirmEmailDialogDeps,
): ConfirmEmailDialog => {
  const dc = dict.answerPage.eventInfo.verifyEmailDialog;

  const leftEditPage$ = deps.router.isRoute.editPage$.pipe(
    filter((isEditPage) => !isEditPage),
  );

  const [, dispatchEmailIsVerified, { state: emailIsVerified$ }] =
    createReducerWithActions(
      (_: boolean, verified: boolean) => verified,
      false,
      [leftEditPage$.pipe(mapTo(false))],
    );

  const isOpen$ = combine([emailIsVerified$, deps.eventSchedule$]).pipe(
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

    const verifyEmailResult = await deps.api.event.verifyEmail(eventId, email);

    if (Result.isErr(verifyEmailResult)) {
      console.error(verifyEmailResult.value);

      dispatch({
        type: 'setOtherError',
        payload: verifyEmailResult.value.message,
      });

      showToast({ toast: deps.toast, message: dc.error, intent: 'danger' });

      return;
    }

    switch (verifyEmailResult.value) {
      case 'ng':
        dispatch({ type: 'setEmailDoesNotMatchError' });

        break;

      case 'ok':
        dispatch({ type: 'done' });

        deps.editEventSchedule.setEmailVerified(email);

        showToast({
          toast: deps.toast,
          message: dc.success,
          intent: 'success',
        });

        dispatchEmailIsVerified(true);

        break;
    }
  };

  const enterClickHandler = (): void => {
    const eventId = deps.router.eventId$.getSnapshot().value;

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
    deps.router.back();
  };

  const inputEmailHandler = (value: string): void => {
    dispatch({ type: 'inputEmail', payload: value });
  };

  const resetInput = (): void => {
    dispatch({ type: 'reset' });
  };

  return {
    state,
    isOpen$,
    enterClickHandler,
    inputEmailHandler,
    resetInput,
    cancelClickHandler,
  } as const;
};

export type ConfirmEmailDialog = Readonly<{
  state: InitializedObservable<
    Readonly<{
      formState: ConfirmEmailDialogFormState;
      enterButtonDisabled: boolean;
      emailFormIntent: Intent;
    }>
  >;
  isOpen$: InitializedObservable<boolean>;
  enterClickHandler: () => void;
  inputEmailHandler: (value: string) => void;
  resetInput: () => void;
  /** Goes back to where the edit page was opened from. */
  cancelClickHandler: () => void;
}>;
