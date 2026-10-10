/**
 * Every read from Cloud Firestore and every write to it. Outside `src/api/`
 * nothing may import Firestore's reads and writes (`eslint.config.mts`), so
 * the functions here are all the ways there are.
 *
 * **Every write prunes.** A write names its document with a
 * {@link DocTarget} — the reference and the codec of what the document holds
 * — and what reaches the database is the codec's `prune` of the value: what
 * the codec describes and nothing more, however many fields the value
 * carries at run time, nested ones included. This is the only place that
 * prunes a document; the converters (`repository/converters.mts`) only give
 * it its shape.
 *
 * Reading hands back what is stored as `unknown`: it is data somebody else
 * may have written, and validating it is the caller's.
 */

import {
  getDoc,
  onSnapshot,
  setDoc,
  writeBatch,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';
import type * as t from 'ts-fortress';
import { type DeepReadonly } from 'ts-type-forge';

/** Creates or replaces the document `target` with `value`, pruned. */
export const putDoc = <A extends DocumentData>(
  target: DocTarget<A>,
  value: A,
): Promise<void> => setDoc(target.ref, target.codec.prune(value));

/**
 * Applies everything `write` hands its {@link BatchWriter} all together, or
 * none of it; each document set is pruned as {@link putDoc} prunes it.
 */
export const commitBatch = (
  firestore: DeepReadonly<Firestore>,
  write: (writer: BatchWriter) => void,
): Promise<void> => {
  const batch = writeBatch(firestore);

  for (const op of batchWrites(write)) {
    if (op.type === 'set') {
      batch.set(op.ref, op.data);
    } else {
      batch.delete(op.ref);
    }
  }

  return batch.commit();
};

/** What `write` asks of a batch, in order, each document set pruned. */
export const batchWrites = (
  write: (writer: BatchWriter) => void,
): readonly BatchWrite[] => {
  const mut_writes: BatchWrite[] = [];

  write({
    set: (target, value) => {
      mut_writes.push({
        type: 'set',
        ref: target.ref,
        data: target.codec.prune(value),
      });
    },
    delete: (ref) => {
      mut_writes.push({ type: 'delete', ref });
    },
  });

  return mut_writes;
};

/**
 * Hands `observer.next` the documents of `ref` once they have loaded, and
 * again on every change after, local writes included. Returns what stops it.
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

/**
 * Hands `observer.next` what document `ref` holds — `undefined` if it does
 * not exist, which no document's data can be — once it has loaded, and
 * again on every change after. Returns what stops it.
 */
export const watchDoc = (
  ref: DeepReadonly<DocumentReference>,
  observer: Observer<unknown>,
): (() => void) =>
  onSnapshot(
    ref,
    (snapshot) => {
      observer.next(snapshot.exists() ? snapshot.data() : undefined);
    },
    observer.error,
  );

/** What document `ref` holds, or `undefined` if it does not exist. */
export const getDocData = async (
  ref: DeepReadonly<DocumentReference>,
): Promise<unknown> => {
  const snapshot = await getDoc(ref);

  return snapshot.exists() ? snapshot.data() : undefined;
};

/** A document, and the codec of what it holds. */
export type DocTarget<A> = DeepReadonly<{
  ref: DocumentReference;
  codec: t.Type<A>;
}>;

/** What a batch can be asked to do, writing nothing it has not pruned. */
export type BatchWriter = Readonly<{
  set: <A extends DocumentData>(target: DocTarget<A>, value: A) => void;
  delete: (ref: DeepReadonly<DocumentReference>) => void;
}>;

export type BatchWrite = DeepReadonly<
  | { type: 'set'; ref: DocumentReference; data: DocumentData }
  | { type: 'delete'; ref: DocumentReference }
>;

/** A document as it is read: its id, and what it holds, not yet validated. */
export type StoredDoc = Readonly<{ id: string; data: unknown }>;

type Observer<A> = Readonly<{
  next: (value: A) => void;
  error: (error: unknown) => void;
}>;
