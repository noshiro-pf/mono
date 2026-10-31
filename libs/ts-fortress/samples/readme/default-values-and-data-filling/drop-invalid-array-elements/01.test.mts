import * as t from 'ts-fortress';

const SortSpec = t.record({
  key: t.enumType(['title', 'priority']),
  order: t.enumType(['asc', 'desc']),
});

const saved = [
  { key: 'colour', order: 'desc' }, // a key that no longer exists
  { key: 'priority', order: 'asc' },
] as const;

// By default, an invalid element is replaced with its filled value, so the
// unknown key turns into the default key 'title'
assert.deepStrictEqual(t.array(SortSpec).fill(saved), [
  { key: 'title', order: 'desc' },
  { key: 'priority', order: 'asc' },
]);

// With onInvalidElement: 'drop', it is removed instead
assert.deepStrictEqual(
  t.array(SortSpec, { onInvalidElement: 'drop' }).fill(saved),
  [{ key: 'priority', order: 'asc' }],
);
