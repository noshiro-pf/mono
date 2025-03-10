/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { KeyedCollection } from './Collection';
import { CollectionPrototype } from './CollectionImpl';
import { ITERATE_ENTRIES, ITERATOR_SYMBOL } from './Iterator';
import { List } from './List';
import { asImmutable } from './methods/asImmutable';
import { asMutable } from './methods/asMutable';
import { deleteIn } from './methods/deleteIn';
import { getIn } from './methods/getIn';
import { merge, mergeWith } from './methods/merge';
import { mergeDeep, mergeDeepWith } from './methods/mergeDeep';
import { mergeDeepIn } from './methods/mergeDeepIn';
import { mergeIn } from './methods/mergeIn';
import { setIn } from './methods/setIn';
import { update } from './methods/update';
import { updateIn } from './methods/updateIn';
import { withMutations } from './methods/withMutations';
import { IS_RECORD_SYMBOL, isRecord } from './predicates/isRecord';
import { keyedSeqFromValue } from './Seq';
import { toJS } from './toJS';
import { DELETE } from './TrieUtils';
import { invariant } from './utils/invariant';
import quoteString from './utils/quoteString';

export class Record {
  constructor(defaultValues, name) {
    let hasInitialized;

    const RecordType = function Record(values) {
      if (values instanceof RecordType) {
        return values;
      }
      if (!(this instanceof RecordType)) {
        return new RecordType(values);
      }
      if (!hasInitialized) {
        hasInitialized = true;
        const keys = Object.keys(defaultValues);
        const indices = (RecordTypePrototype._indices = {});
        // Deprecated: left to attempt not to break any external code which
        // relies on a ._name property existing on record instances.
        // Use Record.getDescriptiveName() instead
        RecordTypePrototype._name = name;
        RecordTypePrototype._keys = keys;
        RecordTypePrototype._defaultValues = defaultValues;
        for (let i = 0; i < keys.length; i++) {
          const propName = keys[i];
          indices[propName] = i;
          if (RecordTypePrototype[propName]) {
            /* eslint-disable no-console */
            typeof console === 'object' &&
              console.warn &&
              console.warn(
                'Cannot define ' +
                  recordName(this) +
                  ' with property "' +
                  propName +
                  '" since that property name is part of the Record API.',
              );
            /* eslint-enable no-console */
          } else {
            setProp(RecordTypePrototype, propName);
          }
        }
      }
      this.__ownerID = undefined;
      this._values = List().withMutations((l) => {
        l.setSize(this._keys.length);
        KeyedCollection(values).forEach((v, k) => {
          l.set(this._indices[k], v === this._defaultValues[k] ? undefined : v);
        });
      });
    };

    const RecordTypePrototype = (RecordType.prototype =
      Object.create(RecordPrototype));
    RecordTypePrototype.constructor = RecordType;

    if (name) {
      RecordType.displayName = name;
    }

    return RecordType;
  }

  toString() {
    let str = recordName(this) + ' { ';
    const keys = this._keys;
    let k;
    for (let i = 0, l = keys.length; i !== l; i++) {
      k = keys[i];
      str += (i ? ', ' : '') + k + ': ' + quoteString(this.get(k));
    }
    return str + ' }';
  }

  equals(other) {
    return (
      this === other ||
      (other &&
        this._keys === other._keys &&
        recordSeq(this).equals(recordSeq(other)))
    );
  }

  hashCode() {
    return recordSeq(this).hashCode();
  }

  // @pragma Access

  has(k) {
    return this._indices.hasOwnProperty(k);
  }

  get(k, notSetValue) {
    if (!this.has(k)) {
      return notSetValue;
    }
    const index = this._indices[k];
    const value = this._values.get(index);
    return value === undefined ? this._defaultValues[k] : value;
  }

  // @pragma Modification

  set(k, v) {
    if (this.has(k)) {
      const newValues = this._values.set(
        this._indices[k],
        v === this._defaultValues[k] ? undefined : v,
      );
      if (newValues !== this._values && !this.__ownerID) {
        return makeRecord(this, newValues);
      }
    }
    return this;
  }

  remove(k) {
    return this.set(k);
  }

  clear() {
    const newValues = this._values.clear().setSize(this._keys.length);
    return this.__ownerID ? this : makeRecord(this, newValues);
  }

  wasAltered() {
    return this._values.wasAltered();
  }

  toSeq() {
    return recordSeq(this);
  }

  toJS() {
    return toJS(this);
  }

  entries() {
    return this.__iterator(ITERATE_ENTRIES);
  }

  __iterator(type, reverse) {
    return recordSeq(this).__iterator(type, reverse);
  }

  __iterate(fn, reverse) {
    return recordSeq(this).__iterate(fn, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    const newValues = this._values.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._values = newValues;
      return this;
    }
    return makeRecord(this, newValues, ownerID);
  }
}

Record.isRecord = isRecord;
Record.getDescriptiveName = recordName;
const RecordPrototype = Record.prototype;
RecordPrototype[IS_RECORD_SYMBOL] = true;
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype.deleteIn = RecordPrototype.removeIn = deleteIn;
RecordPrototype.getIn = getIn;
RecordPrototype.hasIn = CollectionPrototype.hasIn;
RecordPrototype.merge = merge;
RecordPrototype.mergeWith = mergeWith;
RecordPrototype.mergeIn = mergeIn;
RecordPrototype.mergeDeep = mergeDeep;
RecordPrototype.mergeDeepWith = mergeDeepWith;
RecordPrototype.mergeDeepIn = mergeDeepIn;
RecordPrototype.setIn = setIn;
RecordPrototype.update = update;
RecordPrototype.updateIn = updateIn;
RecordPrototype.withMutations = withMutations;
RecordPrototype.asMutable = asMutable;
RecordPrototype.asImmutable = asImmutable;
RecordPrototype[ITERATOR_SYMBOL] = RecordPrototype.entries;
RecordPrototype.toJSON = RecordPrototype.toObject =
  CollectionPrototype.toObject;
RecordPrototype.inspect = RecordPrototype.toSource = function () {
  return this.toString();
};

function makeRecord(likeRecord, values, ownerID) {
  const record = Object.create(Object.getPrototypeOf(likeRecord));
  record._values = values;
  record.__ownerID = ownerID;
  return record;
}

function recordName(record) {
  return record.constructor.displayName || record.constructor.name || 'Record';
}

function recordSeq(record) {
  return keyedSeqFromValue(record._keys.map((k) => [k, record.get(k)]));
}

function setProp(prototype, name) {
  try {
    Object.defineProperty(prototype, name, {
      get: function () {
        return this.get(name);
      },
      set: function (value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      },
    });
  } catch (error) {
    // Object.defineProperty failed. Probably IE8.
  }
}
