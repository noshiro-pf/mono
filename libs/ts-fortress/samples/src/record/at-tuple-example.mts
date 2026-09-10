import * as t from 'ts-fortress';

const tup = t.tuple([t.number(), t.string(), t.boolean()]);

const second = t.at(tup, 1); // Type<string>

assert.isTrue(second.is('hello'));
