/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import { createRouter, withSlash } from '@noshiro/tiny-router-observable';

(global as any).createRouter = createRouter;
(global as any).withSlash = withSlash;
