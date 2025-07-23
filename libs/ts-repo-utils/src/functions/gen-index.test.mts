export {}; // Make this file a module

describe('index file regex', () => {
  const reg = /^index\.[cm]?[jt]s[x]?$/u;

  test.each([
    ['index.ts', true],
    ['index.js', true],
    ['index.mts', true],
    ['index.mjs', true],
    ['index.cts', true],
    ['index.cjs', true],
    ['index.tsx', true],
    ['index.jsx', true],
    ['not-index.ts', false],
    ['index.txt', false],
  ] as const)('reg.test($0) to be $1', (fileName, expected) => {
    expect(reg.test(fileName)).toBe(expected);
  });
});
