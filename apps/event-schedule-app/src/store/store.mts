/**
 * The app's state, made once with the browser and Firebase as its
 * surroundings. What each part does, and the tests of it, are in the modules
 * this puts together — this file is only which real thing each is handed.
 *
 * The stores not yet made by a factory (#2094) import what they need of these
 * from here.
 */

import { api } from '../api/index.mjs';
import { fetchThrottleTime } from '../constants/index.mjs';
import {
  EventScheduleAppLocalStorage,
  createToaster,
  fetchHolidaysJson,
} from '../functions/index.mjs';
import { toAbsolutePath } from '../utils-ported/index.mjs';
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

export const Router = createAppRouter();

export const Auth = createAuthStore({ auth: api.auth, router: Router });

const mediaStore = createMediaStore({
  watchIsMobile: (onChange) => watchMediaQuery('(max-width: 600px)', onChange),
});

export const { useIsMobile } = mediaStore;

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
});

export const AnswerPageStore = createAnswerPageStore({
  api,
  answers: AnswersStore,
  auth: Auth,
  router: Router,
  eventSchedule$,
  toast: createToaster(),
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
  toAbsolutePath,
  now,
  saveDelayMs: 500,
  toast: createToaster(),
});

export const EditEventScheduleStore = createEditEventScheduleStore({
  api,
  fireAuthUser$: Auth.fireAuthUser$,
  answers: AnswersStore,
  eventSchedule: EventScheduleStore,
  router: Router,
  toast: createToaster(),
});

export const ConfirmEmailDialogStore = createConfirmEmailDialogStore({
  api,
  router: Router,
  eventSchedule$,
  editEventSchedule: EditEventScheduleStore,
  toast: createToaster(),
});

export const GoogleSignInStore = createGoogleSignInStore({
  api,
  router: Router,
  toast: createToaster(),
});

export const RegisterPageStore = createRegisterPageStore({
  api,
  router: Router,
  googleSignIn: GoogleSignInStore,
  toast: createToaster(),
});

export const ResetPasswordPageStore = createResetPasswordPageStore({
  api,
  router: Router,
  toast: createToaster(),
});

export const SignInPageStore = createSignInPageStore({
  api,
  router: Router,
  googleSignIn: GoogleSignInStore,
  toast: createToaster(),
});

/**
 * Starts listening to the auth state and the screen width, fetches the
 * holidays, starts reading the event, its answers and the event list, and
 * starts keeping the create page's settings in local storage.
 * Called once, from `main.tsx`, before the first render.
 *
 * Still made on import: the router (which reads `location`) and `api` (which
 * connects to Firebase), because the stores not yet made by a factory read
 * them at the top level of their modules; and each page's toaster (which adds
 * an element to `document.body`), as their modules made it before.
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
