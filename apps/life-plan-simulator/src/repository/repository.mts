/**
 * Where a user's plans are kept: Firestore when signed in (`firebase/`), memory
 * in the tests and the demo (`memory-repository.mts`). The store sees only
 * this.
 */

import type { Plan } from './plan-doc.mjs';

export type PlanRepository = Readonly<{
  /**
   * Hands `observer.next` every plan once they have loaded, in creation order,
   * and again on every change after — local writes included, before they are
   * confirmed. Returns what stops it.
   */
  subscribePlans: (observer: PlansObserver) => () => void;
  /** Creates or replaces the plan with its id. */
  putPlan: (plan: Plan) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  /** An id no plan has yet, for {@link putPlan} to create one with. */
  newPlanId: () => string;
}>;

export type PlansObserver = Readonly<{
  next: (plans: readonly Plan[]) => void;
  error: (error: unknown) => void;
}>;

/** Signing in and out, and the repository of whoever is signed in. */
export type Backend = Readonly<{
  /**
   * Hands `listener` the session as soon as it is known, and again whenever it
   * changes. Returns what stops it.
   */
  watchSession: (listener: (session: BackendSession) => void) => () => void;
  signIn: () => Promise<void>;
  /**
   * Signs out, and removes what this device kept of the data. Writes made
   * offline are sent first; when they cannot be, nothing happens and
   * `'unsent-writes'` says so, unless `discardUnsentWrites` gives them up.
   */
  signOut: (
    options: Readonly<{ discardUnsentWrites: boolean }>,
  ) => Promise<SignOutResult>;
}>;

export type SignOutResult = 'signed-out' | 'unsent-writes';

export type BackendSession = Readonly<
  | { type: 'signed-out' }
  | {
      type: 'signed-in';
      /** Shown in the header. */
      userName: string;
      repository: PlanRepository;
    }
>;
