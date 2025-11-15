// Example: src/functional/result.mts (Result.ok / Result.err)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const success = Result.ok({ id: 1 });

const failure = Result.err(new Error('missing data'));

assert.deepStrictEqual(success, {
  $$tag: 'ts-data-forge::Result.ok',
  value: { id: 1 },
});

assert.ok(Result.isErr(failure));
