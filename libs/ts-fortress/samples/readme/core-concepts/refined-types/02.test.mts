/* eslint-disable security/detect-unsafe-regex */
// embed-sample-code-ignore-above
import * as t from 'ts-fortress';

// Domain-specific string types
const PhoneNumber = t.refine({
  baseType: t.string(),
  is: (s): s is string => /^\+?[\d\s()-]+$/u.test(s),
  defaultValue: '+1234567890',
  typeName: 'PhoneNumber',
});

const ZipCode = t.refine({
  baseType: t.string(),
  is: (s): s is string => /^\d{5}(-\d{4})?$/u.test(s),
  defaultValue: '12345',
  typeName: 'ZipCode',
});

// Constrained numeric types
const Percentage = t.refine({
  baseType: t.number(),
  is: (n): n is number => 0 <= n && n <= 100,
  defaultValue: 0,
  typeName: 'Percentage',
});

const Port = t.refine({
  baseType: t.number(3000),
  is: (n): n is number => Number.isInteger(n) && 1 <= n && n <= 65_535,
  defaultValue: 3000,
  typeName: 'Port',
});

// embed-sample-code-ignore-below
export { Percentage, PhoneNumber, Port, ZipCode };
