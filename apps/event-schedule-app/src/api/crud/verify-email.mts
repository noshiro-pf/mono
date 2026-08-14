import { httpsCallable } from 'firebase/functions';
import { Result, isRecord, isString, unknownToString } from 'ts-data-forge';
import { fbFunctions } from '../../initialize-firebase.mjs';
import { hasKeyValue } from '../../utils-ported/index.mjs';

const fbVerifyEmail = httpsCallable(fbFunctions, 'verifyEmail');

export const verifyEmail = async (
  eventId: string,
  email: string,
): Promise<
  Result<
    'ng' | 'ok',
    Readonly<{ type: 'not-found' | 'others' | 'type-error'; message: string }>
  >
> =>
  Result.fromPromise(fbVerifyEmail({ eventId, email })).then((result) => {
    if (Result.isErr(result)) {
      const err = result.value;

      if (
        isRecord(err) &&
        hasKeyValue(err, 'code', isString) &&
        err.code === 'functions/not-found'
      ) {
        return Result.err({
          type: 'not-found' as const,
          message: `event of id "${eventId}" not-found`,
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
