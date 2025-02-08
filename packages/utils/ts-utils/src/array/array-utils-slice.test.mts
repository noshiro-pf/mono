import { Arr } from './array-utils.mjs';

describe('Arr', () => {
  describe('slice', () => {
    const list = [0, 1, 2, 3, 4] as const;

    test.each([
      {
        start: 0,
        end: 5,
        toBe: [0, 1, 2, 3, 4],
      }, // 正常
      {
        start: 0,
        end: 6,
        toBe: [0, 1, 2, 3, 4],
      }, // 片方オーバー
      {
        start: -1,
        end: 5,
        toBe: [0, 1, 2, 3, 4],
      }, // 片方オーバー
      {
        start: -1,
        end: 6,
        toBe: [0, 1, 2, 3, 4],
      }, // 両方オーバー
      {
        start: 0,
        end: 3,
        toBe: [0, 1, 2],
      }, // 正常
      {
        start: 1,
        end: 3,
        toBe: [1, 2],
      }, // 正常
      {
        start: -1,
        end: 3,
        toBe: [0, 1, 2],
      }, // 片方オーバー
      {
        start: 3,
        end: 5,
        toBe: [3, 4],
      }, // 正常
      {
        start: 3,
        end: 6,
        toBe: [3, 4],
      }, // 片方オーバー
      {
        start: 4,
        end: 3,
        toBe: [],
      }, // start > end
      {
        start: 0,
        end: -1,
        toBe: [],
      }, // start > end
      {
        start: -1,
        end: -2,
        toBe: [],
      }, // start > end
      {
        start: 6,
        end: 9,
        toBe: [],
      },
      {
        start: 6,
        end: 3,
        toBe: [],
      },
    ] as const)('slice($start, $end)', ({ start, end, toBe }) => {
      expect(Arr.sliceClamped(list, start, end)).toStrictEqual(toBe);
    });
  });
});
