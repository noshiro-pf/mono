import * as t from 'ts-fortress';

const Name = t.string('a', { minLength: 1, maxLength: 32 });

const maxLength: 32 = Name.constraints.maxLength;

const regex: undefined = Name.constraints.regex;

assert.strictEqual(maxLength, 32);

assert.isUndefined(regex);
