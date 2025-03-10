import { packageManagerName } from '../constants.mjs';
import { wrapStartEnd } from '../functions/index.mjs';
import { getEndStepIndex, getStartStepIndex, steps } from './gen-steps.mjs';

for (const { name, fn } of steps('all').slice(
  getStartStepIndex('format temp/copied'),
  getEndStepIndex(`${packageManagerName} install`),
)) {
  const res = await wrapStartEnd(fn, name);

  if (res === 'err') break;
}
