import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginDef = Obj.fromEntries(
  ['createRouter', 'withSlash'].map((key) =>
    tp(key, tp('@noshiro/tiny-router-observable', key))
  )
);
