import { tp } from '@noshiro/ts-utils';

export const providePluginDef = Object.fromEntries(
  ['useRouterLinkClick'].map((key) =>
    tp(key, tp('@noshiro/tiny-router-react-hooks', key))
  )
);
