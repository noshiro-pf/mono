/// <reference types="ts-type-forge" />

type PartialReadonly<T> = Partial<Readonly<T>>;

type Iso8601 = Brand<string, 'Iso8601'>;

type Email = Brand<string, 'Email'>;

type JsonString = Brand<string, 'JsonString'>;

type UuidVersion = UintRangeInclusive<1, 8>;

type UuidBaseString<V extends UuidVersion = UuidVersion> =
  | `${string}-${string}-${V}${string}-${string}-${string}`
  | '00000000-0000-0000-0000-000000000000'
  | 'ffffffff-ffff-ffff-ffff-ffffffffffff';

type Uuid = Brand<UuidBaseString, 'Uuid'>;

type Uuid4 = Brand<UuidBaseString<4>, 'Uuid'>;

type Uuid6 = Brand<UuidBaseString<6>, 'Uuid'>;

type Uuid7 = Brand<UuidBaseString<7>, 'Uuid'>;
