import * as t from 'ts-fortress';

type EvenNumber = Readonly<{ type: 'even'; next: OddNumber | null }>;

type OddNumber = Readonly<{ type: 'odd'; next: EvenNumber | null }>;

// IMPORTANT: For mutual recursion, place terminal types (like nullType)
// first in unions, or provide explicit defaultValue
const EvenNumber: t.Type<EvenNumber> = t.recursion('EvenNumber', () =>
  t.record({
    type: t.literal('even'),
    next: t.union([t.nullType, OddNumber]), // nullType first!
  }),
);

const OddNumber: t.Type<OddNumber> = t.recursion('OddNumber', () =>
  t.record({
    type: t.literal('odd'),
    next: t.union([t.nullType, EvenNumber]), // nullType first!
  }),
);
