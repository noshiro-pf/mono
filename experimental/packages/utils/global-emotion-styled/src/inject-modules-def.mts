import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  [{ default: 'styled' }].map((e) =>
    tp(
      typeof e === 'string' ? e : e.default,
      tp('@emotion/styled', typeof e === 'string' ? e : 'default'),
    ),
  ),
);
