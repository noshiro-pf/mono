import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginTinyRouterReactHooksDef = Obj.fromEntries(
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
    'withSlash',
  ].map((key) => tp(key, tp('@noshiro/tiny-router-react-hooks', key)))
);
