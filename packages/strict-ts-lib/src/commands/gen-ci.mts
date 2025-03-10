import { wrapStartEnd } from '../functions/index.mjs';
import { steps } from './gen-steps.mjs';

for (const { name, fn } of steps('all')) {
  const res = await wrapStartEnd(fn, name);

  if (res === 'err') break;
}
