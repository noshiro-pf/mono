// Example: src/functional/optional.mts (Optional.flatMap)
import { Optional } from 'ts-data-forge';

// embed-sample-code-ignore-above
const parseNumber = (input: string): Optional<number> => {
  const num = Number.parseInt(input, 10);

  return Number.isNaN(num) ? Optional.none : Optional.some(num);
};

const parsed = Optional.flatMap(Optional.some('10'), parseNumber);

assert.deepStrictEqual(parsed, Optional.some(10));

const flatMapParse = Optional.flatMap(parseNumber);

assert.deepStrictEqual(flatMapParse(Optional.some('5')), Optional.some(5));

assert.deepStrictEqual(flatMapParse(Optional.some('invalid')), Optional.none);
