// Example: src/functional/result.mts (Result.isOk / Result.isErr)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const operation = Result.ok(3);

const failure = Result.err('error');

if (Result.isOk(operation)) {
  const value: number = operation.value;

  assert(value === 3);
}

assert.ok(Result.isErr(failure));
