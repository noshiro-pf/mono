import { Arr } from 'ts-data-forge';
import type { Plan } from './plan-doc.mjs';
import type { PlanRepository, PlansObserver } from './repository.mjs';

/**
 * A {@link PlanRepository} that keeps the plans in memory, starting from
 * `initial`: for the tests, and for the demo (`?storage=memory`), where
 * reloading the page starts over.
 *
 * Every write is applied and handed to the subscribers before its promise
 * resolves, as Firestore hands local writes to its listeners at once.
 */
export const createMemoryRepository = (
  initial: readonly Plan[] = [],
): PlanRepository => {
  let mut_plans = initial;

  let mut_nextId = 1;

  const mut_observers = new Set<PlansObserver>();

  const update = (next: readonly Plan[]): Promise<void> => {
    mut_plans = next.toSorted((a, b) => a.createdAt - b.createdAt);

    for (const observer of mut_observers) {
      observer.next(mut_plans);
    }

    return Promise.resolve();
  };

  return {
    subscribePlans: (observer) => {
      mut_observers.add(observer);

      observer.next(mut_plans);

      return () => {
        mut_observers.delete(observer);
      };
    },
    putPlan: (plan) =>
      update(
        mut_plans.some((p) => p.id === plan.id)
          ? mut_plans.map((p) => (p.id === plan.id ? plan : p))
          : Arr.toPushed(mut_plans, plan),
      ),
    deletePlan: (id) => update(mut_plans.filter((p) => p.id !== id)),
    newPlanId: () => {
      const id = `plan-${mut_nextId}` as const;

      mut_nextId += 1;

      return id;
    },
  };
};
