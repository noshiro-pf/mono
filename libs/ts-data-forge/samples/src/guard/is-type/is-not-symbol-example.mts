// Example: src/guard/is-type.mts (isNotSymbol)
import { isNotSymbol } from 'ts-data-forge';

// embed-sample-code-ignore-above
const id = Symbol('id');
const tokens: unknown[] = [id, 'shared'];

const nonSymbols = tokens.filter(isNotSymbol);

assert.deepStrictEqual(nonSymbols, ['shared']);
