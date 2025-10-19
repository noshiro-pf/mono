// Example: src/array/array-utils.mts (values)
import { Arr } from 'ts-data-forge';

// embed-sample-code-ignore-above
const players = ['Ada', 'Grace', 'Alan'];

const valueList = Array.from(Arr.values(players));

assert.deepStrictEqual(valueList, players);
