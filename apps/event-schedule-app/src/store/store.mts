/**
 * The app's state, made once with the browser and Firebase as its surroundings.
 * What each part does, and the tests of it, are in the modules this puts
 * together — this file is only which real thing each is handed.
 * Nothing else creates a store, or reaches Firebase other than through `api`.
 */

import { createToaster } from 'blueprint-synstate';
import { createApi, initializeFirebase } from '../api/index.mjs';
import { fetchThrottleTime } from '../constants/index.mjs';
import {
  EventScheduleAppLocalStorage,
  fetchHolidaysJson,
} from '../functions/index.mjs';
import { now } from '../utils/index.mjs';
import {
  createAnswerFilterAndSortStore,
  createAnswerFilterQueryParam,
  createAnswerPageStore,
  createAnswerTableStore,
} from './answer-page-state/index.mjs';
import { createAuthStore } from './auth-store.mjs';
import { createConfirmEmailDialogStore } from './confirm-email-dialog-state.mjs';
import {
  createCreateEventScheduleStore,
  createEditEventScheduleStore,
} from './create-event-schedule-page/index.mjs';
import { createEventListFilterStore } from './event-list-page-state/index.mjs';
import { createErrorType } from './fetched-values-state.mjs';
import {
  createAnswersStore,
  createEventListStore,
  createEventScheduleStore,
} from './fetching-state/index.mjs';
import { createHolidaysStore } from './holidays-store.mjs';
import { createMediaStore } from './media-store.mjs';
import { createAppRouter } from './router-store.mjs';
import {
  createGoogleSignInStore,
  createRegisterPageStore,
  createResetPasswordPageStore,
  createSignInPageStore,
} from './sign-in-and-register-page-state/index.mjs';
import {
  createDeleteAccountCreatedWithGoogleStore,
  createDeleteAccountPageStore,
  createUpdateDisplayNamePageStore,
  createUpdateEmailPageStore,
  createUpdatePasswordPageStore,
  createUpdateUserInfoDialogStore,
} from './update-user-info-page-state/index.mjs';

/** The app's one connection to Firebase. */
export const api = createApi(initializeFirebase());

export const Router = createAppRouter();

/**
 * The app's one toaster, which every store and page shows its toasts in, so
 * that toasts shown at once stack rather than overlap.
 */
export const toaster: Promise<Toaster> = Promise.resolve(createToaster());

export const Auth = createAuthStore({ auth: api.auth, router: Router });

/**
 * The screens `isMobile$` reports as narrow. Declared here rather than with the
 * helpers below, because the media store reads it as it is created.
 */
const mobileMediaQuery = '(max-width: 600px)';

const mediaStore = createMediaStore({
  isMobile: () => matchMedia(mobileMediaQuery).matches,
  watchIsMobile: (onChange) => watchMediaQuery(mobileMediaQuery, onChange),
});

export const { isMobile$ } = mediaStore;

const holidaysStore = createHolidaysStore({ fetchHolidaysJson });

export const { holidaysJpDefinition$ } = holidaysStore;

export const EventScheduleStore = createEventScheduleStore({
  fetchEventSchedule: api.event.fetch,
  eventId$: Router.eventId$,
  throttleMs: fetchThrottleTime,
});

export const { eventSchedule$ } = EventScheduleStore;

export const AnswersStore = createAnswersStore({
  fetchAnswers: api.answers.fetchList,
  eventId$: Router.eventId$,
  fetchEventSchedule: EventScheduleStore.fetchEventSchedule,
  throttleMs: fetchThrottleTime,
});

export const errorType$ = createErrorType(
  EventScheduleStore.result$,
  AnswersStore.result$,
);

export const EventListPageFilterStore = createEventListFilterStore();

export const EventListStore = createEventListStore({
  fetchEventList: api.eventList.fetch,
  fireAuthUser$: Auth.fireAuthUser$,
  filter: EventListPageFilterStore,
  throttleMs: fetchThrottleTime,
});

export const { eventList$ } = EventListStore;

const answerFilterQueryParam = createAnswerFilterQueryParam({ router: Router });

export const AnswerFilterAndSortStore = createAnswerFilterAndSortStore({
  answers$: AnswersStore.answers$,
  eventSchedule$,
  queryParam: answerFilterQueryParam,
});

export const { answersFiltered$ } = AnswerFilterAndSortStore;

export const AnswerTableStore = createAnswerTableStore({
  eventSchedule$,
  filterAndSort: AnswerFilterAndSortStore,
  storage: {
    restoreTableIsFullWidth:
      EventScheduleAppLocalStorage.restoreAnswerTableIsFullWidth,
    saveTableIsFullWidth:
      EventScheduleAppLocalStorage.saveAnswerTableIsFullWidth,
  },
});

export const AnswerPageStore = createAnswerPageStore({
  api,
  answers: AnswersStore,
  auth: Auth,
  router: Router,
  eventSchedule$,
  toast: toaster,
});

export const CreateEventScheduleStore = createCreateEventScheduleStore({
  api,
  auth: Auth,
  storage: {
    restore: EventScheduleAppLocalStorage.restoreCreateEventPageTemp,
    save: EventScheduleAppLocalStorage.saveCreateEventPageTemp,
  },
  writeToClipboard: (text) =>
    // https://stackoverflow.com/questions/51805395/navigator-clipboard-is-undefined
    globalThis.isSecureContext
      ? globalThis.navigator.clipboard.writeText(text)
      : Promise.resolve(),
  router: Router,
  now,
  saveDelayMs: 500,
  toast: toaster,
});

export const EditEventScheduleStore = createEditEventScheduleStore({
  api,
  fireAuthUser$: Auth.fireAuthUser$,
  answers: AnswersStore,
  eventSchedule: EventScheduleStore,
  router: Router,
  toast: toaster,
});

export const ConfirmEmailDialogStore = createConfirmEmailDialogStore({
  api,
  router: Router,
  eventSchedule$,
  editEventSchedule: EditEventScheduleStore,
  toast: toaster,
});

export const GoogleSignInStore = createGoogleSignInStore({
  api,
  router: Router,
  toast: toaster,
});

export const RegisterPageStore = createRegisterPageStore({
  api,
  auth: Auth,
  router: Router,
  googleSignIn: GoogleSignInStore,
  toast: toaster,
});

export const ResetPasswordPageStore = createResetPasswordPageStore({
  api,
  router: Router,
  toast: toaster,
});

export const SignInPageStore = createSignInPageStore({
  api,
  router: Router,
  googleSignIn: GoogleSignInStore,
  toast: toaster,
});

export const UpdateUserInfoDialogStore = createUpdateUserInfoDialogStore();

export const DeleteAccountPageStore = createDeleteAccountPageStore({
  api,
  auth: Auth,
  dialog: UpdateUserInfoDialogStore,
  toast: toaster,
});

export const DeleteAccountCreatedWithGoogleStore =
  createDeleteAccountCreatedWithGoogleStore({
    api,
    auth: Auth,
    dialog: UpdateUserInfoDialogStore,
    toast: toaster,
  });

export const UpdateDisplayNamePageStore = createUpdateDisplayNamePageStore({
  api,
  auth: Auth,
  dialog: UpdateUserInfoDialogStore,
  toast: toaster,
});

export const UpdateEmailPageStore = createUpdateEmailPageStore({
  api,
  auth: Auth,
  dialog: UpdateUserInfoDialogStore,
  toast: toaster,
});

export const UpdatePasswordPageStore = createUpdatePasswordPageStore({
  api,
  auth: Auth,
  dialog: UpdateUserInfoDialogStore,
  toast: toaster,
});

/**
 * Starts listening to the auth state and the screen width, fetches the
 * holidays, starts reading the event, its answers and the event list, and
 * starts keeping the create page's settings in local storage.
 * Called once, from `main.tsx`, before the first render.
 *
 * Made on import, not here, because components import the stores by name:
 * the router (which reads `location`), `api` (which connects to Firebase), the
 * media store (which reads `matchMedia`, so that the first read of `isMobile$`
 * already has the screen width) and the toaster (which draws into
 * `document.body` and listens for Escape on `document`).
 */
export const startStore = (): (() => void) => {
  const stopAuth = Auth.start();

  const stopMedia = mediaStore.start();

  const stopHolidays = holidaysStore.start();

  // In the order their modules used to load: the event, its answers, then the
  // event list.
  const stopEventSchedule = EventScheduleStore.start();

  const stopAnswers = AnswersStore.start();

  const stopEventList = EventListStore.start();

  const stopCreateEventSchedule = CreateEventScheduleStore.start();

  return () => {
    stopEventSchedule();

    stopAnswers();

    stopEventList();

    stopCreateEventSchedule();

    stopAuth();

    stopMedia();

    stopHolidays();
  };
};

/**
 * Calls `onChange` with whether `query` matches, each time that changes;
 * returns what stops it.
 */
const watchMediaQuery = (
  query: string,
  onChange: (matches: boolean) => void,
): (() => void) => {
  const mediaQueryList = matchMedia(query);

  const listener = (change: Readonly<MediaQueryListEvent>): void => {
    onChange(change.matches);
  };

  mediaQueryList.addEventListener('change', listener);

  return () => {
    mediaQueryList.removeEventListener('change', listener);
  };
};
