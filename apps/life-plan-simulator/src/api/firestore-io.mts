/**
 * Every read from Cloud Firestore and every write to it. Outside `src/api/`
 * nothing may import Firestore's reads and writes (`eslint.config.mts`), so the
 * functions here are all the ways there are.
 *
 * **Every write prunes.** A write names its document with a {@link DocTarget} —
 * the reference and the codec of what the document holds — and what reaches the
 * database is the codec's `prune` of the value: what the codec describes and
 * nothing more, however many fields the value carries at run time, nested ones
 * included.
 *
 * Reading hands back what is stored as `unknown`: it is data somebody else may
 * have written, and validating it is the caller's (`repository/plan-doc.mts`).
 */

import {
  deleteDoc,
  onSnapshot,
  setDoc,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore';
import type * as t from 'ts-fortress';
import type { DeepReadonly } from 'ts-type-forge';

/** Creates or replaces the document `target` with `value`, pruned. */
export const putDoc = <A extends DocumentData>(
  target: DocTarget<A>,
  value: A,
): Promise<void> => setDoc(target.ref, target.codec.prune(value));

/** Deletes the document `ref`. */
export const deleteDocAt = (
  ref: DeepReadonly<DocumentReference>,
): Promise<void> => deleteDoc(ref);

/**
 * Hands `observer.next` the documents of `ref` once they have loaded, and again
 * on every change after, local writes included. Returns what stops it.
 */
export const watchCollection = (
  ref: DeepReadonly<CollectionReference>,
  observer: Observer<readonly StoredDoc[]>,
): (() => void) =>
  onSnapshot(
    ref,
    (snapshot) => {
      observer.next(
        snapshot.docs.map((snapshotDoc) => ({
          id: snapshotDoc.id,
          data: snapshotDoc.data(),
        })),
      );
    },
    observer.error,
  );

/** A document, and the codec of what it holds. */
export type DocTarget<A> = DeepReadonly<{
  ref: DocumentReference;
  codec: t.Type<A>;
}>;

/** A document as it is read: its id, and what it holds, not yet validated. */
export type StoredDoc = Readonly<{ id: string; data: unknown }>;

type Observer<A> = Readonly<{
  next: (value: A) => void;
  error: (error: unknown) => void;
}>;
