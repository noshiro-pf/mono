import { firestorePaths } from 'event-schedule-app-shared';
import { GrpcStatus, type Firestore } from 'firebase-admin/firestore';
import { logger, type auth } from 'firebase-functions/v1';
import { Arr, isNotUndefined, isRecord } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { isCurrentEventAnswerPath } from './functions/index.mjs';

/**
 * Takes the deleted user's id off what still names it: `author.id` of the
 * events they made and `user.id` of the answers they gave.
 *
 * Only the documents that name the user are read, and only that field is
 * written (`update`), so an edit made meanwhile to any other field stays. The
 * answers are found by a collection-group query, which needs the `answers` /
 * `user.id` index in `apps/event-schedule-app/firestore.indexes.json`.
 *
 * The writes go through a `BulkWriter`, which commits them in batches within
 * Firestore's limits and retries what fails transiently. A document deleted
 * since the query has nothing left to clear; any other failed write makes the
 * returned promise reject once the rest are written, so that the invocation is
 * recorded as failed rather than as done.
 */
export const onUserDelete = async (
  db: Firestore,
  user: DeepReadonly<auth.UserRecord>,
): Promise<void> => {
  const uid = user.uid;

  const [events, answers] = await Promise.all([
    db.collection(firestorePaths.events).where('author.id', '==', uid).get(),
    db
      .collectionGroup(firestorePaths.answers)
      .where('user.id', '==', uid)
      .get(),
  ]);

  const currentAnswers = answers.docs.filter((doc) =>
    isCurrentEventAnswerPath(doc.ref.path),
  );

  const writer = db.bulkWriter();

  const results = [
    ...events.docs.map((doc) => writer.update(doc.ref, 'author.id', null)),
    ...currentAnswers.map((doc) => writer.update(doc.ref, 'user.id', null)),
  ].map(async (write) =>
    write
      .then(() => undefined)
      .catch((error: unknown) => (isNotFound(error) ? undefined : error)),
  );

  await writer.close();

  const settled = await Promise.all(results);

  const failures = settled.filter(isNotUndefined);

  if (Arr.isNonEmpty(failures)) {
    throw new AggregateError(
      failures,
      `${failures.length} of the writes clearing the deleted user failed.`,
    );
  }

  logger.log(
    `Cleared the deleted user from ${events.size} events and ${currentAnswers.length} answers.`,
  );
};

const isNotFound = (error: unknown): boolean =>
  isRecord(error) && error['code'] === GrpcStatus.NOT_FOUND;
