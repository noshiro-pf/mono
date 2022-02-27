export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

export const experimentalFeature: ReadonlyRecord<
  'eventList' | 'googleAuth',
  'hidden' | 'shown'
> = {
  googleAuth: 'hidden',
  eventList: isDevelopment ? 'shown' : 'hidden',
} as const;
