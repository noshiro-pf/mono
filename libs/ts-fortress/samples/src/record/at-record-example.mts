import * as t from 'ts-fortress';

const ymd = t.record({
  year: t.number(1900),
  month: t.number(1),
  date: t.number(1),
});

const year = t.at(ymd, 'year'); // Type<number>

assert.isTrue(year.is(2000));
