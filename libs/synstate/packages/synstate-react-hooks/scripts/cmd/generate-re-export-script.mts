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

// [memo] 元は src/synstate.mts には以下のようにして 'synstate' から一部を除いて re-export する
// コードを書いていたが、これだと tree shaking ができなくなる問題があったため、
// 明示的な re-export を行うコードをこのスクリプトで生成するようにした。
//
//
// import * as synstate from 'synstate';
//
// const { createReducer, createBooleanState, createState, ...rest } = synstate;
//
// // eslint-disable-next-line import/no-anonymous-default-export, import/no-default-export
// export default {
//   ...rest,
// };
