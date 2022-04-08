import type {
  assertNotType as _assertNotType,
  assertNotUndefined as _assertNotUndefined,
  assertType as _assertType,
  castWritable as _castWritable,
  createQueue as _createQueue,
  createTinyObservable as _createTinyObservable,
  Err as _Err,
  hasKey as _hasKey,
  hasKeyValue as _hasKeyValue,
  IDate as _IDate,
  idfn as _idfn,
  ifThen as _ifThen,
  IList as _IList,
  IMap as _IMap,
  IMapMapped as _IMapMapped,
  IRecord as _IRecord,
  isBoolean as _isBoolean,
  ISet as _ISet,
  ISetMapped as _ISetMapped,
  isNonNullObject as _isNonNullObject,
  isNotBoolean as _isNotBoolean,
  isNotNull as _isNotNull,
  isNotNumber as _isNotNumber,
  isNotString as _isNotString,
  isNotSymbol as _isNotSymbol,
  isNotUndefined as _isNotUndefined,
  isNull as _isNull,
  isNumber as _isNumber,
  isPrimitive as _isPrimitive,
  isString as _isString,
  isSymbol as _isSymbol,
  isUndefined as _isUndefined,
  mapNullable as _mapNullable,
  mapNullableC as _mapNullableC,
  match as _match,
  Maybe as _Maybe,
  memoizeFunction as _memoizeFunction,
  None as _None,
  noop as _noop,
  Num as _Num,
  objectIs as _objectIs,
  Ok as _Ok,
  pipe as _pipe,
  Queue as _Queue,
  range as _range,
  Result as _Result,
  Some as _Some,
  Str as _Str,
  Subscription as _Subscription,
  TinyObservable as _TinyObservable,
  TinyObservableSource as _TinyObservableSource,
  toBoolean as _toBoolean,
  tp as _tp,
} from '@noshiro/ts-utils';

declare global {
  const assertNotType: typeof _assertNotType;
  const assertNotUndefined: typeof _assertNotUndefined;
  const assertType: typeof _assertType;
  const castWritable: typeof _castWritable;
  const createQueue: typeof _createQueue;
  const createTinyObservable: typeof _createTinyObservable;
  const hasKey: typeof _hasKey;
  const hasKeyValue: typeof _hasKeyValue;
  const idfn: typeof _idfn;
  const ifThen: typeof _ifThen;
  const isBoolean: typeof _isBoolean;
  const isNonNullObject: typeof _isNonNullObject;
  const isNotBoolean: typeof _isNotBoolean;
  const isNotNull: typeof _isNotNull;
  const isNotNumber: typeof _isNotNumber;
  const isNotString: typeof _isNotString;
  const isNotSymbol: typeof _isNotSymbol;
  const isNotUndefined: typeof _isNotUndefined;
  const isNull: typeof _isNull;
  const isNumber: typeof _isNumber;
  const isPrimitive: typeof _isPrimitive;
  const isString: typeof _isString;
  const isSymbol: typeof _isSymbol;
  const isUndefined: typeof _isUndefined;
  const mapNullable: typeof _mapNullable;
  const mapNullableC: typeof _mapNullableC;
  const match: typeof _match;
  const memoizeFunction: typeof _memoizeFunction;
  const noop: typeof _noop;
  const objectIs: typeof _objectIs;
  const pipe: typeof _pipe;
  const range: typeof _range;
  const toBoolean: typeof _toBoolean;
  const tp: typeof _tp;

  const IDate: typeof _IDate;
  const IList: typeof _IList;
  const IMap: typeof _IMap;
  const IMapMapped: typeof _IMapMapped;
  const IRecord: typeof _IRecord;
  const ISet: typeof _ISet;
  const ISetMapped: typeof _ISetMapped;
  const Maybe: typeof _Maybe;
  const Num: typeof _Num;
  const Result: typeof _Result;
  const Str: typeof _Str;
  type Err<E> = _Err<E>;
  type IDate = _IDate;
  type IMap<K, V> = _IMap<K, V>;
  type IMapMapped<K, V, KM extends RecordKeyType> = _IMapMapped<K, V, KM>;
  type ISet<S> = _ISet<S>;
  type ISetMapped<K, KM extends RecordKeyType> = _ISetMapped<K, KM>;
  type Maybe<S> = _Maybe<S>;
  type None = _None;
  type Ok<S> = _Ok<S>;
  type Queue<T> = _Queue<T>;
  type Result<S, E> = _Result<S, E>;
  type Some<S> = _Some<S>;
  type Subscription = _Subscription;
  type TinyObservable<T> = _TinyObservable<T>;
  type TinyObservableSource<T> = _TinyObservableSource<T>;
}
