import {
  derive,
  filter,
  type InitializedObservable,
  map,
  merge,
} from 'synstate';
import { Optional, Result } from 'ts-data-forge';
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
  router: StrictPick<AppRouter, 'back' | 'editPageLeaves$' | 'eventId$'>;
  eventSchedule$: InitializedObservable<EventSchedule | undefined>;
  /** Told the email once it is confirmed, and the dialog stays closed while it is. */
  editEventSchedule: StrictPick<
    EditEventSchedule,
    'emailVerified$' | 'setEmailVerified'
  >;
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

  const isOpen$ = derive(
    [deps.editEventSchedule.emailVerified$, deps.eventSchedule$],
    (emailVerified, eventSchedule) =>
      eventSchedule?.notificationSettings !== 'none' &&
      emailVerified === undefined,
  );

  const [formState$, dispatch, { getSnapshot: getFormStateSnapshot }] =
    createReducerWithActions(
      confirmEmailDialogFormStateReducer,
      confirmEmailDialogFormInitialState,
      [
        // The form starts again when the page is left, when another event's
        // page opens, and once the dialog closes.
        merge([
          deps.router.editPageLeaves$,
          deps.router.eventId$,
          isOpen$.pipe(filter((isOpen) => !isOpen)),
        ]).pipe(map(() => ({ type: 'reset' }) as const)),
      ],
    );

  const enterButtonDisabled$ = formState$.pipe(
    map((st) => st.isWaitingResponse || confirmEmailDialogHasError(st)),
  );

  const emailFormIntent$: InitializedObservable<Intent> = formState$.pipe(
    map((st) => (st.email.error === undefined ? 'primary' : 'danger')),
  );

  const state = derive(
    [formState$, enterButtonDisabled$, emailFormIntent$],
    (formState, enterButtonDisabled, emailFormIntent) => ({
      formState,
      enterButtonDisabled,
      emailFormIntent,
    }),
  );

  const submit = async (eventId: string, email: string): Promise<void> => {
    const s = dispatch({ type: 'submit' });

    if (confirmEmailDialogHasError(s)) {
      return;
    }

    const visit = Optional.unwrap(deps.router.editPageLeaves$.getSnapshot());

    const verifyEmailResult = await deps.api.event.verifyEmail(eventId, email);

    if (Result.isErr(verifyEmailResult)) {
      console.error(verifyEmailResult.value);
    }

    // The page was left while the check ran, even if it has been opened again,
    // or moved to another event: the form was reset, and the answer is for a
    // visit already over.
    if (
      Optional.unwrap(deps.router.editPageLeaves$.getSnapshot()) !== visit ||
      Optional.unwrap(deps.router.eventId$.getSnapshot()) !== eventId
    ) {
      return;
    }

    if (Result.isErr(verifyEmailResult)) {
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

        deps.editEventSchedule.setEmailVerified(eventId, email);

        showToast({
          toast: deps.toast,
          message: dc.success,
          intent: 'success',
        });

        break;
    }
  };

  const enterClickHandler = (): void => {
    const eventId = Optional.unwrap(deps.router.eventId$.getSnapshot());

    const formState = getFormStateSnapshot();

    const enterButtonDisabled = Optional.unwrap(
      enterButtonDisabled$.getSnapshot(),
    );

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
