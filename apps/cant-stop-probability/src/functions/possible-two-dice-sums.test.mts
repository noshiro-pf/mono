import { ISet } from 'ts-data-forge';
import { possibleTwoDiceSums } from './possible-two-dice-sums.mjs';

test('{1, 1, 1, 1} -> {2}', () => {
  assert.deepStrictEqual(
    possibleTwoDiceSums(1, 1, 1, 1).toRawSet(),
    ISet.create([2]).toRawSet(),
  );
});

test('{1, 1, 1, 2} -> {2, 3}', () => {
  assert.deepStrictEqual(
    possibleTwoDiceSums(1, 1, 1, 2).toRawSet(),
    ISet.create([2, 3]).toRawSet(),
  );
});

test('{2, 2, 1, 1} -> {2, 3, 4}', () => {
  assert.deepStrictEqual(
    possibleTwoDiceSums(2, 2, 1, 1).toRawSet(),
    ISet.create([2, 3, 4]).toRawSet(),
  );
});

test('{2, 2, 5, 6} -> {4, 7, 8, 11}', () => {
  assert.deepStrictEqual(
    possibleTwoDiceSums(2, 2, 5, 6).toRawSet(),
    ISet.create([4, 7, 8, 11]).toRawSet(),
  );
});

test('{1, 1, 1, 5} -> {2, 6}', () => {
  assert.deepStrictEqual(
    possibleTwoDiceSums(1, 1, 1, 5).toRawSet(),
    ISet.create([2, 6]).toRawSet(),
  );
});
