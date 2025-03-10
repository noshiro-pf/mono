import { wrapStartEnd } from '../functions/index.mjs';
import { getEndStepIndex, getStartStepIndex, steps } from './gen-steps.mjs';

for (const { name, fn } of steps('all').slice(
  getStartStepIndex('genLibFiles'),
  getEndStepIndex('format lib-files'),
)) {
  const res = await wrapStartEnd(fn, name);

  if (res === 'err') break;
}
