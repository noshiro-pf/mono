import type { ReadonlyRecord } from 'ts-type-forge';

export const isProduction = import.meta.env.PROD;

export const experimentalFeature = {} as const satisfies ReadonlyRecord<
  string,
  'hidden' | 'shown'
>;
