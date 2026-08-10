import {
  type Brand,
  type ChangeBaseBrand,
  type UnknownRecord,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

type UserId = Brand<string, 'UserId' | 'validated'>;
type NumericUserId = ChangeBaseBrand<UserId, number>;
// NumericUserId is Brand<number, 'UserId' | 'validated'>

// Useful for type conversions
type SerializedData = Brand<string, 'json' | 'validated'>;
type ParsedData = ChangeBaseBrand<SerializedData, UnknownRecord>;

// embed-sample-code-ignore-below
export type { NumericUserId, ParsedData, SerializedData, UserId };
