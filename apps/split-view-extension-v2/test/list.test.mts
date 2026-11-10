import {
  activateEntry,
  addEntry,
  applyListOp,
  emptyList,
  entryAt,
  listFromRecords,
  mergeImported,
  moveEntry,
  nextName,
  positionOf,
  removeEntry,
  renameEntry,
  resolveShown,
  setEntryPinned,
  uniqueName,
  type ListEntry,
  type SplitViewList,
} from '../src/index.mjs';

const entry = (id: string, name: string = id): ListEntry =>
  ({
    id,
    name,
    createdAt: 0,
    pinned: false,
  }) as const;

const abc: SplitViewList = {
  version: 1,
  entries: [entry('a'), entry('b'), entry('c')],
  activeId: 'b',
} as const;

describe('list edits', () => {
  test('positions are 1-based', () => {
    expect(positionOf(abc, 'c')).toBe(3);

    expect(entryAt(abc, 1)?.id).toBe('a');

    expect(positionOf(abc, 'z')).toBeUndefined();
  });

  test('add ignores a duplicate id', () => {
    expect(addEntry(abc, entry('a', 'other'))).toBe(abc);
  });

  test('remove moves activeId to the entry that takes its place', () => {
    expect(removeEntry(abc, 'b').activeId).toBe('c');

    expect(removeEntry({ ...abc, activeId: 'c' }, 'c').activeId).toBe('b');

    expect(
      removeEntry({ ...emptyList, entries: [entry('a')], activeId: 'a' }, 'a')
        .activeId,
    ).toBeUndefined();
  });

  test('rename trims and refuses blank', () => {
    expect(renameEntry(abc, 'a', '  New ').entries[0]?.name).toBe('New');

    expect(renameEntry(abc, 'a', ' '.repeat(3))).toBe(abc);
  });

  test('move clamps at both ends', () => {
    expect(moveEntry(abc, 'a', 1).entries.map(({ id }) => id)).toStrictEqual([
      'b',
      'a',
      'c',
    ]);

    expect(moveEntry(abc, 'c', -9).entries.map(({ id }) => id)).toStrictEqual([
      'c',
      'a',
      'b',
    ]);

    expect(moveEntry(abc, 'c', 1)).toBe(abc);
  });

  test('activate and pin', () => {
    expect(activateEntry(abc, 'c').activeId).toBe('c');

    expect(activateEntry(abc, 'z')).toBe(abc);

    expect(setEntryPinned(abc, 'a', true).entries[0]?.pinned).toBe(true);

    expect(setEntryPinned(abc, 'a', false)).toBe(abc);
  });
});

describe('names', () => {
  test('nextName takes the smallest free number', () => {
    const list: SplitViewList = {
      ...emptyList,
      entries: [entry('a', 'split-view-1'), entry('b', 'split-view-3')],
    } as const;

    expect(nextName(list)).toBe('split-view-2');

    expect(nextName(emptyList)).toBe('split-view-1');
  });

  test('uniqueName keeps a free name', () => {
    expect(uniqueName(abc, 'Work')).toBe('Work');

    expect(uniqueName(abc, 'a')).toBe('split-view-1');
  });
});

describe('list from records', () => {
  test('default first, then newest first', () => {
    expect(
      listFromRecords([
        { id: 'old', savedAt: 1 },
        { id: 'default', savedAt: 0 },
        { id: 'new', savedAt: 9 },
      ]),
    ).toStrictEqual({
      version: 1,
      entries: [
        { id: 'default', name: 'split-view-1', createdAt: 0, pinned: false },
        { id: 'new', name: 'split-view-2', createdAt: 9, pinned: false },
        { id: 'old', name: 'split-view-3', createdAt: 1, pinned: false },
      ],
      activeId: 'default',
    });
  });
});

describe('resolveShown', () => {
  test('an unknown id is added under the given name', () => {
    const { list, id } = resolveShown(
      abc,
      { id: 'x', name: 'From link' },
      5,
      true,
    );

    expect(id).toBe('x');

    expect(list.entries.at(-1)).toStrictEqual({
      id: 'x',
      name: 'From link',
      createdAt: 5,
      pinned: false,
    });

    expect(list.activeId).toBe('x');
  });

  test('no id shows the active one; a hidden tab does not activate', () => {
    expect(
      resolveShown(abc, { id: undefined, name: undefined }, 0, true).id,
    ).toBe('b');

    expect(resolveShown(abc, { id: 'c', name: undefined }, 0, false).list).toBe(
      abc,
    );
  });

  test('an empty list gets default', () => {
    const { list, id } = resolveShown(
      emptyList,
      { id: undefined, name: undefined },
      3,
      true,
    );

    expect(id).toBe('default');

    expect(list.entries).toStrictEqual([
      { id: 'default', name: 'split-view-1', createdAt: 3, pinned: false },
    ]);
  });
});

describe('mergeImported', () => {
  test('replaces by id, appends the rest, and is idempotent', () => {
    const imported = [
      { id: 'a', name: 'Renamed' },
      { id: 'n', name: 'b' },
    ] as const;

    const once = mergeImported(abc, imported, 7);

    expect(once.added).toBe(1);

    expect(once.replaced).toBe(1);

    expect(once.list.entries.map(({ id, name }) => [id, name])).toStrictEqual([
      ['a', 'Renamed'],
      ['b', 'b'],
      ['c', 'c'],
      ['n', 'split-view-1'],
    ]);

    expect(mergeImported(once.list, imported, 8).list).toStrictEqual(once.list);
  });

  test('a name another entry has becomes the next free one', () => {
    const { list } = mergeImported(abc, [{ id: 'a', name: 'b' }], 1);

    expect(entryAt(list, 1)?.name).toBe('split-view-1');
  });

  test('an id the backup repeats counts once', () => {
    const { added, replaced } = mergeImported(
      abc,
      [
        { id: 'x', name: 'X' },
        { id: 'x', name: 'Y' },
      ],
      1,
    );

    expect(added).toBe(1);

    expect(replaced).toBe(0);
  });
});

describe('list operations, as the service worker applies them', () => {
  test('show resolves the shown split view and answers its id', () => {
    const { list, answer } = applyListOp(abc, {
      kind: 'show',
      id: 'd',
      name: 'Named',
      now: 5,
      activate: true,
    });

    expect(list.entries.map(({ id }) => id)).toStrictEqual([
      'a',
      'b',
      'c',
      'd',
    ]);

    expect(list.activeId).toBe('d');

    expect(answer).toStrictEqual({ kind: 'shown', id: 'd' });
  });

  test('create appends under the next free name', () => {
    const { list } = applyListOp(abc, { kind: 'create', id: 'n', now: 7 });

    expect(entryAt(list, 4)).toStrictEqual({
      id: 'n',
      name: 'split-view-1',
      createdAt: 7,
      pinned: false,
    });
  });

  test('removing the last leaves a fresh one, active', () => {
    const one: SplitViewList = {
      version: 1,
      entries: [entry('a')],
      activeId: 'a',
    } as const;

    const { list } = applyListOp(one, {
      kind: 'remove',
      id: 'a',
      freshId: 'f',
      now: 3,
    });

    expect(list.entries.map(({ id }) => id)).toStrictEqual(['f']);

    expect(list.activeId).toBe('f');
  });

  test('removing one of several keeps the rest', () => {
    const { list } = applyListOp(abc, {
      kind: 'remove',
      id: 'b',
      freshId: 'f',
      now: 3,
    });

    expect(list.entries.map(({ id }) => id)).toStrictEqual(['a', 'c']);
  });

  test('rename, move, activate and set-pinned edit one entry', () => {
    const renamed = applyListOp(abc, { kind: 'rename', id: 'a', name: 'A' });

    expect(entryAt(renamed.list, 1)?.name).toBe('A');

    expect(renamed.answer).toStrictEqual({ kind: 'none' });

    expect(
      applyListOp(abc, { kind: 'move', id: 'a', offset: 2 }).list.entries.map(
        ({ id }) => id,
      ),
    ).toStrictEqual(['b', 'c', 'a']);

    expect(applyListOp(abc, { kind: 'activate', id: 'c' }).list.activeId).toBe(
      'c',
    );

    expect(
      entryAt(
        applyListOp(abc, { kind: 'set-pinned', id: 'c', pinned: true }).list,
        3,
      )?.pinned,
    ).toBe(true);
  });

  test('import merges and answers the counts', () => {
    const { list, answer } = applyListOp(abc, {
      kind: 'import',
      entries: [
        { id: 'a', name: 'Kept' },
        { id: 'z', name: 'New' },
      ],
      now: 1,
    });

    expect(list.entries.map(({ name }) => name)).toStrictEqual([
      'Kept',
      'b',
      'c',
      'New',
    ]);

    expect(answer).toStrictEqual({ kind: 'imported', added: 1, replaced: 1 });
  });

  test('an operation that changes nothing returns the same list', () => {
    expect(applyListOp(abc, { kind: 'activate', id: 'b' }).list).toBe(abc);
  });
});
