import { packageManagerName } from '../functions/constants.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { getEndStepIndex, getStartStepIndex, steps } from './gen-steps.mjs';

for (const { name, fn } of steps('all').slice(
  getStartStepIndex('genPackages'),
  getEndStepIndex(`${packageManagerName} install`),
)) {
  await wrapStartEnd(fn, name).then(exitIfErr);
}
