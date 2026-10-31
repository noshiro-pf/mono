import dedent from 'dedent';
import { Arr } from 'ts-data-forge';
import {
  findVariantSpellings,
  JAPANESE_TERMS,
  termsFor,
  type JapaneseTerm,
} from './check-japanese-terms.mjs';

const DIAMOND: JapaneseTerm = {
  preferred: 'ダイヤモンド',
  variants: ['ダイアモンド'],
  scope: ['apps/synstate-docs/'],
} as const;

const PROPAGATION: JapaneseTerm = {
  preferred: '伝搬',
  variants: ['伝播'],
  scope: ['apps/synstate-docs/'],
} as const;

describe('findVariantSpellings', () => {
  test('reports each variant with its position and the spelling to use', () => {
    assert.deepStrictEqual(
      findVariantSpellings(
        dedent`
          ## カスケードダイアモンド

          更新はダイヤモンドの両側に伝播します。
        `,
        [DIAMOND, PROPAGATION],
      ),
      [
        {
          line: 1,
          column: 9,
          variant: 'ダイアモンド',
          preferred: 'ダイヤモンド',
        },
        { line: 3, column: 14, variant: '伝播', preferred: '伝搬' },
      ],
    );
  });

  test('reports the occurrences on a line from left to right', () => {
    assert.deepStrictEqual(
      findVariantSpellings('伝播するダイアモンドへ伝播', [
        DIAMOND,
        PROPAGATION,
      ]).map(({ column, variant }) => `${column}:${variant}`),
      ['1:伝播', '5:ダイアモンド', '12:伝播'],
    );
  });

  test('reports every occurrence on a line, not only the first', () => {
    assert.deepStrictEqual(
      findVariantSpellings('ダイアモンド1つ、ダイアモンドが連なる', [
        DIAMOND,
      ]).map(({ column }) => column),
      [1, 10],
    );
  });

  test('reads code as well as prose', () => {
    assert.deepStrictEqual(
      findVariantSpellings(
        "const label = { ja: '[カスケードダイアモンド](#シナリオ-カスケードダイアモンド)' };",
        [DIAMOND],
      ).map(({ column }) => column),
      [28, 47],
    );
  });

  test('leaves the preferred spellings alone', () => {
    assert.deepStrictEqual(
      findVariantSpellings('ダイヤモンドの両側に伝搬します。', [
        DIAMOND,
        PROPAGATION,
      ]),
      [],
    );
  });

  test('leaves a variant alone where it is part of the preferred spelling', () => {
    const server: JapaneseTerm = {
      preferred: 'サーバー',
      variants: ['サーバ'],
      scope: [''],
    } as const;

    assert.deepStrictEqual(
      findVariantSpellings('サーバーとサーバの設定', [server]),
      [{ line: 1, column: 6, variant: 'サーバ', preferred: 'サーバー' }],
    );
  });
});

describe('termsFor', () => {
  test('gives a path the terms whose scope covers it', () => {
    const page = 'apps/synstate-docs/src/content/docs/ja/guides/page.md';

    assert.deepStrictEqual(
      termsFor(page),
      JAPANESE_TERMS.filter(({ scope }) =>
        scope.includes('apps/synstate-docs/'),
      ),
    );
  });

  test('gives a path outside every scope none', () => {
    assert.deepStrictEqual(termsFor('languages/sumi/docs/spec.md'), []);
  });
});

describe('JAPANESE_TERMS', () => {
  test('never forbids a spelling another term prefers', () => {
    const preferred = new Set<string>(
      JAPANESE_TERMS.map((term) => term.preferred),
    );

    assert.deepStrictEqual(
      JAPANESE_TERMS.flatMap((term) => term.variants).filter((variant) =>
        preferred.has(variant),
      ),
      [],
    );
  });

  test('has no empty variant, no empty scope and no prefix that is every path', () => {
    // A prefix of '' would read the verbatim texts under docs/ and
    // experimental/, which nobody may rewrite.
    assert.deepStrictEqual(
      JAPANESE_TERMS.filter(
        ({ variants, scope }) =>
          variants.includes('') || !Arr.isNonEmpty(scope) || scope.includes(''),
      ),
      [],
    );
  });
});
