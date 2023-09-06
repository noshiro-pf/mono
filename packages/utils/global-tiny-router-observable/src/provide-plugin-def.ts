import { tp } from '@noshiro/ts-utils';

export const providePluginDef = Object.fromEntries(
  ['createRouter'].map((key) =>
    tp(key, tp('@noshiro/tiny-router-observable', key))
  )
);
