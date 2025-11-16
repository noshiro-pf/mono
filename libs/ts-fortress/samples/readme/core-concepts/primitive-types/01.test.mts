import * as t from 'ts-fortress';

// Basic primitives
const stringType = t.string('default');

const numberType = t.number();

const booleanType = t.boolean(false);

const nullType = t.nullType;

const undefinedType = t.undefinedType;

// Literal types
const statusType = t.literal('active');

const versionType = t.literal(1);

// Arrays
const stringArrayType = t.array(t.string());

const nonEmptyArrayType = t.nonEmptyArray(t.number());

// Tuples
const coordinateType = t.tuple([t.number(), t.number()]);

// embed-sample-code-ignore-below
export {
  booleanType,
  coordinateType,
  nonEmptyArrayType,
  nullType,
  numberType,
  statusType,
  stringArrayType,
  stringType,
  undefinedType,
  versionType,
};
