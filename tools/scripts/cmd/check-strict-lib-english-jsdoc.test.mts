import dedent from 'dedent';
import {
  findJapaneseInJsdoc,
  isPublishedStrictLib,
} from './check-strict-lib-english-jsdoc.mjs';

describe(findJapaneseInJsdoc, () => {
  test('reports each line of a JSDoc comment that has Japanese in it', () => {
    const text = dedent`
      /**
       * Narrows the object.
       * R が union 型のとき、要素を絞る。
       * @note ひらがな、カタカナ、漢字
       */
      declare const f: () => void;
    `;

    assert.deepStrictEqual(findJapaneseInJsdoc(text), [
      { line: 3, text: '* R が union 型のとき、要素を絞る。' },
      { line: 4, text: '* @note ひらがな、カタカナ、漢字' },
    ]);
  });

  test('a one-line JSDoc comment, and one after code on its line, are read too', () => {
    const text = dedent`
      /** 日本語 */
      declare const g: number; /** 型 */
    `;

    assert.deepStrictEqual(findJapaneseInJsdoc(text), [
      { line: 1, text: '/** 日本語 */' },
      { line: 2, text: 'declare const g: number; /** 型 */' },
    ]);
  });

  test('Japanese in a line comment or a plain block comment is left alone', () => {
    const text = dedent`
      // 下の例に対応するため
      /* 日本語のブロックコメント */
      /**
       * English only, with a minus sign − and an arrow →.
       */
      declare const h: string;
    `;

    assert.deepStrictEqual(findJapaneseInJsdoc(text), []);
  });

  test('an empty block comment does not open a JSDoc comment that runs on', () => {
    const text = dedent`
      /**/ declare const a: number;
      // 日本語
      declare const b: number;
    `;

    assert.deepStrictEqual(findJapaneseInJsdoc(text), []);
  });
});

describe(isPublishedStrictLib, () => {
  test('takes the declaration files of each published bundle', () => {
    assert.isTrue(
      isPublishedStrictLib(
        'strict-lib/v7.0/output/lib/libs/es2022/object/index.d.ts',
      ),
    );

    assert.isTrue(
      isPublishedStrictLib(
        'strict-lib/v5.0/output/lib/libs-branded/dom/index.d.ts',
      ),
    );
  });

  test.each([
    'strict-lib/scripts-common/src/convert-dts/lib.es2022.object.mts',
    'strict-lib/v7.0/output/lib-files/lib.es2022.object.d.ts',
    'strict-lib/v7.0/output/diff-from-official/lib.es2022.object.d.ts',
    'strict-lib/v7.0/temp/copied/lib.es2022.object.d.ts',
    'strict-lib/v7.0/output/lib/README.md',
    'experimental/strict-lib/v7.0/output/lib/libs/index.d.ts',
  ])('leaves %s', (path) => {
    assert.isFalse(isPublishedStrictLib(path));
  });
});
