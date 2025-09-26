import * as t from 'ts-fortress';

const Percentage = t.number(100, {
  min: 0,
  max: 100,
  step: 5,
  nonNegative: true,
});

Percentage.is(75); // true
Percentage.is(72); // false (fails `step`)
Percentage.is(-5); // false (fails `min`/`nonNegative`)
