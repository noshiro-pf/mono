import { fillEventSchedule } from '@noshiro/event-schedule-app-shared';
import { doc, getDoc } from 'firebase/firestore';
import { dbEvents } from '../../initialize-firebase';

// import { httpsCallable } from 'firebase/functions';
// import { functions } from '../../initialize-firebase';

// const fbFetchEventOfId = httpsCallable(functions, 'fetchEventOfId');

// export const getEventSchedule = async (
//   id: string
// ): Promise<
//   Result<
//     EventSchedule,
//     Readonly<{ type: 'not-found' | 'others'; message: string }>
//   >
// > =>
//   Result.fromPromise(fbFetchEventOfId({ id })).then((result) => {
//     if (Result.isErr(result)) {
//       const err = result.value;

//       if (
//         isRecord(err) &&
//         IRecord.hasKeyValue(err, 'code', isString) &&
//         err.code === 'functions/not-found'
//       ) {
//         return Result.err({
//           type: 'not-found' as const,
//           message: `event of id "${id}" not-found`,
//         });
//       }

//       return Result.err({
//         type: 'others' as const,
//         message: Str.from(err),
//       });
//     }

//     const response = result.value.data;

//     return Result.ok(fillEventSchedule(response));
//   });

export const fetchEventSchedule = async (
  id: string
): Promise<
  Result<
    EventSchedule,
    Readonly<{ type: 'not-found' | 'others'; message: string }>
  >
> => {
  try {
    const res = await getDoc(doc(dbEvents, id));
    if (!res.exists()) {
      return Result.err({
        type: 'not-found' as const,
        message: `event of id "${id}" not-found`,
      });
    }
    return Result.ok(fillEventSchedule(res.data()));
  } catch (error: unknown) {
    return Result.err({ type: 'others' as const, message: Str.from(error) });
  }
};
