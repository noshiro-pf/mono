import * as t from 'ts-fortress';

const Port = t.number(8080);

assert.isTrue(Port.cast(3000) === 3000); // 3000 is a valid number

try {
  Port.cast('invalid'); // Throws Error!
} catch (error) {
  assert.deepStrictEqual(
    error,
    new Error(
      'Error: expected <number> value but <string> type value "invalid" was passed.',
    ),
  );
}
