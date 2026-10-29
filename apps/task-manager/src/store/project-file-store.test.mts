import { createState } from 'synstate';
import type { FixedLengthTuple } from 'ts-type-forge';
import { asTaskId, createTask, type DomainState } from '../domain/index.mjs';
import { projectFileText, type ProjectSnapshot } from '../repository/index.mjs';
import type { ProjectLoad } from './data-store.mjs';
import {
  createProjectFileStore,
  type ProjectImport,
} from './project-file-store.mjs';

const current: DomainState = {
  tasks: [createTask({ id: asTaskId('old'), title: '前', now: 0 })],
  milestones: [],
} as const;

const incoming: ProjectSnapshot = {
  state: {
    tasks: [
      createTask({ id: asTaskId('n1'), title: '新1', now: 0 }),
      createTask({ id: asTaskId('n2'), title: '新2', now: 0 }),
    ],
    milestones: [],
  },
  groups: [],
  dagLayout: undefined,
} as const;

// 2026-10-29 01:02:03 in UTC.
const NOW = 1_793_235_723_000;

const setup = (
  replace: () => Promise<void> = () => Promise.resolve(),
): Readonly<{
  store: ReturnType<typeof createProjectFileStore>;
  setLoad: (load: ProjectLoad) => void;
  failDownload: () => void;
  downloads: readonly FixedLengthTuple<2, string>[];
  replaced: readonly FixedLengthTuple<2, ProjectSnapshot>[];
  errors: readonly string[];
  importState: () => ProjectImport;
}> => {
  const [state] = createState(current);

  const [groups] = createState<ProjectSnapshot['groups']>([]);

  const [dagLayout] = createState<ProjectSnapshot['dagLayout']>(undefined);

  const [projectLoad, setLoad] = createState<ProjectLoad>('loaded');

  const mut_failing = { download: false };

  const mut_downloads: FixedLengthTuple<2, string>[] = [];

  const mut_replaced: FixedLengthTuple<2, ProjectSnapshot>[] = [];

  const mut_notices: string[] = [];

  const store = createProjectFileStore({
    state,
    groups,
    dagLayout,
    load: projectLoad,
    now: () => NOW,
    timeZone: 'UTC',
    download: (fileName, text) => {
      if (mut_failing.download) {
        throw new Error('quota');
      }

      mut_downloads.push([fileName, text]);
    },
    replaceProject: (next, previous) => {
      mut_replaced.push([next, previous]);

      return replace();
    },
    reportError: (message) => {
      mut_notices.push(message);
    },
  });

  return {
    store,
    setLoad,
    failDownload: () => {
      mut_failing.download = true;
    },
    downloads: mut_downloads,
    replaced: mut_replaced,
    errors: mut_notices,
    importState: () => store.importState.getSnapshot().value,
  };
};

const currentSnapshot: ProjectSnapshot = {
  state: current,
  groups: [],
  dagLayout: undefined,
} as const;

const flush = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe(createProjectFileStore, () => {
  test('exports the project as it is, named by when', () => {
    const { store, downloads } = setup();

    store.exportProject();

    assert.deepStrictEqual(downloads, [
      [
        'task-manager-2026-10-29-010203.json',
        projectFileText(currentSnapshot, NOW),
      ],
    ]);
  });

  test('exports nothing until the project has loaded, and says so', () => {
    const { store, setLoad, downloads, errors } = setup();

    setLoad('loading');

    store.exportProject();

    assert.deepStrictEqual(downloads, []);

    assert.deepStrictEqual(errors, [
      'まだ読み込み中です。少し待ってからもう一度どうぞ。',
    ]);
  });

  test('says so in the dialog when the project is still loading', () => {
    const { store, setLoad, downloads, replaced, importState } = setup();

    store.openFile('p.json', projectFileText(incoming, NOW));

    setLoad('loading');

    store.confirm();

    assert.deepStrictEqual(downloads, []);

    assert.deepStrictEqual(replaced, []);

    const state = importState();

    assert.isTrue(
      state.type === 'confirming' &&
        state.problem === 'まだ読み込み中です。少し待ってからもう一度どうぞ。',
    );
  });

  test('says so in the dialog when the project failed to load', () => {
    const { store, setLoad, downloads, replaced, importState } = setup();

    store.openFile('p.json', projectFileText(incoming, NOW));

    setLoad('failed');

    store.confirm();

    assert.deepStrictEqual(downloads, []);

    assert.deepStrictEqual(replaced, []);

    const state = importState();

    assert.isTrue(
      state.type === 'confirming' &&
        state.problem?.startsWith('プロジェクトの一部を読み込めなかった') ===
          true,
    );
  });

  test('asks before replacing the project with a file', () => {
    const { store, replaced, importState } = setup();

    store.openFile('p.json', projectFileText(incoming, NOW));

    assert.deepStrictEqual(importState(), {
      type: 'confirming',
      fileName: 'p.json',
      snapshot: incoming,
      problem: undefined,
    });

    assert.deepStrictEqual(replaced, []);
  });

  test('shows what is wrong with a file it cannot read', () => {
    const { store, importState } = setup();

    store.openFile('p.json', '{');

    assert.deepStrictEqual(importState(), {
      type: 'refused',
      fileName: 'p.json',
      errors: ['JSON として読めません。'],
    });

    store.close();

    assert.deepStrictEqual(importState(), { type: 'idle' });
  });

  test('exports a backup, then replaces the project', async () => {
    const { store, downloads, replaced, errors, importState } = setup();

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.confirm();

    assert.deepStrictEqual(importState(), { type: 'importing' });

    assert.deepStrictEqual(downloads, [
      [
        'task-manager-backup-2026-10-29-010203.json',
        projectFileText(currentSnapshot, NOW),
      ],
    ]);

    assert.deepStrictEqual(replaced, [[incoming, currentSnapshot]]);

    await flush();

    assert.deepStrictEqual(importState(), { type: 'idle' });

    assert.deepStrictEqual(errors, []);
  });

  test('says how to restore when replacing fails', async () => {
    const { store, errors, importState } = setup(() =>
      Promise.reject(new Error('quota')),
    );

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.confirm();

    await flush();

    assert.deepStrictEqual(importState(), { type: 'idle' });

    assert.deepStrictEqual(errors, [
      '「p.json」の読み込みの途中で失敗しました。一部だけ書き換わっているかもしれません。直前に書き出した「task-manager-backup-2026-10-29-010203.json」を読み込めば元に戻せます。',
    ]);
  });

  test('can be closed while it writes, which go on', async () => {
    const pending = Promise.withResolvers<undefined>();

    const { store, replaced, importState } = setup(async () => {
      await pending.promise;
    });

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.confirm();

    store.close();

    assert.deepStrictEqual(importState(), { type: 'idle' });

    // Another file asked about meanwhile stays asked about.
    store.openFile('q.json', projectFileText(incoming, NOW));

    pending.resolve(undefined);

    await flush();

    assert.strictEqual(importState().type, 'confirming');

    assert.strictEqual(replaced.length, 1);
  });

  test('is importing until the writes end, closed or not', async () => {
    const pending = Promise.withResolvers<undefined>();

    const { store } = setup(async () => {
      await pending.promise;
    });

    assert.isFalse(store.importing.getSnapshot().value);

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.confirm();

    store.close();

    assert.isTrue(store.importing.getSnapshot().value);

    pending.resolve(undefined);

    await flush();

    assert.isFalse(store.importing.getSnapshot().value);
  });

  test('replaces nothing when the backup cannot be made', () => {
    const { store, failDownload, replaced, errors, importState } = setup();

    store.openFile('p.json', projectFileText(incoming, NOW));

    failDownload();

    store.confirm();

    assert.deepStrictEqual(replaced, []);

    assert.deepStrictEqual(errors, []);

    assert.deepStrictEqual(importState(), {
      type: 'confirming',
      fileName: 'p.json',
      snapshot: incoming,
      problem: 'ファイルを書き出せませんでした。',
    });
  });

  test('keeps what it asked while the project goes on loading', () => {
    const { store, setLoad, importState } = setup();

    setLoad('loading');

    const stop = store.start();

    store.openFile('p.json', projectFileText(incoming, NOW));

    setLoad('loading');

    setLoad('loaded');

    assert.strictEqual(importState().type, 'confirming');

    stop();
  });

  test('exports nothing while an import is still writing', () => {
    const pending = Promise.withResolvers<undefined>();

    const { store, downloads, errors } = setup(async () => {
      await pending.promise;
    });

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.confirm();

    store.exportProject();

    // The backup alone.
    assert.strictEqual(downloads.length, 1);

    assert.deepStrictEqual(errors, [
      '読み込みの書き込みがまだ終わっていません。終わってから書き出してください。',
    ]);
  });

  test('starts no import while one is still writing', () => {
    const pending = Promise.withResolvers<undefined>();

    const { store, replaced, importState } = setup(async () => {
      await pending.promise;
    });

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.confirm();

    store.close();

    store.openFile('q.json', projectFileText(incoming, NOW));

    store.confirm();

    assert.strictEqual(replaced.length, 1);

    const state = importState();

    assert.isTrue(
      state.type === 'confirming' &&
        state.problem?.startsWith(
          '前の読み込みの書き込みがまだ終わっていません',
        ) === true,
    );
  });

  test('drops what it asked when the project starts loading over', () => {
    const { store, setLoad, importState } = setup();

    const stop = store.start();

    store.openFile('p.json', projectFileText(incoming, NOW));

    // Still the same project: nothing is dropped.
    setLoad('loaded');

    assert.strictEqual(importState().type, 'confirming');

    setLoad('loading');

    assert.deepStrictEqual(importState(), { type: 'idle' });

    stop();
  });

  test('is no longer importing once the project starts loading over', () => {
    const { store, setLoad } = setup(
      () =>
        new Promise(() => {
          // Never settles, as writes of a session that ended may not.
        }),
    );

    const stop = store.start();

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.confirm();

    assert.isTrue(store.importing.getSnapshot().value);

    setLoad('loading');

    assert.isFalse(store.importing.getSnapshot().value);

    stop();
  });

  test('closing replaces nothing', () => {
    const { store, downloads, replaced, importState } = setup();

    store.openFile('p.json', projectFileText(incoming, NOW));

    store.close();

    store.confirm();

    assert.deepStrictEqual(importState(), { type: 'idle' });

    assert.deepStrictEqual(downloads, []);

    assert.deepStrictEqual(replaced, []);
  });
});
