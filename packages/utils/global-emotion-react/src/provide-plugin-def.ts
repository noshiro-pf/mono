import { tp } from '@noshiro/ts-utils';

export const providePluginDef = Object.fromEntries(
  ['css'].map((key) => tp(key, tp('@emotion/react', key)))
);
