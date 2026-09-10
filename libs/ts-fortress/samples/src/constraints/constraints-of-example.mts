import * as t from 'ts-fortress';

const Age = t.number(0, { int: true, min: 0, max: 120 });

type AgeConstraints = t.ConstraintsOf<typeof Age>;

// { readonly int: true; readonly min: 0; readonly max: 120; ... }
const ageConstraints: AgeConstraints = Age.constraints;

assert.strictEqual(ageConstraints.max, 120);
