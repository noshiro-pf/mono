/**
 * The page's state, made once with the browser as its surroundings. What it
 * does, and the tests of it, are in `loan-store.mts`; this file is only which
 * real thing it is handed.
 */

import { createRouter } from 'tiny-router-observable';
import { createLoanStore } from './loan-store.mjs';

export const loanStore = createLoanStore({
  // The app is served from `/mono/housing-loan-calculator/` on the repository's
  // Pages site, and the settings live in the query string of that page, so the
  // router has to keep the base when it writes one.
  router: createRouter({ basePath: import.meta.env.BASE_URL }),
  calcDelayMs: 500,
});
