import { glob } from 'glob';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as prettier from 'prettier';
import {
  appendAsConstTransformer,
  convertToReadonlyTypeTransformer,
  replaceAnyWithUnknownTransformer,
  transformSourceCode,
} from 'ts-codemod-lib';

const monoRootDir = path.resolve(import.meta.dirname, '../..');

const srcDir = path.resolve(
  monoRootDir,
  './packages/utils/ts-codemod-lib/src',
  // './packages/utils',
);

const srcFileList = await glob(`${srcDir}/**/*.mts`);
const srcFileListFiltered = srcFileList.filter(
  (s) => !s.endsWith('.d.mts') && s.includes('transform-source-code.mts'),
);

console.log('srcDir', srcDir);
console.log('target files: ', srcFileList);

await Promise.all(
  srcFileListFiltered.map(async (filePath) => {
    if (filePath.includes('file-to-ignore.ts')) return Promise.resolve();

    const content = await fs.readFile(filePath, { encoding: 'utf8' });

    const options = await prettier.resolveConfig(filePath);

    const contentTransformed = await transformSourceCode(
      content,
      [
        replaceAnyWithUnknownTransformer,
        appendAsConstTransformer(),
        convertToReadonlyTypeTransformer(),
      ],
      {
        ext: path.extname(filePath),
        tsconfig: {
          searchPath: path.dirname(filePath),
        },
      },
    );

    await fs.writeFile(filePath, contentTransformed);

    const contentFormatted = await prettier.format(contentTransformed, {
      ...options,
      filepath: filePath,
    });

    await fs.writeFile(filePath, contentFormatted);

    console.log(
      `${filePath} converted. ${content === contentFormatted ? '(unchanged)' : '(changed)'}`,
    );
  }),
);
