/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable functional/immutable-data */

import {
  assertNotType,
  assertNotUndefined,
  assertType,
  castWritable,
  createQueue,
  createTinyObservable,
  hasKey,
  hasKeyValue,
  IDate,
  idfn,
  ifThen,
  IList,
  IMap,
  IMapMapped,
  IRecord,
  isBoolean,
  ISet,
  ISetMapped,
  isNonNullObject,
  isNotBoolean,
  isNotNull,
  isNotNumber,
  isNotString,
  isNotSymbol,
  isNotUndefined,
  isNull,
  isNumber,
  isPrimitive,
  isString,
  isSymbol,
  isUndefined,
  mapNullable,
  mapNullableC,
  match,
  Maybe,
  memoizeFunction,
  noop,
  Num,
  objectIs,
  pipe,
  range,
  Result,
  Str,
  toBoolean,
  tp,
} from '@noshiro/ts-utils';

(global as any).assertNotType = assertNotType;
(global as any).assertNotUndefined = assertNotUndefined;
(global as any).assertType = assertType;
(global as any).castWritable = castWritable;
(global as any).createQueue = createQueue;
(global as any).createTinyObservable = createTinyObservable;
(global as any).hasKey = hasKey;
(global as any).hasKeyValue = hasKeyValue;
(global as any).IDate = IDate;
(global as any).idfn = idfn;
(global as any).ifThen = ifThen;
(global as any).IList = IList;
(global as any).IMap = IMap;
(global as any).IMapMapped = IMapMapped;
(global as any).IRecord = IRecord;
(global as any).isBoolean = isBoolean;
(global as any).ISet = ISet;
(global as any).ISetMapped = ISetMapped;
(global as any).isNonNullObject = isNonNullObject;
(global as any).isNotBoolean = isNotBoolean;
(global as any).isNotNull = isNotNull;
(global as any).isNotNumber = isNotNumber;
(global as any).isNotString = isNotString;
(global as any).isNotSymbol = isNotSymbol;
(global as any).isNotUndefined = isNotUndefined;
(global as any).isNull = isNull;
(global as any).isNumber = isNumber;
(global as any).isPrimitive = isPrimitive;
(global as any).isString = isString;
(global as any).isSymbol = isSymbol;
(global as any).isUndefined = isUndefined;
(global as any).mapNullable = mapNullable;
(global as any).mapNullableC = mapNullableC;
(global as any).match = match;
(global as any).Maybe = Maybe;
(global as any).memoizeFunction = memoizeFunction;
(global as any).noop = noop;
(global as any).Num = Num;
(global as any).objectIs = objectIs;
(global as any).pipe = pipe;
(global as any).range = range;
(global as any).Result = Result;
(global as any).Str = Str;
(global as any).toBoolean = toBoolean;
(global as any).tp = tp;
