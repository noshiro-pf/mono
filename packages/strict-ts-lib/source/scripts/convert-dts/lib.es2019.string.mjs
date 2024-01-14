import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs2019String = (from) => {
  let mut_ret = from;

  // comment out deprecated functions
  for (const line of ['trimLeft(): string;', 'trimRight(): string;']) {
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(line, `// ${line}`),
    ).value;
  }

  return mut_ret;
};
