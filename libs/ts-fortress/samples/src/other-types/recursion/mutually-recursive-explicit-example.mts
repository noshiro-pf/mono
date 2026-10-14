import * as t from 'ts-fortress';

type EvenNumber = Readonly<{ type: 'even'; next: OddNumber | null }>;

type OddNumber = Readonly<{ type: 'odd'; next: EvenNumber | null }>;

const OddNumber: t.Type<OddNumber> = t.recursion('OddNumber', () =>
  t.record({
    type: t.literal('odd'),
    next: t.union([t.nullType, EvenNumber]),
  }),
);

const EvenNumber: t.Type<EvenNumber> = t.recursion(
  'EvenNumber',
  () =>
    t.record({
      type: t.literal('even'),
      next: t.union([OddNumber, t.nullType]), // Order doesn't matter
    }),
  { defaultValue: { type: 'even' as const, next: null } }, // Explicit default
);
