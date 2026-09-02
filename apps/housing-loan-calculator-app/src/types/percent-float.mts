import * as t from 'ts-fortress';

export const PercentFloat = t.brand({
  baseType: t.number(0, { min: 0, max: 100 }),
  defaultValue: 0,
  typeName: 'PercentFloat',
  brandKeys: ['PercentFloat'],
});

/**
 * @example
 *   0.5% , "12.3%"
 */
export type PercentFloat = t.TypeOf<typeof PercentFloat>;
