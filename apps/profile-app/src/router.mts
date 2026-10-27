import { createRouter } from 'tiny-router-observable';

// The app is served from `/mono/profile/` on the repository's Pages site, and
// the tabs are paths below it (`/mono/profile/career/`), so the router reads
// and writes them relative to that base.
export const Router = createRouter({ basePath: import.meta.env.BASE_URL });
