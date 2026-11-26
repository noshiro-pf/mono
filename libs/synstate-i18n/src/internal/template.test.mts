import { asUint32 } from 'ts-data-forge';
import * as Arr from 'ts-data-forge/array';
import {
  clearCompiled,
  compiledLimit,
  compileMessage,
  fill,
} from './template.mjs';

const placeholder = '{x}';

describe(compileMessage, () => {
  test('drops the oldest template at the limit, and fills it again all the same', () => {
    try {
      const oldest = compileMessage(`oldest ${placeholder}`);

      const templates = Arr.seq(asUint32(compiledLimit)).map((i) =>
        compileMessage(`message ${i} ${placeholder}`),
      );

      // Still cached: the newest.
      assert.strictEqual(
        compileMessage(`message ${compiledLimit - 1} ${placeholder}`),
        templates.at(-1),
      );

      // Dropped, so scanned again: another template, filled the same.
      const again = compileMessage(`oldest ${placeholder}`);

      assert.notStrictEqual(again, oldest);

      assert.strictEqual(fill(again, { x: 1 }), 'oldest 1');
    } finally {
      // The tests run after this one in the same process, failed or not, find
      // it as a store would.
      clearCompiled();
    }
  });
});
