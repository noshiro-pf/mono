import { tp } from '@noshiro/ts-utils';

export const providePluginDef = Object.fromEntries(
  ['styled'].map((key) => tp(key, tp('@noshiro/goober', key)))
);
