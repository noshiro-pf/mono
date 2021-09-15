/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { version } from '../package.json';
import { Collection } from './CollectionImpl';
import { fromJS } from './fromJS';
// Functional read/write API
import { get } from './functional/get';
import { getIn } from './functional/getIn';
import { has } from './functional/has';
import { hasIn } from './functional/hasIn';
import { merge, mergeDeep, mergeDeepWith, mergeWith } from './functional/merge';
import { remove } from './functional/remove';
import { removeIn } from './functional/removeIn';
import { set } from './functional/set';
import { setIn } from './functional/setIn';
import { update } from './functional/update';
import { updateIn } from './functional/updateIn';
import { hash } from './Hash';
import { is } from './is';
import { List } from './List';
import { Map } from './Map';
import { OrderedMap } from './OrderedMap';
import { OrderedSet } from './OrderedSet';
import { isAssociative } from './predicates/isAssociative';
import { isCollection } from './predicates/isCollection';
// Functional predicates
import { isImmutable } from './predicates/isImmutable';
import { isIndexed } from './predicates/isIndexed';
import { isKeyed } from './predicates/isKeyed';
import { isList } from './predicates/isList';
import { isMap } from './predicates/isMap';
import { isOrdered } from './predicates/isOrdered';
import { isOrderedMap } from './predicates/isOrderedMap';
import { isOrderedSet } from './predicates/isOrderedSet';
import { isRecord } from './predicates/isRecord';
import { isSeq } from './predicates/isSeq';
import { isSet } from './predicates/isSet';
import { isStack } from './predicates/isStack';
import { isValueObject } from './predicates/isValueObject';
import { Range } from './Range';
import { Record } from './Record';
import { Repeat } from './Repeat';
import { Seq } from './Seq';
import { Set } from './Set';
import { Stack } from './Stack';

export default {
  version: version,

  Collection: Collection,
  // Note: Iterable is deprecated
  Iterable: Collection,

  Seq: Seq,
  Map: Map,
  OrderedMap: OrderedMap,
  List: List,
  Stack: Stack,
  Set: Set,
  OrderedSet: OrderedSet,

  Record: Record,
  Range: Range,
  Repeat: Repeat,

  is: is,
  fromJS: fromJS,
  hash: hash,

  isImmutable: isImmutable,
  isCollection: isCollection,
  isKeyed: isKeyed,
  isIndexed: isIndexed,
  isAssociative: isAssociative,
  isOrdered: isOrdered,
  isValueObject: isValueObject,
  isSeq: isSeq,
  isList: isList,
  isMap: isMap,
  isOrderedMap: isOrderedMap,
  isStack: isStack,
  isSet: isSet,
  isOrderedSet: isOrderedSet,
  isRecord: isRecord,

  get: get,
  getIn: getIn,
  has: has,
  hasIn: hasIn,
  merge: merge,
  mergeDeep: mergeDeep,
  mergeWith: mergeWith,
  mergeDeepWith: mergeDeepWith,
  remove: remove,
  removeIn: removeIn,
  set: set,
  setIn: setIn,
  update: update,
  updateIn: updateIn,
};

// Note: Iterable is deprecated
const Iterable = Collection;

export {
  version,
  Collection,
  Iterable,
  Seq,
  Map,
  OrderedMap,
  List,
  Stack,
  Set,
  OrderedSet,
  Record,
  Range,
  Repeat,
  is,
  fromJS,
  hash,
  isImmutable,
  isCollection,
  isKeyed,
  isIndexed,
  isAssociative,
  isOrdered,
  isValueObject,
  get,
  getIn,
  has,
  hasIn,
  merge,
  mergeDeep,
  mergeWith,
  mergeDeepWith,
  remove,
  removeIn,
  set,
  setIn,
  update,
  updateIn,
};
