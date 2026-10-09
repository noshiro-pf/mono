import {
  DEFAULT_LIST_SETTINGS,
  parseListSettings,
  serializeListSettings,
  type ListSettings,
} from './list-settings.mjs';

const settings: ListSettings = {
  sort: [
    { key: 'dueDate', order: 'asc' },
    { key: 'priority', order: 'desc' },
  ],
  hideDone: true,
} as const;

describe(parseListSettings, () => {
  test('round-trips with serializeListSettings', () => {
    assert.deepStrictEqual(
      parseListSettings(serializeListSettings(settings)),
      settings,
    );
  });

  test('falls back to the defaults for nothing stored', () => {
    assert.deepStrictEqual(parseListSettings(null), DEFAULT_LIST_SETTINGS);
  });

  test('falls back to the defaults for what is not settings', () => {
    for (const stored of [
      '',
      'not json',
      '[]',
      '{"sort":[{"key":"colour","order":"asc"}],"hideDone":false}',
      '{"sort":[{"key":"title","order":"up"}],"hideDone":false}',
      '{"sort":[],"hideDone":"yes"}',
    ]) {
      assert.deepStrictEqual(parseListSettings(stored), DEFAULT_LIST_SETTINGS);
    }
  });

  test('keeps the first of a key that is repeated', () => {
    assert.deepStrictEqual(
      parseListSettings(
        '{"sort":[{"key":"title","order":"desc"},{"key":"title","order":"asc"}],"hideDone":false}',
      ),
      { sort: [{ key: 'title', order: 'desc' }], hideDone: false },
    );
  });
});
