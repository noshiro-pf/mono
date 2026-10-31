import * as t from 'ts-fortress';

export const minPercent = 0;

export const maxPercent = 100;

export const PercentFloat = t.brand({
  baseType: t.number(0, { min: minPercent, max: maxPercent }),
  defaultValue: 0,
  typeName: 'PercentFloat',
  brandKeys: ['PercentFloat'],
});

/**
 * @example
 *   0.5% , "12.3%"
 */
export type PercentFloat = t.TypeOf<typeof PercentFloat>;
