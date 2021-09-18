import type { PermutationString } from '@noshiro/ts-utils';
import {
  assertType,
  hasKeyValue,
  IList,
  isArrayOfLength4,
  isArrayOfLength6,
  isNonNullObject,
  isString,
  isUndefined,
} from '@noshiro/ts-utils';
import type { Card } from './card-type';
import { isCard } from './card-type';
import type { Player } from './player';
import { isPlayer } from './player';

export type Room = DeepReadonly<{
  id: string;
  password: string | undefined;
  players: Player[];
  shuffleDef: PermutationString<'1234'>;
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  state: 'not-started' | 'playing' | 'finished';
  playerCards: ArrayOfLength<4, ArrayOfLength<6, Card>>;
}>;

const roomStateList = ['not-started', 'playing', 'finished'] as const;
assertType<TypeEq<typeof roomStateList[number], Room['state']>>();

export const assertIsRoom: (data: unknown) => asserts data is Room = (data) => {
  if (!isNonNullObject(data)) {
    throw new Error('isNonNullObject failed');
  }
  if (
    !(
      hasKeyValue(data, 'id', isString) &&
      hasKeyValue(
        data,
        'password',
        (v): v is Room['password'] => isString(v) || isUndefined(v)
      ) &&
      hasKeyValue(
        data,
        'players',
        (v): v is Room['players'] => Array.isArray(v) && v.every(isPlayer)
      ) &&
      hasKeyValue(
        data,
        'shuffleDef',
        (v): v is Room['shuffleDef'] => isString(v) && /^[1-4]{4}$/gu.test(v)
      ) &&
      hasKeyValue(
        data,
        'state',
        (v): v is Room['state'] =>
          isString(v) && IList.includes(roomStateList, v)
      ) &&
      hasKeyValue(
        data,
        'playerCards',
        (v): v is Room['playerCards'] =>
          Array.isArray(v) &&
          isArrayOfLength4(v) &&
          v.every(
            (a) => Array.isArray(a) && isArrayOfLength6(a) && a.every(isCard)
          )
      )
    )
  ) {
    throw new Error('hasKeyValue failed');
  }

  assertType<TypeExtends<typeof data, Room>>();
  assertType<TypeExtends<Room, typeof data>>();
};
