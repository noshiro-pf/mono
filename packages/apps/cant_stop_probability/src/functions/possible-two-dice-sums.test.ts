import { possibleTwoDiceSums } from './possible-two-dice-sums';

test('{1, 1, 1, 1} -> {2}', () => {
  expect(possibleTwoDiceSums(1, 1, 1, 1)).toStrictEqual(new Set([2]));
});

test('{1, 1, 1, 2} -> {2, 3}', () => {
  expect(possibleTwoDiceSums(1, 1, 1, 2)).toStrictEqual(new Set([2, 3]));
});

test('{2, 2, 1, 1} -> {2, 3, 4}', () => {
  expect(possibleTwoDiceSums(2, 2, 1, 1)).toStrictEqual(new Set([2, 3, 4]));
});

test('{2, 2, 5, 6} -> {4, 7, 8, 11}', () => {
  expect(possibleTwoDiceSums(2, 2, 5, 6)).toStrictEqual(new Set([4, 7, 8, 11]));
});

test('{1, 1, 1, 5} -> {2, 6}', () => {
  expect(possibleTwoDiceSums(1, 1, 1, 5)).toStrictEqual(new Set([2, 6]));
});
