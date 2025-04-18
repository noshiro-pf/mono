import { glob } from 'glob';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import * as prettier from 'prettier';
import {
  appendAsConstTransformer,
  astTransformerToStringTransformer,
  convertToReadonlyTypeTransformer,
  replaceAnyWithUnknownTransformer,
} from 'ts-codemod-lib';

// Create a string transformer by combining multiple AST transformers
// It's recommended to apply all transformers at once for better performance
const stringTransformer = astTransformerToStringTransformer([
  replaceAnyWithUnknownTransformer,
  appendAsConstTransformer,
  convertToReadonlyTypeTransformer(),
]);

const srcDir = path.resolve(
  import.meta.dirname,
  /* or `path.dirname(url.fileURLToPath(import.meta.url))` if Node.js version < v20.11.0 */
  '../src',
);

const srcFileList = await glob(`${srcDir}/**/*.mts`);

await Promise.all(
  srcFileList.map(async (filePath) => {
    if (filePath.includes('file-to-ignore.ts')) return Promise.resolve();

    const content = await fs.readFile(filePath, { encoding: 'utf8' });

    const options = await prettier.resolveConfig(filePath);

    const contentConverted = await prettier.format(stringTransformer(content), {
      ...options,
      filepath: filePath,
    });

    await fs.writeFile(filePath, contentConverted);

    console.log(
      `${filePath} converted. ${content === contentConverted ? '(unchanged)' : '(changed)'}`,
    );
  }),
);
