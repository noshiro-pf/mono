import { createState } from 'synstate';
import { defaultSimulationInput } from '../domain/index.mjs';
import {
  createMemoryRepository,
  type Plan,
  type PlanRepository,
} from '../repository/index.mjs';
import { createPlanStore, nextPlanName } from './plan-store.mjs';
import type { Session } from './session-store.mjs';

const plan = (id: string, createdAt: number): Plan =>
  ({
    id,
    name: `plan ${id}`,
    createdAt,
    updatedAt: createdAt,
    input: defaultSimulationInput,
  }) as const;

const setUp = (
  repository: PlanRepository,
  selected?: string,
): Readonly<{
  store: ReturnType<typeof createPlanStore>;
  setSession: (next: Session) => void;
  saved: () => readonly string[];
  errors: () => readonly string[];
}> => {
  const [session, setSession] = createState<Session>({ type: 'starting' });

  const mut_saved: string[] = [];

  const mut_errors: string[] = [];

  const store = createPlanStore({
    session,
    now: () => 100,
    selection: {
      load: () => selected,
      save: (id) => {
        mut_saved.push(id);
      },
    },
    reportError: (message) => {
      mut_errors.push(message);
    },
  });

  store.start();

  setSession({ type: 'signed-in', userName: 'me', repository });

  return {
    store,
    setSession,
    saved: () => Array.from(mut_saved),
    errors: () => Array.from(mut_errors),
  };
};

const names = (
  store: ReturnType<typeof createPlanStore>,
): readonly string[] => {
  const state = store.plans.getSnapshot().value;

  return state.type === 'loaded' ? state.plans.map((p) => p.name) : [];
};

describe(createPlanStore, () => {
  test('opens the plan last chosen, or the first when it is gone', () => {
    const repository = createMemoryRepository([plan('a', 1), plan('b', 2)]);

    assert.strictEqual(
      setUp(repository, 'b').store.currentPlan.getSnapshot().value?.id,
      'b',
    );

    assert.strictEqual(
      setUp(repository, 'gone').store.currentPlan.getSnapshot().value?.id,
      'a',
    );
  });

  test('has no plan while signed out, and loads the plans on sign-in', () => {
    const { store, setSession } = setUp(createMemoryRepository([plan('a', 1)]));

    setSession({ type: 'signed-out', error: undefined, signingIn: false });

    assert.deepStrictEqual(store.plans.getSnapshot().value, {
      type: 'loading',
    });

    assert.isUndefined(store.currentPlan.getSnapshot().value);
  });

  test('saves an edit to the open plan and keeps it on screen', async () => {
    const repository = createMemoryRepository([plan('a', 1), plan('b', 2)]);

    const { store } = setUp(repository, 'b');

    store.updateInput((input) => ({
      ...input,
      assumptions: { ...input.assumptions, initialCash: 123 },
    }));

    assert.strictEqual(
      store.input.getSnapshot().value.assumptions.initialCash,
      123,
    );

    const stored = await new Promise<readonly Plan[]>((resolve) => {
      repository.subscribePlans({ next: resolve, error: () => {} })();
    });

    assert.deepStrictEqual(
      stored.map((p) => [p.id, p.input.assumptions.initialCash, p.updatedAt]),
      [
        ['a', defaultSimulationInput.assumptions.initialCash, 1],
        ['b', 123, 100],
      ],
    );
  });

  test('switching plans shows that plan’s inputs', () => {
    const edited: Plan = {
      ...plan('b', 2),
      input: {
        ...defaultSimulationInput,
        profile: { ...defaultSimulationInput.profile, birth: '1980-01' },
      },
    } as const;

    const { store, saved } = setUp(
      createMemoryRepository([plan('a', 1), edited]),
    );

    store.selectPlan('b');

    assert.strictEqual(
      store.input.getSnapshot().value.profile.birth,
      '1980-01',
    );

    assert.deepStrictEqual(saved(), ['b']);
  });

  test('creates, duplicates, renames and deletes plans', () => {
    const { store } = setUp(createMemoryRepository([plan('a', 1)]));

    store.createPlan();

    assert.deepStrictEqual(names(store), ['plan a', 'プラン 1']);

    assert.strictEqual(store.currentPlan.getSnapshot().value?.name, 'プラン 1');

    store.renamePlan('  持ち家  ');

    store.renamePlan(' '.repeat(3));

    store.duplicatePlan();

    assert.deepStrictEqual(names(store), [
      'plan a',
      '持ち家',
      '持ち家 のコピー',
    ]);

    store.deletePlan();

    assert.deepStrictEqual(names(store), ['plan a', '持ち家']);

    assert.strictEqual(store.currentPlan.getSnapshot().value?.name, 'plan a');
  });

  test('reports a write that fails', async () => {
    const memory = createMemoryRepository([plan('a', 1)]);

    const { store, errors } = setUp({
      ...memory,
      putPlan: () => Promise.reject(new Error('permission-denied')),
    });

    store.renamePlan('x');

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    assert.deepStrictEqual(errors(), ['Could not save the plan']);

    assert.include(store.writeError.getSnapshot().value, 'permission-denied');

    store.dismissWriteError();

    assert.isUndefined(store.writeError.getSnapshot().value);
  });
});

describe(nextPlanName, () => {
  test('takes the first number not in use', () => {
    assert.strictEqual(nextPlanName([]), 'プラン 1');

    assert.strictEqual(
      nextPlanName([
        { ...plan('a', 1), name: 'プラン 1' },
        { ...plan('b', 2), name: 'プラン 3' },
      ]),
      'プラン 2',
    );
  });
});
