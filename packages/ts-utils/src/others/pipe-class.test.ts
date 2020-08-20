import { pipeClass } from './pipe-class';

test('pipe 1', () => {
  expect(
    pipeClass(1)
      .map((x) => x * 2)
      .map((x) => x.toString()).value
  ).toBe('2');
});

test('pipe 2', () => {
  expect(
    pipeClass({ x: 2, y: 3 })
      .map((p) => ({ x: p.x, y: p.y * 4 }))
      .map((p) => ({ x: p.x * 5, y: p.y })).value
  ).toStrictEqual({ x: 10, y: 12 });
});
