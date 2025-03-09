import { packageManagerName } from '../functions/constants.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { getEndStepIndex, getStartStepIndex, steps } from './gen-steps.mjs';

for (const { name, fn } of steps('all').slice(
  getStartStepIndex('fetchLibFiles'),
  getEndStepIndex(`${packageManagerName} install`),
)) {
  const res = await wrapStartEnd(fn, name);

  if (res === 'err') break;
}
