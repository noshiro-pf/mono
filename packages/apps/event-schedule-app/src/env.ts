export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;

export const useEmulators: boolean = true;

export const experimentalFeature = {} as const satisfies Record<
  never,
  'hidden' | 'shown'
>;
