import { hasKeyValue } from './has-key-value';
import { isRecord } from './is-record';
import { isNumber } from './is-type';

describe('hasKeyValue', () => {
  type Point = { x: number; y: number };
  type Line = { begin: Point; end: Point };

  const isPoint = (a: unknown): a is Point =>
    isRecord(a) &&
    hasKeyValue(a, 'x', isNumber) &&
    hasKeyValue(a, 'y', isNumber);

  const isLine = (a: unknown): a is Line =>
    isRecord(a) &&
    hasKeyValue(a, 'begin', isPoint) &&
    hasKeyValue(a, 'end', isPoint);

  test('', () => {
    expect(
      isLine({
        begin: { x: 1, y: 1 },
        end: { x: 2, y: 3 },
      }),
    ).toBe(true);
  });
});
