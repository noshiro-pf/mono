/* eslint-disable tree-shakable/import-star */
import * as synstate from 'synstate';
import { ISet } from 'ts-data-forge';
import 'ts-repo-utils';

const outFile = 'src/synstate.mts';

const excludes = ISet.create([
  'createReducer',
  'createBooleanState',
  'createState',
] as const);

const createSrc = (): string =>
  [
    'export {',
    Object.keys(synstate)
      .filter((key) => !excludes.has(key))
      .join(','),
    "} from 'synstate';",
  ].join('\n');

const main = async (): Promise<void> => {
  const result = createSrc();

  await fs.writeFile(outFile, result, { flag: 'w' });
};

await main();
