/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data,
  import/no-internal-modules,
*/

import { dict } from '../src/constants/dictionary/dictionary';

(global as any).dict = dict;
