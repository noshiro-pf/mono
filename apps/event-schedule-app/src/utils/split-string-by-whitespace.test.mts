import { splitStringByWhitespace } from './split-string-by-whitespace.mjs';

describe('splitStringByWhitespace', () => {
  test('1 whitespace', () => {
    expect(splitStringByWhitespace('aaa bbb')).toStrictEqual([
      'aaa',
      ' ',
      'bbb',
    ]);
  });

  test('2 whitespaces', () => {
    expect(splitStringByWhitespace('aaa bbb ccc')).toStrictEqual([
      'aaa',
      ' ',
      'bbb',
      ' ',
      'ccc',
    ]);
  });

  test('2 sequential whitespaces', () => {
    expect(splitStringByWhitespace('aaa     bbb    ccc')).toStrictEqual([
      'aaa',
      ' '.repeat(5),
      'bbb',
      ' '.repeat(4),
      'ccc',
    ]);
  });

  test('2 sequential whitespaces and newline', () => {
    expect(
      splitStringByWhitespace(`aaa
    bbb
    ccc`),
    ).toStrictEqual(['aaa', '\n    ', 'bbb', '\n    ', 'ccc']);
  });
});
