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
  type WriteBatch,
} from 'firebase/firestore';
import { Arr } from 'ts-data-forge';
import type * as t from 'ts-fortress';
import type { DeepReadonly } from 'ts-type-forge';
// In `repository/`, not here: `project-file.mts` measures with it too, in
// the first chunk, which does not load Firebase until a sign-in (`main.tsx`).
import { docBytes } from '../repository/index.mjs';

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
): Promise<void> => prepareBatch(firestore, batchWrites(write)).commit();

/**
 * Applies everything `write` hands its {@link BatchWriter}, in as many
 * batches as Firestore needs ({@link splitWrites}) — for more writes than one
 * batch takes. Every batch is handed over at once, so that offline each is
 * queued on this device rather than waiting for the one before it to reach
 * the server. Each is applied whole or not at all, but not the lot: when one
 * fails, the others may be applied, and once every one has been answered the
 * promise rejects, the first failure its cause.
 */
export const commitInBatches = async (
  firestore: DeepReadonly<Firestore>,
  write: (writer: BatchWriter) => void,
): Promise<void> => {
  // Every batch made before any is committed: making one can throw.
  const batches = splitWrites(batchWrites(write)).map((writes) =>
    prepareBatch(firestore, writes),
  );

  // Settled, every one: the promise ends when nothing is still being sent.
  const results = await Promise.allSettled(
    batches.map((batch) => batch.commit()),
  );

  const failed = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected',
  );

  if (failed !== undefined) {
    throw new Error('A batch was not written.', { cause: failed.reason });
  }
};

/**
 * `writes` in order, split into batches Firestore takes: at most
 * {@link MAX_BATCH_WRITES} writes, and an estimate of at most
 * {@link MAX_BATCH_BYTES} bytes each — a commit is refused over 10 MiB.
 */
export const splitWrites = (
  writes: readonly BatchWrite[],
): readonly (readonly BatchWrite[])[] => {
  const mut_batches: BatchWrite[][] = [];

  let mut_batch: BatchWrite[] = [];

  let mut_bytes = 0;

  for (const op of writes) {
    const bytes = writeBytes(op);

    if (
      Arr.isMinLengthArray(MAX_BATCH_WRITES, mut_batch) ||
      (Arr.isNonEmpty(mut_batch) && mut_bytes + bytes > MAX_BATCH_BYTES)
    ) {
      mut_batches.push(mut_batch);

      mut_batch = [];

      mut_bytes = 0;
    }

    mut_batch.push(op);

    mut_bytes += bytes;
  }

  if (Arr.isNonEmpty(mut_batch)) {
    mut_batches.push(mut_batch);
  }

  return mut_batches;
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

/** How many writes Firestore takes in one batch. */
export const MAX_BATCH_WRITES = 500;

/**
 * How many bytes of documents {@link splitWrites} puts in one batch, by its
 * estimate: under Firestore's 10 MiB, which also counts what the estimate
 * leaves out (field names twice, index entries).
 */
export const MAX_BATCH_BYTES = 8 * 1024 * 1024;

/** About how many bytes `op` adds to a commit. */
const writeBytes = (op: BatchWrite): number =>
  docBytes(op.ref.path) + (op.type === 'set' ? docBytes(op.data) : 0);

/** A batch of `writes`, not yet committed. */
const prepareBatch = (
  firestore: DeepReadonly<Firestore>,
  writes: readonly BatchWrite[],
): WriteBatch => {
  const batch = writeBatch(firestore);

  for (const op of writes) {
    if (op.type === 'set') {
      batch.set(op.ref, op.data);
    } else {
      batch.delete(op.ref);
    }
  }

  return batch;
};
