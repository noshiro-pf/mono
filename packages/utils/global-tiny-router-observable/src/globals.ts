/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable functional/immutable-data */

import { createRouter, withSlash } from '@noshiro/tiny-router-observable';

(global as any).createRouter = createRouter;
(global as any).withSlash = withSlash;
