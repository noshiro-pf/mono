import * as t from 'ts-fortress';

const Age = t.number(0, { min: 0, max: 120 });

const max: 120 = Age.constraints.max;

const step: undefined = Age.constraints.step;

assert.strictEqual(max, 120);

assert.isUndefined(step);
