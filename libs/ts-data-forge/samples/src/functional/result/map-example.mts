// Example: src/functional/result.mts (Result.map)
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-above
const okNumber = Result.ok(5);
const errMessage = Result.err('error');

const doubled = Result.map(okNumber, (value) => value * 2);
const untouchedError = Result.map(errMessage, (value: number) => value * 2);

assert.deepStrictEqual(doubled, Result.ok(10));
assert.deepStrictEqual(untouchedError, errMessage);

const mapToLength = Result.map((text: string) => text.length);

assert.deepStrictEqual(mapToLength(Result.ok('abc')), Result.ok(3));
assert.deepStrictEqual(mapToLength(Result.err('bad')), Result.err('bad'));
