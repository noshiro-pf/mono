import { brandedNumber, type TypeOf } from 'ts-fortress';

export const PercentFloat = brandedNumber({
  typeName: 'PercentFloat',
  defaultValue: 0,
});

/**
 * @example
 *   0.5% , "12.3%"
 */
export type PercentFloat = TypeOf<typeof PercentFloat>;
