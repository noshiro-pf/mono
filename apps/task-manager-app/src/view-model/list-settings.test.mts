import { expectType } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { type SortSpec } from '../domain/index.mjs';
import {
  DEFAULT_LIST_SETTINGS,
  listSettingsStorage,
  type ListSettings,
} from './list-settings.mjs';

const settings: ListSettings = {
  sort: [
    { key: 'dueDate', order: 'asc' },
    { key: 'priority', order: 'desc' },
  ],
  hideDone: true,
} as const;

describe(listSettingsStorage.parse, () => {
  test('round-trips with serialize', () => {
    assert.deepStrictEqual(
      listSettingsStorage.parse(listSettingsStorage.serialize(settings)),
      settings,
    );
  });

  test('falls back to the defaults for nothing stored', () => {
    assert.deepStrictEqual(
      listSettingsStorage.parse(null),
      DEFAULT_LIST_SETTINGS,
    );
  });

  test('falls back to the defaults for what is not settings at all', () => {
    for (const stored of ['', 'not json', '[]', '"settings"', 'null', '{}']) {
      assert.deepStrictEqual(
        listSettingsStorage.parse(stored),
        DEFAULT_LIST_SETTINGS,
      );
    }
  });

  test('keeps the first of a key that is repeated', () => {
    assert.deepStrictEqual(
      listSettingsStorage.parse(
        '{"sort":[{"key":"title","order":"desc"},{"key":"title","order":"asc"}],"hideDone":false}',
      ),
      { sort: [{ key: 'title', order: 'desc' }], hideDone: false },
    );
  });
});

describe('partly broken list settings', () => {
  test('keep the sort and default a hide-done that is not a boolean', () => {
    assert.deepStrictEqual(
      listSettingsStorage.parse(
        '{"sort":[{"key":"dueDate","order":"desc"}],"hideDone":"yes"}',
      ),
      { sort: [{ key: 'dueDate', order: 'desc' }], hideDone: false },
    );

    assert.deepStrictEqual(
      listSettingsStorage.parse('{"sort":[],"hideDone":"yes"}'),
      { sort: [], hideDone: false },
    );
  });

  test('keep hide-done and default a sort that is not a list', () => {
    for (const stored of [
      '{"sort":"status","hideDone":true}',
      '{"sort":null,"hideDone":true}',
      '{"hideDone":true}',
    ]) {
      assert.deepStrictEqual(listSettingsStorage.parse(stored), {
        sort: DEFAULT_LIST_SETTINGS.sort,
        hideDone: true,
      });
    }
  });

  test('repair a sort key field by field: an unknown order is ascending', () => {
    assert.deepStrictEqual(
      listSettingsStorage.parse(
        '{"sort":[{"key":"priority","order":"desc"},{"key":"title","order":"up"}],"hideDone":true}',
      ),
      {
        sort: [
          { key: 'priority', order: 'desc' },
          { key: 'title', order: 'asc' },
        ],
        hideDone: true,
      },
    );
  });

  test('repair an unknown key to the first key, title, kept once', () => {
    assert.deepStrictEqual(
      listSettingsStorage.parse(
        '{"sort":[{"key":"colour","order":"desc"},{"key":"title","order":"asc"}],"hideDone":false}',
      ),
      { sort: [{ key: 'title', order: 'desc' }], hideDone: false },
    );
  });

  test('drop the fields they do not know', () => {
    assert.deepStrictEqual(
      listSettingsStorage.parse(
        '{"sort":[{"key":"title","order":"asc","pinned":true}],"hideDone":true,"zoom":2}',
      ),
      { sort: [{ key: 'title', order: 'asc' }], hideDone: true },
    );
  });
});

describe('the stored list settings', () => {
  test('keep their key and their JSON, which earlier visits wrote', () => {
    assert.strictEqual(
      listSettingsStorage.key,
      'task-manager-app:list-settings',
    );

    assert.strictEqual(
      listSettingsStorage.serialize(settings),
      '{"sort":[{"key":"dueDate","order":"asc"},{"key":"priority","order":"desc"}],"hideDone":true}',
    );
  });

  test('default to status, priority and due date, done tasks shown', () => {
    expectType<
      ListSettings,
      DeepReadonly<{ sort: SortSpec[]; hideDone: boolean }>
    >('=');

    assert.deepStrictEqual(DEFAULT_LIST_SETTINGS, {
      sort: [
        { key: 'status', order: 'asc' },
        { key: 'priority', order: 'asc' },
        { key: 'dueDate', order: 'asc' },
      ],
      hideDone: false,
    });
  });
});
