import * as t from 'ts-fortress';
import { jsonFields } from './github.mjs';

describe(jsonFields, () => {
  test('lists the keys of the schema, in the order they are declared', () => {
    assert.strictEqual(
      jsonFields(
        t.record({
          number: t.number(),
          headRefOid: t.string(),
          mergedAt: t.optional(t.string()),
        }),
      ),
      'number,headRefOid,mergedAt',
    );
  });
});
