import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  ['useState', 'useBoolState'].map((key) =>
    tp(key, tp('better-react-use-state', key)),
  ),
);
