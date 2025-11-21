// Example: src/guard/is-record.mts (isMutableRecord)
import { isMutableRecord } from 'ts-data-forge';

// embed-sample-code-ignore-above
const obj: unknown = { foo: 1 };

if (isMutableRecord(obj)) {
  obj['bar'] = 2; // Safe: obj is now known to be a mutable record
}
