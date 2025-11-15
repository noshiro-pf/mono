// Example: src/functional/ternary-result/impl/ternary-result-map-err.mts
import { TernaryResult } from 'ts-data-forge';

// embed-sample-code-ignore-above
const errValue = TernaryResult.err('boom');

const mappedErr = TernaryResult.mapErr(errValue, (error) =>
  error.toUpperCase(),
);

const warnPassthrough = TernaryResult.mapErr(
  TernaryResult.warn(2, 'slow'),
  (error: string) => `${error}!`,
);

assert.deepStrictEqual(mappedErr, TernaryResult.err('BOOM'));

assert.deepStrictEqual(warnPassthrough, TernaryResult.warn(2, 'slow'));
