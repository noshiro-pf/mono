import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginTinyRouterObservableDef = Obj.fromEntries(
  ['createRouter', 'withSlash'].map((key) =>
    tp(key, ['@noshiro/tiny-router-observable', key])
  )
);
