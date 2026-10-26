/**
 * The plans of whoever is signed in, which one is open, and its inputs.
 *
 * Follows the session: signing in subscribes to that user's repository,
 * signing out drops it. Writes go to the repository and come back through
 * the subscription — the repository hands local writes back at once, so
 * there is one way the plans change, not two. The plan open is the one last
 * chosen on this device, or the first when that one is gone; its inputs are
 * handed on only when they differ, so a change to another plan does not
 * recompute this one.
 */

import {
  combine,
  source as createSource,
  createState,
  filter,
  fromSubscribable,
  just,
  map,
  skipIfNoChange,
  switchMap,
  withInitialValue,
  type InitializedObservable,
  type Observable,
} from 'synstate';
import {
  fastDeepEqual,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import {
  defaultSimulationInput,
  type SimulationInput,
} from '../domain/index.mjs';
import type { Plan, PlanRepository } from '../repository/index.mjs';
import type { Session } from './session-store.mjs';

export type PlansState = Readonly<
  | { type: 'loading' }
  | { type: 'loaded'; plans: readonly Plan[] }
  | { type: 'error'; message: string }
>;

export type PlanStore = Readonly<{
  plans: InitializedObservable<PlansState>;
  /** The plan open, or `undefined` while there is none. */
  currentPlan: InitializedObservable<Plan | undefined>;
  /** The open plan's inputs (the defaults while there is none). */
  input: InitializedObservable<SimulationInput>;
  /** Why the last write failed, until it is dismissed. */
  writeError: InitializedObservable<string | undefined>;
  /** Starts following the session, and returns what stops it. */
  start: () => () => void;
  selectPlan: (id: string) => void;
  /** Creates a plan with the default inputs, and opens it. */
  createPlan: () => void;
  /** Copies the open plan, and opens the copy. */
  duplicatePlan: () => void;
  renamePlan: (name: string) => void;
  deletePlan: () => void;
  /** Rewrites the open plan's inputs; nothing happens while there is none. */
  updateInput: (fn: (input: SimulationInput) => SimulationInput) => void;
  dismissWriteError: () => void;
}>;

export type PlanStoreDeps = Readonly<{
  session: InitializedObservable<Session>;
  now: () => number;
  /** Where the id of the plan last opened is kept on this device. */
  selection: Readonly<{
    load: () => string | undefined;
    save: (id: string) => void;
  }>;
  reportError: (message: string, error: unknown) => void;
}>;

export const createPlanStore = ({
  session,
  now,
  selection,
  reportError,
}: PlanStoreDeps): PlanStore => {
  // While `start` has been called and its stop has not. What is followed is
  // derived from it, so that stopping, signing out or signing in as somebody
  // else disposes the subscription to the repository followed before.
  const [started, setStarted] = createState(false);

  const followed = started
    .pipe(
      switchMap((isStarted): Observable<Followed> =>
        isStarted ? session.pipe(map(repositoryOf)) : just('stopped' as const),
      ),
    )
    .pipe(skipIfNoChange())
    .pipe(withInitialValue<Followed>('stopped'));

  const plans = followed
    .pipe(
      switchMap((repository): Observable<PlansState> =>
        repository === 'stopped'
          ? createSource<PlansState>()
          : repository === undefined
            ? just(LOADING)
            : fromFeed(LOADING, (next) =>
                repository.subscribePlans({
                  next: (loaded) => {
                    next({ type: 'loaded', plans: loaded });
                  },
                  error: (error) => {
                    reportError('Could not load the plans', error);

                    next({
                      type: 'error',
                      message: `プランを読み込めませんでした（${describeError(error)}）。`,
                    });
                  },
                }),
              ),
      ),
    )
    .pipe(withInitialValue<PlansState>(LOADING));

  const [selectedId, setSelectedId] = createState(selection.load());

  const currentPlan = combine([plans, selectedId]).pipe(
    map(([state, id]) =>
      state.type === 'loaded'
        ? (state.plans.find((p) => p.id === id) ?? state.plans[0])
        : undefined,
    ),
  );

  const input = currentPlan
    .pipe(map((plan) => plan?.input ?? defaultSimulationInput))
    .pipe(skipIfNoChange(fastDeepEqual));

  const [writeError, setWriteError] = createState<string | undefined>(
    undefined,
  );

  const getCurrentPlan = (): Plan | undefined =>
    currentPlan.getSnapshot().value;

  const currentRepository = (): PlanRepository | undefined => {
    const repository = followed.getSnapshot().value;

    return repository === 'stopped' ? undefined : repository;
  };

  const write = (run: (target: PlanRepository) => Promise<void>): void => {
    const repository = currentRepository();

    if (repository === undefined) {
      return;
    }

    run(repository).catch((error: unknown) => {
      reportError('Could not save the plan', error);

      setWriteError(`保存できませんでした（${describeError(error)}）。`);
    });
  };

  const selectPlan = (id: string): void => {
    setSelectedId(id);

    selection.save(id);
  };

  const createFrom = (
    name: (existing: readonly Plan[]) => string,
    planInput: SimulationInput,
  ): void => {
    const state = plans.getSnapshot().value;

    const repository = currentRepository();

    if (repository === undefined || state.type !== 'loaded') {
      return;
    }

    const time = now();

    const id = repository.newPlanId();

    write((r) =>
      r.putPlan({
        id,
        name: name(state.plans),
        createdAt: time,
        updatedAt: time,
        input: planInput,
      }),
    );

    selectPlan(id);
  };

  const updateCurrent = (fn: (current: Plan) => Plan): void => {
    const plan = getCurrentPlan();

    if (plan !== undefined) {
      write((repository) =>
        repository.putPlan({ ...fn(plan), updatedAt: now() }),
      );
    }
  };

  return {
    plans,
    currentPlan,
    input,
    writeError,
    start: () => {
      setStarted(true);

      return () => {
        setStarted(false);
      };
    },
    selectPlan,
    createPlan: () => {
      createFrom(nextPlanName, defaultSimulationInput);
    },
    duplicatePlan: () => {
      const plan = getCurrentPlan();

      if (plan !== undefined) {
        createFrom(() => `${plan.name} のコピー`, plan.input);
      }
    },
    renamePlan: (name) => {
      const trimmed = name.trim();

      if (trimmed !== '') {
        updateCurrent((plan) => ({ ...plan, name: trimmed }));
      }
    },
    deletePlan: () => {
      const plan = getCurrentPlan();

      if (plan !== undefined) {
        write((repository) => repository.deletePlan(plan.id));
      }
    },
    updateInput: (fn) => {
      updateCurrent((plan) => ({ ...plan, input: fn(plan.input) }));
    },
    dismissWriteError: () => {
      setWriteError(undefined);
    },
  };
};

/** 「プラン 1」「プラン 2」…のうち、まだ使われていない最初の名前。 */
export const nextPlanName = (plans: readonly Plan[]): string => {
  const names = new Set(plans.map((p) => p.name));

  let mut_n = 1;

  while (names.has(`プラン ${mut_n}`)) {
    mut_n += 1;
  }

  return `プラン ${mut_n}`;
};

type Followed = PlanRepository | undefined | 'stopped';

const LOADING: PlansState = { type: 'loading' } as const;

const repositoryOf = (s: Session): PlanRepository | undefined =>
  s.type === 'signed-in' ? s.repository : undefined;

/**
 * What `subscribe` hands `next`, as an observable whose value is `first`
 * until then. What it hands while it is being subscribed to — the memory
 * repository hands its plans at once — is the observable's initial value
 * rather than a write.
 */
const fromFeed = <A,>(
  first: A,
  subscribe: (next: (value: A) => void) => () => void,
): Observable<A> =>
  fromSubscribable<A, never>({
    subscribe: (next) => {
      next(first);

      return { unsubscribe: subscribe(next) };
    },
  })
    .pipe(filter(Result.isOk))
    .pipe(map(({ value }) => value));

const describeError = (error: unknown): string =>
  isRecord(error) && hasKey(error, 'message') && isString(error.message)
    ? error.message
    : unknownToString(error);
