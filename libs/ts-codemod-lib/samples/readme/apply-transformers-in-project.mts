/* eslint-disable security/detect-non-literal-fs-filename */
// embed-sample-code-ignore-above
import * as fs from 'node:fs/promises';
import {
  createProjectTransformer,
  enableExplicitFunctionReturnTypeTransformer,
} from 'ts-codemod-lib';

const transform = createProjectTransformer('path/to/tsconfig.json', [
  enableExplicitFunctionReturnTypeTransformer({ allowExpressions: true }),
]);

for await (const filePath of fs.glob('path/to/src/**/*.{mts,tsx}')) {
  const originalCode = await fs.readFile(filePath, 'utf8');

  const transformedCode = transform(filePath, originalCode);

  if (transformedCode !== originalCode) {
    await fs.writeFile(filePath, transformedCode, 'utf8');
  }
}
