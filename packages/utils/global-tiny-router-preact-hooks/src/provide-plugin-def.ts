import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginTinyRouterPreactHooksDef = Obj.fromEntries(
  [
    'back',
    'pathname$',
    'push',
    'queryParams$',
    'redirect',
    'removeListener',
    'usePathname',
    'useQueryParams',
    'useRouterLinkClick',
  ].map((key) => tp(key, tp('@noshiro/tiny-router-preact-hooks', key)))
);
