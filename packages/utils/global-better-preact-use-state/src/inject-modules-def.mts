import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  ['useBoolState', 'useState'].map((key) =>
    tp(key, tp('better-preact-use-state', key)),
  ),
);
