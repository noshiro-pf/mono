import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginDef = Obj.fromEntries(
  ['styled'].map((key) => tp(key, tp('@noshiro/goober', key)))
);
