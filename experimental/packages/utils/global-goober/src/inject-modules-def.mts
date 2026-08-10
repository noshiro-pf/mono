import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  ['styled'].map((key) => tp(key, tp('@noshiro/goober', key))),
);
