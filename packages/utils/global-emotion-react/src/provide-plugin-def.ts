import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginDef = Obj.fromEntries(
  ['css'].map((key) => tp(key, tp('@emotion/react', key)))
);
