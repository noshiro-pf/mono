import { ISet } from '@noshiro/ts-utils';
import { possibleTwoDiceSums } from './possible-two-dice-sums';

test('{1, 1, 1, 1} -> {2}', () => {
  expect(possibleTwoDiceSums(1, 1, 1, 1).toRawSet()).toStrictEqual(
    ISet.new([2]).toRawSet()
  );
});

test('{1, 1, 1, 2} -> {2, 3}', () => {
  expect(possibleTwoDiceSums(1, 1, 1, 2).toRawSet()).toStrictEqual(
    ISet.new([2, 3]).toRawSet()
  );
});

test('{2, 2, 1, 1} -> {2, 3, 4}', () => {
  expect(possibleTwoDiceSums(2, 2, 1, 1).toRawSet()).toStrictEqual(
    ISet.new([2, 3, 4]).toRawSet()
  );
});

test('{2, 2, 5, 6} -> {4, 7, 8, 11}', () => {
  expect(possibleTwoDiceSums(2, 2, 5, 6).toRawSet()).toStrictEqual(
    ISet.new([4, 7, 8, 11]).toRawSet()
  );
});

test('{1, 1, 1, 5} -> {2, 6}', () => {
  expect(possibleTwoDiceSums(1, 1, 1, 5).toRawSet()).toStrictEqual(
    ISet.new([2, 6]).toRawSet()
  );
});
