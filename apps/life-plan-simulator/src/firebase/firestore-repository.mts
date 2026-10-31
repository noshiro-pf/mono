/**
 * The {@link PlanRepository} of one user in Cloud Firestore:
 * `users/{uid}/plans/{planId}`, each document a plan without its id
 * (`repository/plan-doc.mts`). Every read and write goes through
 * `api/firestore-io.mts`, which prunes each document written to its codec.
 *
 * The listener hands back local writes at once, and the persistent cache set up
 * in `firebase-backend.mts` keeps the plans readable — and writable, queued —
 * offline.
 */

import { collection, doc, type Firestore } from 'firebase/firestore';
import type { DeepReadonly } from 'ts-type-forge';
import { deleteDocAt, putDoc, watchCollection } from '../api/index.mjs';
import {
  PlanDocCodec,
  planFromDoc,
  planToDoc,
  readValidDocs,
  type PlanRepository,
} from '../repository/index.mjs';

export const createFirestoreRepository = (
  firestore: DeepReadonly<Firestore>,
  uid: string,
): PlanRepository => {
  const plans = collection(firestore, 'users', uid, 'plans');

  return {
    subscribePlans: (observer) =>
      watchCollection(plans, {
        next: (docs) => {
          observer.next(readValidDocs(docs, planFromDoc, warn));
        },
        error: observer.error,
      }),
    putPlan: (plan) =>
      putDoc(
        { ref: doc(plans, plan.id), codec: PlanDocCodec },
        planToDoc(plan),
      ),
    deletePlan: (id) => deleteDocAt(doc(plans, id)),
    newPlanId: () => doc(plans).id,
  };
};

const warn = (message: string): void => {
  console.warn(message);
};
