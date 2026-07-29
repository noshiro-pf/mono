import * as t from 'ts-fortress';

type EvenNumber = Readonly<{ type: 'even'; next?: OddNumber }>;

type OddNumber = Readonly<{ type: 'odd'; next?: EvenNumber }>;

// When using optional fields in mutually recursive types,
// use forceUndefinedDefault to avoid infinite loops when accessing defaultValue
const EvenNumber: t.Type<EvenNumber> = t.recursion('EvenNumber', () =>
  t.record({
    type: t.literal('even'),
    next: t.optional(OddNumber, { forceUndefinedDefault: true }),
  }),
);

const OddNumber: t.Type<OddNumber> = t.recursion('OddNumber', () =>
  t.record({
    type: t.literal('odd'),
    next: t.optional(EvenNumber, { forceUndefinedDefault: true }),
  }),
);
