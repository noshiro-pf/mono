import { Result } from 'ts-data-forge';
import { checkClaudeMdSize, countLines } from './check-claude-md-size.mjs';

describe('countLines', () => {
  test('counts as wc -l does, with or without a trailing newline', () => {
    assert.strictEqual(countLines(''), 0);

    assert.strictEqual(countLines('a'), 1);

    assert.strictEqual(countLines('a\n'), 1);

    assert.strictEqual(countLines('a\n\nb\n'), 3);
  });
});

describe('checkClaudeMdSize', () => {
  test('passes a file at its budget', () => {
    const result = checkClaudeMdSize('a\nb\nc\n', 3);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result, Result.ok(3));
  });

  test('fails a file one line over, and says by how much and what to do', () => {
    const result = checkClaudeMdSize('a\nb\nc\nd\n', 3);

    assert.isTrue(Result.isErr(result));

    if (Result.isErr(result)) {
      assert.include(
        result.value,
        'CLAUDE.md is 4 lines, 1 over its budget of 3.',
      );

      assert.include(result.value, 'LINE_BUDGET');

      assert.include(result.value, '"What belongs in this file"');
    }
  });
});
