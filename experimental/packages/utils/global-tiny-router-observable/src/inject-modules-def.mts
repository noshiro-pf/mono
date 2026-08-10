import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  ['createRouter'].map((key) =>
    tp(key, tp('@noshiro/tiny-router-observable', key)),
  ),
);
