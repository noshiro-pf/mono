/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import {
  Arr,
  ArrayUtils,
  DateUtils,
  FiniteNumber,
  IMap,
  IMapMapped,
  ISet,
  ISetMapped,
  Int,
  Int16,
  Int32,
  Int8,
  Json,
  Maybe,
  MutableMap,
  MutableSet,
  NonNegativeNumber,
  Num,
  Obj,
  RecordUtils,
  Result,
  SafeInt,
  SafeUint,
  Str,
  Tpl,
  TupleUtils,
  Uint,
  Uint16,
  Uint32,
  Uint8,
  assertNotUndefined,
  castDeepReadonly,
  castDeepWritable,
  castReadonly,
  castWritable,
  createQueue,
  createTinyObservable,
  expectType,
  hasKeyValue,
  idfn,
  ifThen,
  isBigint,
  isBoolean,
  isInt16,
  isInt32,
  isNonNegative,
  isNonNullObject,
  isNonNullish,
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
  isSafeUint,
  isString,
  isSymbol,
  isUint,
  isUint16,
  isUint32,
  isUndefined,
  mapOptional,
  mapOptionalC,
  match,
  memoizeFunction,
  noop,
  pipe,
  range,
  toBoolean,
  toFiniteNumber,
  toInt,
  toInt16,
  toInt32,
  toInt8,
  toNonNegativeNumber,
  toSafeInt,
  toSafeUint,
  toUint,
  toUint16,
  toUint32,
  toUint8,
  tp,
} from '@noshiro/ts-utils';

(global as any).Arr = Arr;
(global as any).ArrayUtils = ArrayUtils;
(global as any).assertNotUndefined = assertNotUndefined;
(global as any).castWritable = castWritable;
(global as any).castDeepWritable = castDeepWritable;
(global as any).castReadonly = castReadonly;
(global as any).castDeepReadonly = castDeepReadonly;
(global as any).createQueue = createQueue;
(global as any).createTinyObservable = createTinyObservable;
(global as any).DateUtils = DateUtils;
(global as any).expectType = expectType;
(global as any).FiniteNumber = FiniteNumber;
(global as any).hasKeyValue = hasKeyValue;
(global as any).idfn = idfn;
(global as any).ifThen = ifThen;
(global as any).IMap = IMap;
(global as any).IMapMapped = IMapMapped;
(global as any).Int = Int;
(global as any).Int16 = Int16;
(global as any).Int32 = Int32;
(global as any).Int8 = Int8;
(global as any).isBigint = isBigint;
(global as any).isBoolean = isBoolean;
(global as any).ISet = ISet;
(global as any).ISetMapped = ISetMapped;
(global as any).isInt16 = isInt16;
(global as any).isInt32 = isInt32;
(global as any).isNonNegative = isNonNegative;
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
(global as any).isSafeUint = isSafeUint;
(global as any).isString = isString;
(global as any).isSymbol = isSymbol;
(global as any).isUint = isUint;
(global as any).isUint16 = isUint16;
(global as any).isUint32 = isUint32;
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
(global as any).toInt16 = toInt16;
(global as any).toInt32 = toInt32;
(global as any).toInt8 = toInt8;
(global as any).toNonNegativeNumber = toNonNegativeNumber;
(global as any).toSafeInt = toSafeInt;
(global as any).toSafeUint = toSafeUint;
(global as any).toUint = toUint;
(global as any).toUint16 = toUint16;
(global as any).toUint32 = toUint32;
(global as any).toUint8 = toUint8;
(global as any).tp = tp;
(global as any).Tpl = Tpl;
(global as any).TupleUtils = TupleUtils;
(global as any).Uint = Uint;
(global as any).Uint16 = Uint16;
(global as any).Uint32 = Uint32;
(global as any).Uint8 = Uint8;
