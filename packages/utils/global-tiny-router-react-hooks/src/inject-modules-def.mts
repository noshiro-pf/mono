import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  ['useRouterLinkClick', 'createRouterLinkClickHandler'].map((key) =>
    tp(key, tp('@noshiro/tiny-router-react-hooks', key)),
  ),
);
