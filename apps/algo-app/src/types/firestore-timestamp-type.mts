import { FieldValue, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/**
 * An action's `timestamp`, which Firestore orders the actions by. It is
 * `serverTimestamp()`, a `FieldValue`, when written, and is read back as a
 * `Timestamp` once the write is committed, or as `null` while the server
 * timestamp is still pending (`d.data()` with the default
 * `serverTimestamps: 'none'`). `Timestamp` is not a `FieldValue`, so the type
 * names all three; `GameStateActionToWrite` and `GameStateActionFromDb` narrow
 * it to each side.
 */
export type FirestoreTimestamp = FieldValue | Timestamp | null;

export const firestoreTimestampTypeDef: t.Type<FirestoreTimestamp> =
  t.createType({
    typeName: 'FirestoreTimestamp',
    defaultValue: serverTimestamp(),
    validate: (a) =>
      a === null || a instanceof Timestamp || a instanceof FieldValue
        ? Result.ok(a)
        : Result.err([
            t.createPrimitiveValidationError({
              actualValue: a,
              expectedType: 'FieldValue | Timestamp | null',
              typeName: 'FirestoreTimestamp',
              details: undefined,
            }),
          ]),
  });
