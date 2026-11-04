import * as fs from 'node:fs/promises';
import * as path from 'node:path';

describe('node-version-gated-apis.mts', () => {
  test('imports nothing', async () => {
    // Node.js loads this repository's `tools/configs/oxlint-rules.mts`, which
    // reads this module from source with nothing built, so a runtime import
    // here (a lint fix once added `Arr` from `ts-data-forge`) breaks oxlint
    // wherever `dist/` is missing.
    const source = await fs.readFile(
      path.join(import.meta.dirname, 'node-version-gated-apis.mts'),
      'utf8',
    );

    // A value import or re-export, however it is wrapped, or a dynamic one;
    // `import type` is erased and allowed.
    assert.notMatch(
      source,
      /^\s*import\b(?!\s+type\b)|^\s*export\b(?!\s+type\b)[^;'"`]*\bfrom\b|\bimport\s*\(/mu,
    );
  });
});
