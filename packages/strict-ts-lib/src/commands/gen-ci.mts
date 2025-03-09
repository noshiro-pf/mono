import { wrapStartEnd } from '../functions/utils/wrap-start-end.mjs';
import { steps } from './gen-steps.mjs';

for (const { name, fn } of steps('all')) {
  const res = await wrapStartEnd(fn, name);

  if (res === 'err') break;
}
