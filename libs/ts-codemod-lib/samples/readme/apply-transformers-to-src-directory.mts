/* eslint-disable security/detect-non-literal-fs-filename */
// embed-sample-code-ignore-above
import * as fs from 'node:fs/promises';
import {
  appendAsConstTransformer,
  convertInterfaceToTypeTransformer,
  convertToReadonlyTypeTransformer,
  replaceAnyWithUnknownTransformer,
  replaceRecordWithUnknownRecordTransformer,
  transformSourceCode,
} from 'ts-codemod-lib';

for await (const filePath of fs.glob('path/to/src/**/*.{mts,tsx}')) {
  if (filePath.endsWith('.d.mts')) {
    console.log(`Skipping declaration file: ${filePath}`);

    continue;
  }

  console.log(`Processing file: ${filePath}`);

  const originalCode = await fs.readFile(filePath, 'utf8');

  const isTsx = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');

  // Apply transformations to source code
  const transformedCode = transformSourceCode(originalCode, isTsx, [
    convertInterfaceToTypeTransformer(),
    replaceRecordWithUnknownRecordTransformer(),
    convertToReadonlyTypeTransformer(),
    appendAsConstTransformer(),
    replaceAnyWithUnknownTransformer(),
  ]);

  await fs.writeFile(filePath, transformedCode, 'utf8');
}
