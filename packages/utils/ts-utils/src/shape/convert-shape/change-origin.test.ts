import { changeOriginOfPos, changeOriginOfRect } from './change-origin';

test('changeOriginOfPos', () => {
  const pos = { x: 300, y: 400 };
  const changeOriginFn = changeOriginOfPos({ x: 0, y: 0 }, { x: 200, y: 100 });
  expect(changeOriginFn(pos)).toEqual({ x: 100, y: 300 });
});

test('changeOriginOfPos', () => {
  const pos = { x: 500, y: 400 };
  const changeOriginFn = changeOriginOfPos({ x: 200, y: 100 }, { x: 0, y: 0 });
  expect(changeOriginFn(pos)).toEqual({ x: 700, y: 500 });
});

test('changeOriginOfRect', () => {
  const rect = { left: 300, top: 400, width: 50, height: 50 };
  const changeOriginFn = changeOriginOfRect({ x: 0, y: 0 }, { x: 200, y: 100 });
  expect(changeOriginFn(rect)).toEqual({
    left: 100,
    top: 300,
    width: 50,
    height: 50,
  });
});

test('changeOriginOfRect', () => {
  const rect = { left: 500, top: 400, width: 50, height: 50 };
  const changeOriginFn = changeOriginOfRect({ x: 200, y: 100 }, { x: 0, y: 0 });
  expect(changeOriginFn(rect)).toEqual({
    left: 700,
    top: 500,
    width: 50,
    height: 50,
  });
});
