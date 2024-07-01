export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export const experimentalFeature = {} as const;

expectType<typeof experimentalFeature, Record<never, 'hidden' | 'shown'>>('<=');
