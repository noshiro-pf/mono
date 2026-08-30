import { type ReadonlyRecord } from 'ts-type-forge';

export const isProduction = import.meta.env.PROD;

export const isDevelopment = import.meta.env.DEV;

export const useEmulators: boolean = true;

export const experimentalFeature = {} as const satisfies ReadonlyRecord<
  never,
  'hidden' | 'shown'
>;
