export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

export const experimentalFeature = {} as const;

assertType<
  TypeExtends<typeof experimentalFeature, Record<never, 'hidden' | 'shown'>>
>();
