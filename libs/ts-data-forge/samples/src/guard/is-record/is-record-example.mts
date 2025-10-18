// Example: src/guard/is-record.mts (isRecord)
import { isRecord } from 'ts-data-forge';

// embed-sample-code-ignore-above
const entries: unknown[] = [{ id: 1 }, ['tuple']];

const records = entries.filter(isRecord);

assert.deepStrictEqual(records, [{ id: 1 }]);
