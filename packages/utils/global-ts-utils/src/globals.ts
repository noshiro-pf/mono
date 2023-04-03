/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import {
  Arr,
  ArrayUtils,
  assertNotUndefined,
  castWritable,
  createQueue,
  createTinyObservable,
  DateUtils,
  expectType,
  FiniteNumber,
  hasKey,
  hasKeyValue,
  idfn,
  ifThen,
  IMap,
  IMapMapped,
  Int,
  Int32,
  isBigint,
  isBoolean,
  ISet,
  ISetMapped,
  isNonNullish,
  isNonNullObject,
  isNotBigint,
  isNotBoolean,
  isNotNull,
  isNotNumber,
  isNotString,
  isNotSymbol,
  isNotUndefined,
  isNull,
  isNullish,
  isNumber,
  isPrimitive,
  isRecord,
  isString,
  isSymbol,
  isUndefined,
  Json,
  mapOptional,
  mapOptionalC,
  match,
  Maybe,
  memoizeFunction,
  MutableMap,
  MutableSet,
  NonNegativeNumber,
  noop,
  Num,
  Obj,
  pipe,
  range,
  RecordUtils,
  Result,
  SafeInt,
  SafeUint,
  Str,
  toBoolean,
  toFiniteNumber,
  toInt,
  toInt32,
  toNonNegativeNumber,
  toSafeInt,
  toSafeUint,
  toUint,
  toUint32,
  tp,
  Uint,
  Uint32,
} from '@noshiro/ts-utils';

(global as any).Arr = Arr;
(global as any).ArrayUtils = ArrayUtils;
(global as any).assertNotUndefined = assertNotUndefined;
(global as any).castWritable = castWritable;
(global as any).createQueue = createQueue;
(global as any).createTinyObservable = createTinyObservable;
(global as any).DateUtils = DateUtils;
(global as any).expectType = expectType;
(global as any).FiniteNumber = FiniteNumber;
(global as any).hasKey = hasKey;
(global as any).hasKeyValue = hasKeyValue;
(global as any).idfn = idfn;
(global as any).ifThen = ifThen;
(global as any).IMap = IMap;
(global as any).IMapMapped = IMapMapped;
(global as any).Int = Int;
(global as any).Int32 = Int32;
(global as any).isBigint = isBigint;
(global as any).isBoolean = isBoolean;
(global as any).ISet = ISet;
(global as any).ISetMapped = ISetMapped;
(global as any).isNonNullish = isNonNullish;
(global as any).isNonNullObject = isNonNullObject;
(global as any).isNotBigint = isNotBigint;
(global as any).isNotBoolean = isNotBoolean;
(global as any).isNotNull = isNotNull;
(global as any).isNotNumber = isNotNumber;
(global as any).isNotString = isNotString;
(global as any).isNotSymbol = isNotSymbol;
(global as any).isNotUndefined = isNotUndefined;
(global as any).isNull = isNull;
(global as any).isNullish = isNullish;
(global as any).isNumber = isNumber;
(global as any).isPrimitive = isPrimitive;
(global as any).isRecord = isRecord;
(global as any).isString = isString;
(global as any).isSymbol = isSymbol;
(global as any).isUndefined = isUndefined;
(global as any).Json = Json;
(global as any).mapOptional = mapOptional;
(global as any).mapOptionalC = mapOptionalC;
(global as any).match = match;
(global as any).Maybe = Maybe;
(global as any).memoizeFunction = memoizeFunction;
(global as any).MutableMap = MutableMap;
(global as any).MutableSet = MutableSet;
(global as any).NonNegativeNumber = NonNegativeNumber;
(global as any).noop = noop;
(global as any).Num = Num;
(global as any).Obj = Obj;
(global as any).pipe = pipe;
(global as any).range = range;
(global as any).RecordUtils = RecordUtils;
(global as any).Result = Result;
(global as any).SafeInt = SafeInt;
(global as any).SafeUint = SafeUint;
(global as any).Str = Str;
(global as any).toBoolean = toBoolean;
(global as any).toFiniteNumber = toFiniteNumber;
(global as any).toInt = toInt;
(global as any).toInt32 = toInt32;
(global as any).toNonNegativeNumber = toNonNegativeNumber;
(global as any).toSafeInt = toSafeInt;
(global as any).toSafeUint = toSafeUint;
(global as any).toUint = toUint;
(global as any).toUint32 = toUint32;
(global as any).tp = tp;
(global as any).Uint = Uint;
(global as any).Uint32 = Uint32;
