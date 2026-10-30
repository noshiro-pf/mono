/**
 * The app's state, made once with the browser and Firebase as its
 * surroundings. What each part does, and the tests of it, are in the modules
 * this puts together — this file is only which real thing each is handed.
 *
 * The stores not yet made by a factory (#2094) import what they need of these
 * from here.
 */

import { api } from '../api/index.mjs';
import { fetchHolidaysJson } from '../functions/index.mjs';
import { createAuthStore } from './auth-store.mjs';
import { createHolidaysStore } from './holidays-store.mjs';
import { createMediaStore } from './media-store.mjs';
import { createAppRouter } from './router-store.mjs';

export const Router = createAppRouter();

export const Auth = createAuthStore({ auth: api.auth, router: Router });

const mediaStore = createMediaStore({
  watchIsMobile: (onChange) => watchMediaQuery('(max-width: 600px)', onChange),
});

export const { useIsMobile } = mediaStore;

const holidaysStore = createHolidaysStore({ fetchHolidaysJson });

export const { holidaysJpDefinition$ } = holidaysStore;

/**
 * Starts listening to the auth state and the screen width, and fetches the
 * holidays. Called once, from `main.tsx`, before the first render.
 *
 * The router (which reads `location`) and `api` (which connects to Firebase)
 * are still made on import, because the stores not yet made by a factory read
 * them at the top level of their modules.
 */
export const startStore = (): (() => void) => {
  const stopAuth = Auth.start();

  const stopMedia = mediaStore.start();

  const stopHolidays = holidaysStore.start();

  return () => {
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
