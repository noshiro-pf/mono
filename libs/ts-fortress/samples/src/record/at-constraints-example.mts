import * as t from 'ts-fortress';

const User = t.record({
  age: t.number(0, { int: true, min: 0, max: 120 }),
});

const max: 120 = t.at(User, 'age').constraints.max;

// equivalently, straight off the record type
const sameMax: 120 = User.shape.age.constraints.max;

assert.strictEqual(max, 120);

assert.strictEqual(sameMax, 120);
