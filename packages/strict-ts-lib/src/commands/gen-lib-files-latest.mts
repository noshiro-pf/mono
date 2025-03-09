import { typescriptVersions } from '../functions/typescript-versions.mjs';
import { exitIfErr } from '../functions/utils/exit-if-err.mjs';
import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { getEndStepIndex, getStartStepIndex, steps } from './gen-steps.mjs';

for (const { name, fn } of steps(typescriptVersions[0]).slice(
  getStartStepIndex('genLibFiles'),
  getEndStepIndex('format lib-files'),
)) {
  await wrapStartEnd(fn, name).then(exitIfErr);
}
