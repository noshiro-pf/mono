import { createRouter } from 'tiny-router-observable';

// The app is served from `/mono/algo-app/` on the repository's Pages site;
// the router reads and writes paths below that.
export const Router = createRouter({ basePath: import.meta.env.BASE_URL });
