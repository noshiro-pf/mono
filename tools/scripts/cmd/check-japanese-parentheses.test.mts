import dedent from 'dedent';
import {
  findHalfwidthParentheses,
  toFullwidthParentheses,
} from './check-japanese-parentheses.mjs';

const matchesOf = (text: string, markdown = false): readonly string[] =>
  findHalfwidthParentheses(text, { markdown }).map(
    (violation) => violation.matched,
  );

describe('findHalfwidthParentheses', () => {
  test('reports a pair around Japanese that follows Japanese', () => {
    assert.deepStrictEqual(matchesOf('速度(実測)を測る。'), ['(実測)']);
  });

  test('reports a pair whose Latin run is followed by Japanese', () => {
    assert.deepStrictEqual(matchesOf('native tsc(TS 7、実測)の出力。'), [
      '(TS 7、実測)',
    ]);
  });

  test('reports a pair that only the character after it makes Japanese', () => {
    assert.deepStrictEqual(matchesOf('D-50 (2026-09-08、確定)を参照。'), [
      '(2026-09-08、確定)',
    ]);
  });

  test('leaves a call expression alone, whatever its arguments say', () => {
    assert.deepStrictEqual(
      matchesOf("await expect(el).toHaveText('合計額');"),
      [],
    );
  });

  test('leaves a pair around a purely Latin run alone', () => {
    assert.deepStrictEqual(matchesOf('拘束 compilerOptions (D-7)の検証。'), []);
  });

  test('leaves a fullwidth pair alone', () => {
    assert.deepStrictEqual(matchesOf('速度（実測）を測る。'), []);
  });

  test('leaves a Markdown link destination alone', () => {
    assert.deepStrictEqual(
      matchesOf('詳細は [仕様](./spec/readonly.md#読み取り専用)を参照。', true),
      [],
    );
  });

  test('leaves an inline code span alone', () => {
    assert.deepStrictEqual(matchesOf('`関数(引数)` を呼ぶ。', true), []);
  });

  test('still reports prose that merely contains an inline code span', () => {
    assert.deepStrictEqual(
      matchesOf('空配列でなければならない(`apply` が拒否する)。', true),
      ['(`apply` が拒否する)'],
    );
  });

  test('reads nothing inside a fenced code block', () => {
    const text = dedent`
      次のコードを見る。

      \`\`\`ts
      // ← 最も低層 (どこからも依存される)
      const x = 1;
      \`\`\`

      以上(補足)。
    `;

    assert.deepStrictEqual(matchesOf(text, true), ['(補足)']);
  });

  test('closes a fence only on a marker at least as long as the one that opened it', () => {
    const text = dedent`
      \`\`\`\`md
      \`\`\`ts
      const x = 1; // 補足(内側)
      \`\`\`
      \`\`\`\`

      以上(補足)。
    `;

    assert.deepStrictEqual(matchesOf(text, true), ['(補足)']);
  });

  test('reads a fence as prose when the file is not Markdown', () => {
    assert.deepStrictEqual(matchesOf('速度(実測)を測る。', false), ['(実測)']);
  });

  test('reports the line and the column of the opening parenthesis', () => {
    const violations = findHalfwidthParentheses('一行目。\nあ(い)う');

    assert.deepStrictEqual(violations, [
      { line: 2, column: 2, matched: '(い)', lineText: 'あ(い)う' },
    ]);
  });

  test('does not read a pair that wraps across two lines', () => {
    assert.deepStrictEqual(matchesOf('速度(実測\nの結果)を測る。'), []);
  });
});

describe('toFullwidthParentheses', () => {
  test('rewrites only what the check reports', () => {
    const text = dedent`
      速度(実測)を測る。

      \`\`\`ts
      const x = f(引数);
      \`\`\`

      詳細は [仕様](./spec.md#読み取り専用)を参照。
    `;

    assert.deepStrictEqual(
      toFullwidthParentheses(text, { markdown: true }),
      dedent`
        速度（実測）を測る。

        \`\`\`ts
        const x = f(引数);
        \`\`\`

        詳細は [仕様](./spec.md#読み取り専用)を参照。
      `,
    );
  });

  test('rewrites several pairs on one line', () => {
    assert.deepStrictEqual(
      toFullwidthParentheses('速度(実測)と精度(推定)。'),
      '速度（実測）と精度（推定）。',
    );
  });

  test('takes the space the halfwidth pair needed with it', () => {
    assert.deepStrictEqual(
      toFullwidthParentheses('リポジトリ全体のコマンド (`check-all` など)。'),
      'リポジトリ全体のコマンド（`check-all` など）。',
    );
  });

  test('takes the spaces written inside the pair as well', () => {
    assert.deepStrictEqual(
      toFullwidthParentheses(
        '空配列でなければならない ( `apply` が拒否する )。',
      ),
      '空配列でなければならない（`apply` が拒否する）。',
    );
  });

  test('keeps indentation, which is not the space the pair brought', () => {
    assert.deepStrictEqual(
      toFullwidthParentheses('    (テストで担保)。'),
      '    （テストで担保）。',
    );
  });

  test('keeps the space a following Latin word needs', () => {
    assert.deepStrictEqual(
      toFullwidthParentheses('速度(実測) tsc 由来。'),
      '速度（実測） tsc 由来。',
    );
  });

  test('drops the space between the pair and the Japanese after it', () => {
    assert.deepStrictEqual(
      toFullwidthParentheses('速度(実測) を測る。'),
      '速度（実測）を測る。',
    );
  });

  test('rewrites a nested pair from the inside out', () => {
    assert.deepStrictEqual(
      toFullwidthParentheses('補足(あ(い)う)。'),
      '補足（あ（い）う）。',
    );
  });

  test('leaves a file with nothing to rewrite byte for byte', () => {
    const text = '速度（実測）を測る。\nconst x = f(引数);\n';

    assert.deepStrictEqual(toFullwidthParentheses(text), text);
  });
});
