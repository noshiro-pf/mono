import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  ['css'].map((key) => tp(key, tp('@emotion/react', key))),
);
