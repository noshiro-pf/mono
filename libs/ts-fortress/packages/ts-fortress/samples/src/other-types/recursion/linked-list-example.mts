import * as t from 'ts-fortress';

type LinkedList = Readonly<{
  value: number;
  next: LinkedList | null;
}>;

const LinkedListNumber: t.Type<LinkedList> = t.recursion('LinkedList', () =>
  t.record({
    value: t.number(),
    next: t.union([t.nullType, LinkedListNumber]),
  }),
);
