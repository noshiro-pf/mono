import { packageManagerName } from '../functions/constants.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { genSteps, getEndStepIndex, getStartStepIndex } from './gen-steps.mjs';

for (const { name, fn } of genSteps.slice(
  getStartStepIndex('format temp/copied'),
  getEndStepIndex(`${packageManagerName} install`),
)) {
  await wrapStartEnd(fn, name).then(exitIfErr);
}
