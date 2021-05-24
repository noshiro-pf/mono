import { pipe } from './pipe-class';

test('pipe 1', () => {
  expect(
    pipe(1)
      .chain((x) => x * 2)
      .chain((x) => x.toString()).value
  ).toBe('2');
});

test('pipe 2', () => {
  expect(
    pipe({ x: 2, y: 3 } as const)
      .chain((p) => ({ x: p.x, y: p.y * 4 } as const))
      .chain((p) => ({ x: p.x * 5, y: p.y })).value
  ).toStrictEqual({ x: 10, y: 12 });
});
