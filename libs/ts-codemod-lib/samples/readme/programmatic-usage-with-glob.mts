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

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ // eslint-disable-next-line vitest/no-disabled-tests
  /* embed-sample-code-ignore-this-line */ test.skip('transformSourceCode with glob', async () => {
    for await (const filePath of fs.glob('test-code/**/*.{mts,tsx}')) {
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

    // embed-sample-code-ignore-below
  });
}
