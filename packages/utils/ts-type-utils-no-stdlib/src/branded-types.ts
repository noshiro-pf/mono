import { type Brand } from './brand';

/** @internal */
type _FiniteKey = 'Finite';
/** @internal */
type _NonZeroKey = _FiniteKey | 'NonZero';
/** @internal */
type _NonNegativeKey = _FiniteKey | 'NonNegative';
/** @internal */
type _PositiveKey = _FiniteKey | 'NonNegative' | 'NonZero';

/** @internal */
type _IntKey = _FiniteKey | 'Int'; // Finite & Int
/** @internal */
type _UintKey = _IntKey | _NonNegativeKey; // Int & NonNegative
/** @internal */
type _NonZeroIntKey = _IntKey | _NonZeroKey; // Int & NonZero
/** @internal */
type _PositiveIntKey = _NonZeroKey | _UintKey; // Uint & NonZero

/** @internal */
type _SafeIntKey = _IntKey | 'SafeInt'; // Int & Safe
/** @internal */
type _SafeUintKey = _NonNegativeKey | _SafeIntKey; // SafeInt & NonNegative
/** @internal */
type _NonZeroSafeIntKey = _NonZeroKey | _SafeIntKey; // SafeInt & NonZero
/** @internal */
type _PositiveSafeIntKey = _NonZeroKey | _SafeUintKey; // SafeUint & NonZero

/** @internal */
type _Int32Key = _SafeIntKey | 'Int32'; // SafeInt & Int32
/** @internal */
type _Uint32Key = _Int32Key | _SafeUintKey; // Int32 & NonNegative
/** @internal */
type _NonZeroInt32Key = _Int32Key | _NonZeroKey; // Int32 & NonZero
/** @internal */
type _PositiveInt32Key = _NonZeroKey | _Uint32Key; // Uint32 & NonZero

export type FiniteNumber = Brand<number, _FiniteKey>;
export type NonZeroNumber = Brand<number, _NonZeroKey>;
export type NonNegativeNumber = Brand<number, _NonNegativeKey>;
export type PositiveNumber = Brand<number, _PositiveKey>;

export type Int = Brand<number, _IntKey>;
export type Uint = Brand<number, _UintKey>;
export type NonZeroInt = Brand<number, _NonZeroIntKey>;
export type PositiveInt = Brand<number, _PositiveIntKey>;

export type SafeInt = Brand<number, _SafeIntKey>;
export type SafeUint = Brand<number, _SafeUintKey>;
export type NonZeroSafeInt = Brand<number, _NonZeroSafeIntKey>;
export type PositiveSafeInt = Brand<number, _PositiveSafeIntKey>;

export type Int32 = Brand<number, _Int32Key>;
export type Uint32 = Brand<number, _Uint32Key>;
export type NonZeroInt32 = Brand<number, _NonZeroInt32Key>;
export type PositiveInt32 = Brand<number, _PositiveInt32Key>;
