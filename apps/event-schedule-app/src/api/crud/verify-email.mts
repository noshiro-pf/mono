import { hasKeyValue } from 'event-schedule-app-shared';
import { httpsCallable } from 'firebase/functions';
import { Result, isRecord, isString, unknownToString } from 'ts-data-forge';
import type { FirebaseHandles } from '../firebase.mjs';

export const verifyEmail = ({ fbFunctions }: FirebaseHandles) => {
  const fbVerifyEmail = httpsCallable(fbFunctions, 'verifyEmail');

  return async (
    eventId: string,
    email: string,
  ): Promise<
    Result<
      'ng' | 'ok',
      Readonly<{
        type: VerifyEmailErrorType;
        message: string;
      }>
    >
  > =>
    Result.fromPromise(fbVerifyEmail({ eventId, email })).then((result) => {
      if (Result.isErr(result)) {
        const err = result.value;

        const code =
          isRecord(err) && hasKeyValue(err, 'code', isString)
            ? err.code
            : undefined;

        if (code === 'functions/not-found') {
          return Result.err({
            type: 'not-found' as const,
            message: `event of id "${eventId}" not-found`,
          });
        }

        // Refused by the function: an event made signed in is checked only for
        // its author, signed in, and one made signed out only so many times an
        // hour.
        if (code === 'functions/permission-denied') {
          return Result.err({
            type: 'permission-denied' as const,
            message: unknownToString(err),
          });
        }

        if (code === 'functions/resource-exhausted') {
          return Result.err({
            type: 'resource-exhausted' as const,
            message: unknownToString(err),
          });
        }

        return Result.err({
          type: 'others' as const,
          message: unknownToString(err),
        });
      }

      const response = result.value.data;

      if (response === 'ok' || response === 'ng') {
        return Result.ok<'ng' | 'ok'>(response);
      }

      return Result.err({
        type: 'type-error' as const,
        message: "response should be 'ok' or 'ng'.",
      });
    });
};

export type VerifyEmailErrorType =
  | 'not-found'
  | 'others'
  | 'permission-denied'
  | 'resource-exhausted'
  | 'type-error';
