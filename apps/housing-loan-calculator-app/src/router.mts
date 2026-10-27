import { createRouter } from 'tiny-router-observable';

// The app is served from `/mono/housing-loan-calculator/` on the repository's
// Pages site, and the settings live in the query string of that page, so the
// router has to keep the base when it writes one.
export const Router = createRouter({ basePath: import.meta.env.BASE_URL });
