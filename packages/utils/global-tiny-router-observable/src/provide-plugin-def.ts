import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginTinyRouterObservableDef = IRecord.fromEntries(
  ['createRouter', 'withSlash'].map((key) =>
    tp(key, ['@noshiro/tiny-router-observable', key])
  )
);
