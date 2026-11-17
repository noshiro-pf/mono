import { insertTexts } from './insert-texts.mjs';

describe(insertTexts, () => {
  test('inserts at offsets into the original text, whatever their order', () => {
    expect(
      insertTexts('abc', [
        { position: 3, text: '!' },
        { position: 0, text: '[' },
        { position: 1, text: '|' },
      ]),
    ).toBe('[a|bc!');
  });

  test('keeps insertions at one position in the order given', () => {
    expect(
      insertTexts('ab', [
        { position: 1, text: '(' },
        { position: 1, text: ')' },
      ]),
    ).toBe('a()b');
  });
});
