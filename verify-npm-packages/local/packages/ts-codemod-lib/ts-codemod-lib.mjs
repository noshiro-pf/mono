import * as assert from 'node:assert/strict';
import {
  convertToReadonlyTransformer,
  transformSourceCode,
} from 'ts-codemod-lib';

const before = 'const xs: string[] = [];\n';

const after = transformSourceCode(before, false, [
  convertToReadonlyTransformer(),
]);

assert.match(after, /readonly\s+string\[\]/u);

console.info('ts-codemod-lib ok');
