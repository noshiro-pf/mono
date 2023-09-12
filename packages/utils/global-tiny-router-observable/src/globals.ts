/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import { createRouter } from '@noshiro/tiny-router-observable';

(global as any).createRouter = createRouter;
