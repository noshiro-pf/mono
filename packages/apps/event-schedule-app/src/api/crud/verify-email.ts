import { httpsCallable } from 'firebase/functions';
import { functions } from '../../initialize-firebase';

const fbVerifyEmail = httpsCallable(functions, 'verifyEmail');

export const verifyEmail = async (
  eventId: string,
  email: string
): Promise<
  Result<
    'ng' | 'ok',
    Readonly<{ type: 'not-found' | 'others' | 'type-error'; message: string }>
  >
> =>
  Result.fromPromise(
    fbVerifyEmail({
      eventId,
      email,
    })
  ).then((result) => {
    if (Result.isErr(result)) {
      const err = result.value;

      if (
        isRecord(err) &&
        IRecord.hasKeyValue(err, 'code', isString) &&
        err.code === 'functions/not-found'
      ) {
        return Result.err({
          type: 'not-found' as const,
          message: `event of id "${eventId}" not-found`,
        });
      }

      return Result.err({
        type: 'others' as const,
        message: Str.from(err),
      });
    }

    const response = result.value.data;

    if (response === 'ok' || response === 'ng') {
      return Result.ok<'ng' | 'ok'>(response);
    } else {
      return Result.err({
        type: 'type-error' as const,
        message: "response should be 'ok' or 'ng'.",
      });
    }
  });
