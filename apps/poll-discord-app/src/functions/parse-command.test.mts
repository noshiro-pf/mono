import { Result } from 'ts-data-forge';
import { gpParseGroupingCommandArgument } from './parse-command.mjs';
import { removeCommandPrefix } from './remove-command-prefix.mjs';

describe(gpParseGroupingCommandArgument, () => {
  test('reads the count before the names, as in the README example', () => {
    const message = [
      '/gp 2',
      '"Alice"',
      '"Bob"',
      '"Carol"',
      '"Dave"',
      '"Ellen"',
      '"Frank"',
    ].join('\n');

    const result = gpParseGroupingCommandArgument(
      removeCommandPrefix(message, '/gp'),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [
      2,
      ['Alice', 'Bob', 'Carol', 'Dave', 'Ellen', 'Frank'],
    ]);
  });

  test('reads the count when the names follow on the same line', () => {
    const result = gpParseGroupingCommandArgument('3 "Alice" "Bob" "Carol"');

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [3, ['Alice', 'Bob', 'Carol']]);
  });

  test('turns tabs and newlines inside a name into spaces', () => {
    const result = gpParseGroupingCommandArgument('2 "Alice\tA" "Bob\nB"');

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [2, ['Alice A', 'Bob B']]);
  });

  test.each([
    ['no count', '"Alice" "Bob"'],
    ['an empty argument', ''],
    ['a count below 2', '1 "Alice" "Bob"'],
    ['a count above 27', '28 "Alice" "Bob"'],
    ['a hexadecimal count', '0x2 "Alice" "Bob"'],
    ['a fractional count', '2.5 "Alice" "Bob"'],
    ['a count glued to a name', '2"Alice" "Bob"'],
  ])('rejects %s', (_, commandArguments) => {
    assert.isTrue(
      Result.isErr(gpParseGroupingCommandArgument(commandArguments)),
    );
  });
});
