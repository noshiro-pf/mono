import * as t from 'ts-fortress';

const Port = t.number(8080);

assert(Port.cast(3000) === 3000); // 3000 is a valid number

try {
  Port.cast('invalid'); // Throws Error!
} catch (error) {
  assert.deepStrictEqual(
    error,
    new Error('Expected <number>, got <string> type value "invalid".'),
  );
}
