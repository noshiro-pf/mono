/* eslint-disable import/no-unused-modules */

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export const useEmulators: boolean = true as boolean;

export const experimentalFeature = {} as const;

expectType<typeof experimentalFeature, Record<never, 'hidden' | 'shown'>>('<=');
