import { splitStringByWhitespace } from './split-string-by-whitespace';

describe('splitStringByWhitespace', () => {
  test('1 whitespace', () => {
    expect(splitStringByWhitespace('aaa bbb')).toEqual(['aaa', 'bbb']);
  });

  test('2 whitespaces', () => {
    expect(splitStringByWhitespace('aaa bbb ccc')).toEqual([
      'aaa',
      'bbb',
      'ccc',
    ]);
  });

  test('2 sequential whitespaces', () => {
    expect(splitStringByWhitespace('aaa     bbb    ccc')).toEqual([
      'aaa',
      'bbb',
      'ccc',
    ]);
  });

  test('2 sequential whitespaces and newline', () => {
    expect(
      splitStringByWhitespace(`aaa     
    bbb
    ccc`)
    ).toEqual(['aaa', 'bbb', 'ccc']);
  });
});
