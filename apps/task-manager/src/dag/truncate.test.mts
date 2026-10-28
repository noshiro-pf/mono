// cspell:ignore ationaliza tion กำกำกำ nhật người dùng jklmnop

import { textWidthUnits, truncateToUnits, wrapToUnits } from './truncate.mjs';

describe(textWidthUnits, () => {
  test('counts a wide character as two units and others as one', () => {
    assert.strictEqual(textWidthUnits('abc'), 3);

    assert.strictEqual(textWidthUnits('設計'), 4);

    assert.strictEqual(textWidthUnits('UI設計'), 6);

    assert.strictEqual(textWidthUnits('ｶﾀｶﾅ'), 4);
  });
});

describe(truncateToUnits, () => {
  test('leaves text that fits alone', () => {
    assert.strictEqual(truncateToUnits('設計', 4), '設計');
  });

  test('cuts text that does not fit, ending it with an ellipsis', () => {
    assert.strictEqual(truncateToUnits('abcdefgh', 5), 'abcd…');

    assert.strictEqual(truncateToUnits('設計と実装', 6), '設計…');
  });

  test('does not split a surrogate pair', () => {
    assert.strictEqual(truncateToUnits('😀😀😀', 5), '😀😀…');
  });

  test('keeps a half-width sound mark with its kana, as wide as one more kana', () => {
    assert.strictEqual(truncateToUnits('ﾃｽﾄｼﾞｮﾌﾞ', 6), 'ﾃｽﾄｼﾞ…');

    assert.strictEqual(textWidthUnits('ｼﾞｮﾌﾞ'), 5);
  });

  test('does not split an emoji sequence', () => {
    assert.strictEqual(truncateToUnits('👨‍👩‍👧👨‍👩‍👧👨‍👩‍👧', 5), '👨‍👩‍👧👨‍👩‍👧…');
  });
});

describe(wrapToUnits, () => {
  test('leaves text that fits on one line alone', () => {
    assert.deepStrictEqual(wrapToUnits('設計', 4, 3), ['設計']);
  });

  test('breaks between characters where there is no space', () => {
    assert.deepStrictEqual(wrapToUnits('設計と実装と試験', 6, 3), [
      '設計と',
      '実装と',
      '試験',
    ]);
  });

  test('breaks at the last space of a line, and drops it', () => {
    assert.deepStrictEqual(wrapToUnits('write the tests first', 10, 3), [
      'write the',
      'tests',
      'first',
    ]);
  });

  test('breaks a word longer than a line between its characters', () => {
    assert.deepStrictEqual(wrapToUnits('understanding', 5, 3), [
      'under',
      'stand',
      'ing',
    ]);
  });

  test('cuts the last line with an ellipsis when the text does not fit', () => {
    assert.deepStrictEqual(wrapToUnits('設計と実装と試験と公開', 6, 2), [
      '設計と',
      '実装…',
    ]);
  });

  test('does not split a surrogate pair', () => {
    assert.deepStrictEqual(wrapToUnits('😀😀😀', 5, 2), ['😀😀', '😀']);
  });

  test('keeps a word of narrow characters whole beside Japanese', () => {
    assert.deepStrictEqual(wrapToUnits('API を実装して test を書く', 10, 3), [
      'API を実装',
      'して test',
      'を書く',
    ]);
  });

  test('drops the spaces at either end', () => {
    assert.deepStrictEqual(wrapToUnits('  abc   ', 3, 3), ['abc']);

    assert.deepStrictEqual(wrapToUnits('   long word', 4, 3), ['long', 'word']);
  });

  test('does not break inside an emoji sequence', () => {
    assert.deepStrictEqual(wrapToUnits('✔️✔️✔️', 4, 3), ['✔️✔️', '✔️']);
  });

  test('gives the first line the width asked for it', () => {
    assert.deepStrictEqual(wrapToUnits('設計と実装と試験', 6, 3, 4), [
      '設計',
      'と実装',
      'と試験',
    ]);
  });

  test('breaks at an ideographic space, and drops it', () => {
    assert.deepStrictEqual(wrapToUnits('設計書\u{3000}レビュー', 6, 3), [
      '設計書',
      'レビュ',
      'ー',
    ]);
  });

  test('keeps the apostrophe of a word inside it', () => {
    assert.deepStrictEqual(wrapToUnits('I don’t know', 6, 3), [
      'I',
      'don’t',
      'know',
    ]);
  });

  test('starts no line with a closing bracket or punctuation', () => {
    assert.deepStrictEqual(wrapToUnits('仕様（第二版）', 12, 3), [
      '仕様（第二',
      '版）',
    ]);

    assert.deepStrictEqual(wrapToUnits('設計と実装。試験', 10, 3), [
      '設計と実',
      '装。試験',
    ]);
  });

  test('keeps a word whole before a closing character, and two closing characters with what they close', () => {
    assert.deepStrictEqual(wrapToUnits('設計API。', 7, 3), ['設計', 'API。']);

    assert.deepStrictEqual(wrapToUnits('あいう。」えお', 8, 3), [
      'あい',
      'う。」え',
      'お',
    ]);

    // A narrow `)` closes here, so it is held out of the call's own
    // parentheses, which would otherwise read as a halfwidth pair around
    // Japanese.
    const narrowClose = '仕様第二版)です';

    assert.deepStrictEqual(wrapToUnits(narrowClose, 10, 3), [
      '仕様第二',
      '版)です',
    ]);
  });

  test('ends no line with an opening bracket', () => {
    assert.deepStrictEqual(wrapToUnits('設計「仕様」を', 6, 3), [
      '設計',
      '「仕',
      '様」を',
    ]);
  });

  test('breaks a word longer than a line where the line is full, after a short one', () => {
    assert.deepStrictEqual(wrapToUnits('Fix internationalization', 10, 3), [
      'Fix intern',
      'ationaliza',
      'tion',
    ]);
  });

  test('cuts the last line without a space before the ellipsis', () => {
    assert.deepStrictEqual(wrapToUnits('write the tests no more', 10, 2), [
      'write the',
      'tests no…',
    ]);
  });

  test('breaks half-width katakana between characters, as Japanese', () => {
    assert.deepStrictEqual(wrapToUnits('仕様書ﾃｽﾄｹｰｽｦｶｸ', 10, 3), [
      '仕様書ﾃｽﾄｹ',
      'ｰｽｦｶｸ',
    ]);
  });

  test('ends no line with a full-width square bracket, and starts none with its closing one', () => {
    assert.deepStrictEqual(wrapToUnits('設計書［重要］を確認', 8, 3), [
      '設計書',
      '［重要］',
      'を確認',
    ]);
  });

  test('keeps a Thai vowel sign with its consonant', () => {
    assert.deepStrictEqual(wrapToUnits('กำกำกำ', 1, 3), ['กำ', 'กำ', 'กำ']);
  });

  test('breaks a line that is full before a closing character, not after it', () => {
    assert.deepStrictEqual(wrapToUnits('abcdefghij.', 10, 3), [
      'abcdefghi',
      'j.',
    ]);
  });

  test('keeps a word of accented Latin letters whole', () => {
    assert.deepStrictEqual(wrapToUnits('Cập nhật người dùng', 8, 3), [
      'Cập nhật',
      'người',
      'dùng',
    ]);
  });

  test('keeps the bracket and punctuation rules where a full line is broken', () => {
    assert.deepStrictEqual(wrapToUnits('abcdefghi(jklmnop', 10, 3), [
      'abcdefghi',
      '(jklmnop',
    ]);

    assert.deepStrictEqual(wrapToUnits('abcdefghij )', 10, 3), [
      'abcdefghi',
      'j )',
    ]);

    assert.deepStrictEqual(wrapToUnits('abcdefghi.)', 10, 3), [
      'abcdefgh',
      'i.)',
    ]);
  });

  test('keeps a closing character with the word before it across a space, and an opening one with the word after it', () => {
    assert.deepStrictEqual(wrapToUnits('完了しました ！', 12, 3), [
      '完了しまし',
      'た ！',
    ]);

    assert.deepStrictEqual(wrapToUnits('abc ( def', 5, 3), ['abc', '( def']);
  });

  test('measures full-width Latin letters as wide', () => {
    assert.strictEqual(textWidthUnits('ＡＰＩ設計'), 10);
  });

  test('does not break beside a no-break space after Japanese', () => {
    assert.deepStrictEqual(wrapToUnits('設計設計\u{A0}km', 8, 3), [
      '設計設',
      '計\u{A0}km',
    ]);
  });

  test('does not break at a no-break space', () => {
    assert.deepStrictEqual(wrapToUnits('to 10\u{A0}km', 5, 3), [
      'to',
      '10\u{A0}km',
    ]);
  });

  test('measures a keycap emoji as wide', () => {
    assert.deepStrictEqual(wrapToUnits('1️⃣2️⃣3️⃣', 4, 3), ['1️⃣2️⃣', '3️⃣']);
  });

  test('draws a run of spaces as one, as SVG does', () => {
    assert.deepStrictEqual(wrapToUnits(`設計${' '.repeat(50_000)})b`, 32, 3), [
      '設計 )b',
    ]);
  });

  test('gives one empty line for an empty title', () => {
    assert.deepStrictEqual(wrapToUnits('', 4, 3), ['']);
  });
});
